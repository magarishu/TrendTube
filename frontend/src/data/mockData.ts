export interface Video {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  views: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  trendingVideos: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  videoCount: number;
  trending: boolean;
}

export const mockVideos: Video[] = [
  { id: "1", title: "GPT-5 Changes Everything — Here's What You Need to Know", channel: "Tech Insider", channelId: "c1", views: "2.4M", publishedAt: "3 hours ago", thumbnail: "", duration: "14:23", category: "Technology" },
  { id: "2", title: "I Built a $10M Business in 12 Months — Full Breakdown", channel: "Graham Stephan", channelId: "c2", views: "1.8M", publishedAt: "5 hours ago", thumbnail: "", duration: "22:10", category: "Finance" },
  { id: "3", title: "GTA 6 Trailer 3 Breakdown — Every Detail You Missed", channel: "MrBeast Gaming", channelId: "c3", views: "5.1M", publishedAt: "1 hour ago", thumbnail: "", duration: "18:45", category: "Gaming" },
  { id: "4", title: "This Movie Broke Every Box Office Record", channel: "CineFix", channelId: "c4", views: "3.2M", publishedAt: "8 hours ago", thumbnail: "", duration: "11:30", category: "Entertainment" },
  { id: "5", title: "Quantum Computing Explained in 10 Minutes", channel: "Kurzgesagt", channelId: "c5", views: "4.7M", publishedAt: "2 hours ago", thumbnail: "", duration: "10:02", category: "Education" },
  { id: "6", title: "React Server Components Deep Dive — 2026 Guide", channel: "Fireship", channelId: "c6", views: "890K", publishedAt: "6 hours ago", thumbnail: "", duration: "12:15", category: "Technology" },
  { id: "7", title: "The Stock Market Crash Nobody Saw Coming", channel: "Meet Kevin", channelId: "c7", views: "1.2M", publishedAt: "4 hours ago", thumbnail: "", duration: "25:30", category: "Finance" },
  { id: "8", title: "Minecraft 2.0 — First Look Gameplay", channel: "Dream", channelId: "c8", views: "6.3M", publishedAt: "30 min ago", thumbnail: "", duration: "32:00", category: "Gaming" },
  { id: "9", title: "Why 90% of Startups Fail — Lessons from Y Combinator", channel: "Ali Abdaal", channelId: "c9", views: "1.5M", publishedAt: "7 hours ago", thumbnail: "", duration: "19:45", category: "Education" },
  { id: "10", title: "The New Marvel Movie That Changes the MCU Forever", channel: "Screen Junkies", channelId: "c10", views: "2.8M", publishedAt: "10 hours ago", thumbnail: "", duration: "15:20", category: "Entertainment" },
  { id: "11", title: "Apple Vision Pro 2 — Is It Worth It?", channel: "MKBHD", channelId: "c11", views: "3.9M", publishedAt: "12 hours ago", thumbnail: "", duration: "16:40", category: "Technology" },
  { id: "12", title: "How to Learn Anything 10x Faster", channel: "Thomas Frank", channelId: "c12", views: "2.1M", publishedAt: "9 hours ago", thumbnail: "", duration: "13:55", category: "Education" },
];

export const mockCreators: Creator[] = [
  { id: "c1", name: "MKBHD", avatar: "", subscribers: "22M", trendingVideos: 5, category: "Technology" },
  { id: "c2", name: "MrBeast", avatar: "", subscribers: "310M", trendingVideos: 8, category: "Entertainment" },
  { id: "c3", name: "Fireship", avatar: "", subscribers: "3.2M", trendingVideos: 4, category: "Technology" },
  { id: "c4", name: "Graham Stephan", avatar: "", subscribers: "4.8M", trendingVideos: 3, category: "Finance" },
  { id: "c5", name: "Kurzgesagt", avatar: "", subscribers: "23M", trendingVideos: 2, category: "Education" },
  { id: "c6", name: "Dream", avatar: "", subscribers: "32M", trendingVideos: 6, category: "Gaming" },
];

export const mockCategories: Category[] = [
  { id: "tech", name: "Technology", icon: "Monitor", videoCount: 1240, trending: true },
  { id: "gaming", name: "Gaming", icon: "Gamepad2", videoCount: 2100, trending: true },
  { id: "finance", name: "Finance", icon: "TrendingUp", videoCount: 890, trending: true },
  { id: "entertainment", name: "Entertainment", icon: "Film", videoCount: 3200, trending: false },
  { id: "education", name: "Education", icon: "GraduationCap", videoCount: 1560, trending: true },
];

export const trendData = [
  { date: "Mon", tech: 120, gaming: 200, finance: 80, entertainment: 150, education: 90 },
  { date: "Tue", tech: 150, gaming: 180, finance: 95, entertainment: 170, education: 110 },
  { date: "Wed", tech: 180, gaming: 220, finance: 120, entertainment: 140, education: 130 },
  { date: "Thu", tech: 200, gaming: 190, finance: 140, entertainment: 200, education: 100 },
  { date: "Fri", tech: 250, gaming: 300, finance: 110, entertainment: 250, education: 150 },
  { date: "Sat", tech: 280, gaming: 350, finance: 130, entertainment: 300, education: 170 },
  { date: "Sun", tech: 320, gaming: 400, finance: 160, entertainment: 280, education: 200 },
];

export const trendingKeywords = [
  { text: "AI", value: 100 },
  { text: "GPT-5", value: 90 },
  { text: "React", value: 70 },
  { text: "GTA 6", value: 85 },
  { text: "Crypto", value: 60 },
  { text: "Minecraft", value: 75 },
  { text: "Apple", value: 65 },
  { text: "Startups", value: 55 },
  { text: "Marvel", value: 50 },
  { text: "Quantum", value: 45 },
  { text: "Tesla", value: 58 },
  { text: "Python", value: 62 },
  { text: "Netflix", value: 48 },
  { text: "SpaceX", value: 52 },
  { text: "Stocks", value: 42 },
];
