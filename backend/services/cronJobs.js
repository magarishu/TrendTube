import cron from 'node-cron';
import { collectTrendingVideos, collectVideosByKeyword, updateVideoMetrics } from './dataCollector.js';

let cronJobs = [];

export function initializeCronJobs() {
  console.log('[Cron Jobs] Initializing...');

  // Fetch trending videos every 1 hour
  const trendingJob = cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Cron] Running: Fetch trending videos');
      await collectTrendingVideos('US', 50);
    } catch (error) {
      console.error('[Cron] Error fetching trending videos:', error.message);
    }
  });
  cronJobs.push(trendingJob);
  console.log('✓ Scheduled: Fetch trending videos every hour');

  // Fetch trending videos in other regions every 3 hours
  const regionJob = cron.schedule('0 */3 * * *', async () => {
    try {
      console.log('[Cron] Running: Fetch trending videos from multiple regions');
      const regions = ['GB', 'IN', 'BR', 'DE'];
      for (const region of regions) {
        await collectTrendingVideos(region, 30);
      }
    } catch (error) {
      console.error('[Cron] Error fetching regional videos:', error.message);
    }
  });
  cronJobs.push(regionJob);
  console.log('✓ Scheduled: Fetch regional trending videos every 3 hours');

  // Update metrics for existing videos every 6 hours
  const metricsJob = cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('[Cron] Running: Update video metrics');
      await updateVideoMetrics();
    } catch (error) {
      console.error('[Cron] Error updating metrics:', error.message);
    }
  });
  cronJobs.push(metricsJob);
  console.log('✓ Scheduled: Update video metrics every 6 hours');

  // Search for trending keywords every 12 hours
  const keywordJob = cron.schedule('0 */12 * * *', async () => {
    try {
      console.log('[Cron] Running: Collect trending keywords');
      const trendingKeywords = [
        'AI',
        'technology',
        'tutorial',
        'gaming',
        'music',
        'crypto',
        'machine learning',
        'web development',
      ];

      for (const keyword of trendingKeywords) {
        await collectVideosByKeyword(keyword, 30);
      }
    } catch (error) {
      console.error('[Cron] Error collecting keywords:', error.message);
    }
  });
  cronJobs.push(keywordJob);
  console.log('✓ Scheduled: Collect trending keywords every 12 hours');

  console.log('[Cron Jobs] ✓ All jobs initialized');
}

export function stopCronJobs() {
  console.log('[Cron Jobs] Stopping all jobs...');
  cronJobs.forEach((job) => job.stop());
  cronJobs = [];
  console.log('[Cron Jobs] ✓ All jobs stopped');
}

export default {
  initializeCronJobs,
  stopCronJobs,
};
