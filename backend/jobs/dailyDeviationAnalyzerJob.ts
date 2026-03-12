import cron from 'node-cron';
import User from '../models/user.js';
import IKDDailyStat from '../models/IKDDailyStat.js';
import IKDBaselineProfile from '../models/IKDBaselineProfile.js';
import IKDDailyAnalysis from '../models/IKDDailyAnalysis.js';

export const startDailyDeviationAnalyzer = () => {
    // Runs at 02:00 server time (after daily aggregation and baseline init)
    cron.schedule('0 2 * * *', async () => {
        console.log('[Deviation Analyzer] Starting daily deviation processing at 02:00...');
        try {
            const now = new Date();
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

            // Find all users who have a locked baseline
            const users = await User.find({ baselineLocked: true }, '_id');

            for (const user of users) {
                // Fetch the baseline profile
                const baseline = await IKDBaselineProfile.findOne({ userId: user._id });
                if (!baseline) {
                    console.warn(`[Deviation Analyzer] User ${user._id} has baselineLocked but no profile found. Skipping.`);
                    continue;
                }

                // Defensive Logic: 3-day inactivity check
                const threeDaysAgo = new Date(startOfYesterday);
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                const recentStatsCount = await IKDDailyStat.countDocuments({
                    userId: user._id,
                    date: { $gte: threeDaysAgo, $lte: startOfYesterday }
                });

                if (recentStatsCount === 0) {
                    await IKDDailyAnalysis.findOneAndUpdate(
                        { userId: user._id, date: startOfYesterday },
                        {
                            today_mean: null,
                            z_score: null,
                            percentage_change: null,
                            status: 'insufficient data'
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`[Deviation Analyzer] User ${user._id}: Inactive for 3+ days. Status set to insufficient data.`);
                    continue;
                }

                // Fetch "yesterday's" daily stat
                const dailyStat = await IKDDailyStat.findOne({
                    userId: user._id,
                    date: startOfYesterday,
                    is_baseline_day: false
                });

                if (!dailyStat) {
                    // Not active exactly yesterday but active recently. Skip analysis for the day
                    continue;
                }

                const today_mean = dailyStat.mean_ikd;
                const baseline_mean = baseline.baseline_mean;
                const baseline_std = baseline.baseline_std;

                let z_score = null;
                let percentage_change = null;
                let status = 'normal';

                // Protect against divide-by-zero if mean is exactly 0
                if (baseline_mean !== 0) {
                    percentage_change = ((today_mean - baseline_mean) / baseline_mean) * 100;
                }

                // Defensive Logic: Prevent Division Explosion
                if (baseline_std < 5) {
                    // Variance is suspiciously tight, z-score math will be explosive/invalid.
                    console.warn(`[Deviation Analyzer] User ${user._id} has baseline_std < 5ms. Defaulting to normal.`);
                } else {
                    z_score = (today_mean - baseline_mean) / baseline_std;
                    const abs_z = Math.abs(z_score);

                    if (abs_z >= 2) {
                        status = 'significant deviation';
                    } else if (abs_z >= 1) {
                        status = 'mild deviation';
                    }
                }

                // Store in ikd_daily_analysis table
                await IKDDailyAnalysis.findOneAndUpdate(
                    { userId: user._id, date: startOfYesterday },
                    {
                        today_mean,
                        z_score,
                        percentage_change,
                        status
                    },
                    { upsert: true, new: true }
                );

                console.log(`[Deviation Analyzer] User ${user._id} analyzed. Z: ${z_score !== null ? z_score.toFixed(2) : 'N/A'}, Status: ${status}`);
            }

            console.log('[Deviation Analyzer] Completed successfully.');
        } catch (error) {
            console.error('[Deviation Analyzer] Error during processing:', error);
        }
    });
};
