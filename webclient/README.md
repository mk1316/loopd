# Loopd Digital Wellness Dashboard

A comprehensive digital wellness platform built with Next.js, React, and TypeScript. Track your screen time, set goals, manage app blocking, and improve your digital habits.

## Features

- 📊 **Dashboard**: Overview of daily screen time, active blocks, goals, and focus score
- 🎯 **Goals**: Set and track digital wellness goals with progress monitoring
- ⚡ **Insights**: AI-powered insights and recommendations for better digital habits
- 🕐 **Timeline**: Visual timeline of your daily app usage patterns
- 👥 **Community**: Achievement system with badges, streaks, and leaderboards
- 🛡️ **Block Lists**: Create and manage website/app blocking rules
- 📱 **Devices**: Multi-device management and monitoring
- ⚙️ **Settings**: Comprehensive settings for notifications, blocking, appearance, and privacy
- 👤 **Profile**: User profile management and customization
- 💳 **Billing**: Subscription management and billing history

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd loopd-digital-wellness
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
loopd-digital-wellness/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── app-details-modal.tsx
│   ├── billing-page.tsx
│   ├── block-lists-page.tsx
│   ├── blocker-screen.tsx
│   ├── community-page.tsx
│   ├── devices-page.tsx
│   ├── goal-management.tsx
│   ├── goals-page.tsx
│   ├── insights-page.tsx
│   ├── profile-settings-page.tsx
│   ├── settings-page.tsx
│   └── timeline-page.tsx
├── lib/                   # Utility functions and types
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features Overview

### Dashboard
- Real-time screen time tracking
- Active blocking status
- Goal progress monitoring
- Focus score calculation
- Recent app activity

### Goals Management
- Create custom digital wellness goals
- Track progress with visual indicators
- Set deadlines and priorities
- Goal categories and templates

### Timeline
- Hourly breakdown of app usage
- Visual timeline with color-coded intensity
- Filter by apps, categories, and devices
- Usage pattern analysis

### Community
- Achievement system with rarity levels
- Streak tracking and maintenance
- Global leaderboards
- Challenge participation

### Block Lists
- Custom website and app blocking
- Scheduled blocking rules
- Device-specific configurations
- Import/export functionality

## Customization

The project uses a dark navy theme with purple accents. Colors can be customized in:
- `app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
