# TrendTube Analytics: Comprehensive Project Report

## 1. Project Overview
**TrendTube Analytics** is a robust, full-stack application designed to empower YouTube creators and analysts by providing deep insights into video performance. The application bridges standard video metrics with advanced analytics, helping creators optimize their content strategy through audience retention curves, earnings estimations, and AI-driven insights.

---

## 2. Technology Stack
The project is built on a modern JavaScript/TypeScript stack:

### **Frontend**
- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS, `shadcn/ui` components
- **Routing:** React Router DOM
- **Data Fetching:** React Query (`@tanstack/react-query`), Axios
- **Data Visualization:** Recharts, Embla Carousel
- **Language:** TypeScript

### **Backend**
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Anthropic AI SDK (`@anthropic-ai/sdk`)
- **Other Utilities:** `node-cron` for scheduled tasks, `dotenv` for environment management, `cors` for cross-origin sharing.

---

## 3. Core Features & Capabilities

The application boasts several powerful tabs tailored for granular video analysis:

- **Audience Retention Tracking:** Provides a 7-point retention curve allowing creators to identify where viewers drop off. Includes calculations for average view duration and gives optimization suggestions for hooks.
- **Earnings Estimator:** Predicts real earnings based on actual video views by calculating adjustable CPM rates per country (US, UK, Germany, India) and niche (Tech, Finance, Gaming, etc.).
- **Similar Videos & Discovery:** Finds videos with similar tags and content, comparing engagement rates and Click-Through Rates (CTR).
- **Outlier Detection:** Identifies videos that are performing exceptionally well across the channel average by tracking 24-hour view velocity, calculating 7-day growth, and scoring outliers.
- **AI-Powered Title & Thumbnail Analysis:** Empowers users to receive intelligent suggestions for optimizing titles and thumbnails. Evaluates variations for A/B testing utilizing backend API services.
- **Interactive Dashboard:** Offers sidebars for exploring categories, specific creators, and robust test data seeded for immediate testing.

---

## 4. Architecture & Data Flow
The architecture follows a standard client-server model communicating via REST APIs:
1. **Client Request:** The React SPA requests data via Axios across endpoints such as `/api/analytics/video/:videoId/retention` and `/api/analytics/trending`.
2. **Controller Logic:** Express controllers handle the execution, frequently communicating with MongoDB to retrieve aggregated metrics.
3. **AI Enhancement Layer:** For thumbnail suggestions and dynamic insights, the backend proxies data to an external AI service (Anthropic API).
4. **Data Rendering:** The React interface consumes the updated configurations and visualizes performance patterns utilizing robust `recharts` plotting.

---

## 5. Current Implementation Status
The project is actively maintained and currently features localized environments ready for deployment.
- **Local Development Environment:** Verified and running perfectly. Frontend is exposed on port `8081` and Backend on port `5000`.
- **Database Setup:** Built-in seed scripts (`seedTestData.js`) ensure that test data (including realistic views, retention decays, and varying CTRs) is available right away without needing to rely on live production scraping for the demo.
- **Testing Capabilities:** The project actively incorporates testing mechanisms (Vitest) configured on the frontend.

---

## 6. Setup & Execution Instructions

**Start the Backend Engine:**
```powershell
cd backend
node server.js
```

**Start the Frontend Engine:**
```powershell
cd frontend
npm run dev
```

**Ensure test data is populated:**
```powershell
cd backend
node scripts/seedTestData.js
```

---

*Report Automatically Generated regarding the state of TrendTube*
