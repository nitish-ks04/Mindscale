import cron from 'node-cron';
import User from '../models/user.js';
import IKDEvent from '../models/IKDEvent.js';
import IKDDailyStat from '../models/IKDDailyStat.js';

/**
 * Calculates statistically relevant metrics from an array of numbers.
 */
function calculateStats(ikdArray: number[]) {
    ikdArray.sort((a, b) => a - b);
    const count = ikdArray.length;
    const sum = ikdArray.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Median
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? ikdArray[mid] : (ikdArray[mid - 1] + ikdArray[mid]) / 2;

    // Standard Deviation
    const sqDiffs = ikdArray.map(value => {
        const diff = value - mean;
        return diff * diff;
    });
    const avgSqDiff = sqDiffs.reduce((acc, val) => acc + val, 0) / count;
    const stdDev = Math.sqrt(avgSqDiff);

    // Percentiles
    const p25 = ikdArray[Math.floor(count * 0.25)];
    const p75 = ikdArray[Math.floor(count * 0.75)];

    return { mean, median, stdDev, p25, p75, count };
}

/**
 * The daily aggregation job that processes IKD events.
 */
export const startDailyAggregationJob = () => {
    // Runs at 00:00 server time
    cron.schedule('0 0 * * *', async () => {
        console.log('[IKD Aggregation Job] Starting daily processing at 00:00...');

        try {
            // Process primarily for "yesterday's" full day of data
            const now = new Date();
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Fetch all users
            const users = await User.find({}, '_id');

            for (const user of users) {
                // Fetch all ikd_events for that date mapping
                const events = await IKDEvent.find({
                    userId: user._id,
                    createdAt: { $gte: startOfYesterday, $lt: startOfToday }
                }).select('ikd');

                // If count < 200: Skip analysis
                if (events.length < 200) {
                    console.log(`[IKD Aggregation] User ${user._id}: Insufficient events (${events.length}). Skipping analysis.`);
                    continue;
                }

                // Map pure metrics array to calculate
                const ikdValues = events.map(e => e.ikd);
                const stats = calculateStats(ikdValues);

                // Determine user account age using Mongo's innate ObjectId timestamp
                const userCreatedAt = (user._id as any).getTimestamp();

                // Diff in ms -> days
                const accountAgeMs = startOfYesterday.getTime() - userCreatedAt.getTime();
                // We use Math.max(0, ...) in case the user registered literally today/yesterday 
                const accountAgeDays = Math.max(0, Math.floor(accountAgeMs / (1000 * 60 * 60 * 24)));

                // If user account age <= 3 days mark is_baseline_day = true
                const is_baseline_day = accountAgeDays <= 3;

                // Insert into ikd_daily_stats
                await IKDDailyStat.findOneAndUpdate(
                    { userId: user._id, date: startOfYesterday },
                    {
                        eventCount: stats.count,
                        mean_ikd: stats.mean,
                        median_ikd: stats.median,
                        std_dev: stats.stdDev,
                        p25: stats.p25,
                        p75: stats.p75,
                        is_baseline_day: is_baseline_day
                    },
                    { upsert: true, new: true }
                );

                console.log(`[IKD Aggregation] User ${user._id}: Saved daily stats (${stats.count} events). Baseline: ${is_baseline_day}`);

                // If day > 3: delete raw ikd_events for that date
                if (!is_baseline_day) {
                    const deleteResult = await IKDEvent.deleteMany({
                        userId: user._id,
                        createdAt: { $gte: startOfYesterday, $lt: startOfToday }
                    });
                    console.log(`[IKD Aggregation] User ${user._id}: Deleted ${deleteResult.deletedCount} raw events past baseline period.`);
                }
            }
            console.log('[IKD Aggregation Job] Completed successfully.');
        } catch (error) {
            console.error('[IKD Aggregation Job] Error during processing:', error);
        }
    });
};
