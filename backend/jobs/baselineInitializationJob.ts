import cron from 'node-cron';
import User from '../models/user.js';
import IKDDailyStat from '../models/IKDDailyStat.js';
import IKDBaselineProfile from '../models/IKDBaselineProfile.js';

export const startBaselineInitializationJob = () => {
    // Runs at 01:00 server time (an hour after the daily raw aggregation)
    cron.schedule('0 1 * * *', async () => {
        console.log('[Baseline Job] Starting baseline initialization at 01:00...');
        try {
            // Find users who have NOT had their baseline locked yet
            const users = await User.find({
                $or: [{ baselineLocked: false }, { baselineLocked: { $exists: false } }]
            }, '_id');

            for (const user of users) {
                // Fetch all baseline days computed by the daily aggregation job
                const baselineStats = await IKDDailyStat.find({
                    userId: user._id,
                    is_baseline_day: true
                });

                // Exactly 3 baseline days check (or >=3 if something stalled for a day)
                if (baselineStats.length >= 3) {
                    // Pull exactly the first 3
                    const targetStats = baselineStats.slice(0, 3);

                    const sumMean = targetStats.reduce((acc, stat) => acc + stat.mean_ikd, 0);
                    const sumStd = targetStats.reduce((acc, stat) => acc + stat.std_dev, 0);
                    const sumP25 = targetStats.reduce((acc, stat) => acc + stat.p25, 0);
                    const sumP75 = targetStats.reduce((acc, stat) => acc + stat.p75, 0);

                    // Compute true averages
                    const baseline_mean = sumMean / 3;
                    const baseline_std = sumStd / 3;
                    const baseline_p25 = sumP25 / 3;
                    const baseline_p75 = sumP75 / 3;

                    // Insert or overwrite into ikd_baseline_profile
                    await IKDBaselineProfile.findOneAndUpdate(
                        { userId: user._id },
                        {
                            baseline_mean,
                            baseline_std,
                            baseline_p25,
                            baseline_p75
                        },
                        { upsert: true, new: true }
                    );

                    // Mark baselineLocked = true directly back onto the User model
                    await User.findByIdAndUpdate(user._id, { baselineLocked: true });

                    console.log(`[Baseline Job] User ${user._id}: Successfully computed and locked baseline profile.`);
                }
            }
            console.log('[Baseline Job] Completed successfully.');
        } catch (error) {
            console.error('[Baseline Job] Error during processing:', error);
        }
    });
};
