# Loopd - Cross-Platform Digital Wellness & Productivity Tracker

A powerful desktop application built with Tauri that tracks application usage, provides digital wellness insights, and syncs data across devices in real-time with comprehensive cloud integration.

## 🚀 Features

- **Real-time App Tracking**: Monitors active applications and window titles across Windows, macOS, and Linux
- **Cloud Sync**: Seamless data synchronization across devices using Supabase with automatic batch syncing
- **Digital Wellness**: Track your digital habits and productivity patterns with analytics
- **Live Dashboard**: Real-time usage statistics and productivity insights
- **Timeline View**: Chronological, detailed view of all app usage events
- **Cross-Platform**: Native performance on Windows, macOS, and Linux
- **User Authentication**: Secure login and session management with Supabase Auth
- **Device Management**: Track usage across multiple devices with unique device IDs
- **Data Management**: Clear usage data and manage your digital footprint
- **Error Handling**: Robust error handling with retry logic and user-friendly messages
- **Analytics**: Usage statistics, productivity scoring, and insights
- **Production Ready**: Comprehensive production setup and deployment guides

## 🛠 Technology Stack

### Backend
- **Rust** with Tauri 2.6 for cross-platform desktop functionality
- **SQLite** for local data storage with SQLx
- **Platform-specific APIs** for app detection:
  - Windows: Win32 API
  - macOS: Cocoa/Objective-C APIs
  - Linux: X11 APIs

### Frontend
- **Next.js 15** with TypeScript and React 19
- **Tailwind CSS** for modern, responsive UI
- **Lucide React** for beautiful icons
- **Class Variance Authority** for component styling

### Cloud Infrastructure
- **Supabase** for authentication, real-time database, and cloud sync
- **PostgreSQL** for data persistence with Row Level Security (RLS)
- **Real-time subscriptions** for live updates across devices
- **Error handling** with comprehensive logging and retry mechanisms

## 📦 Installation

### Prerequisites

- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo) - version 1.77.2 or higher
- **Platform-specific development tools**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials and X11 development libraries

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd loopd/desktop-app
   ```

2. **Set up Supabase** (recommended for full functionality):
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Create a `.env.local` file with your credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```
   - Run the database setup SQL (see [docs/production-setup.md](docs/production-setup.md))

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run tauri dev
   ```

### Building for Production

```bash
npm run tauri build
```

## 🏗 Architecture

### Core Components

1. **UsageTracker** (`src-tauri/src/usage.rs`): Monitors active applications using OS-specific APIs
2. **Database Layer** (`src-tauri/src/database.rs`): Manages local SQLite storage and Supabase sync
3. **Supabase Client** (`src-tauri/src/supabase.rs`): Cloud synchronization with authenticated requests
4. **App State Management** (`src-tauri/src/lib.rs`): Coordinates between frontend and backend
5. **Error Handling** (`src/lib/errorHandling.ts`): Comprehensive error management and logging
6. **Analytics** (`src/lib/analytics.ts`): Usage statistics and productivity scoring

### Data Flow

```
OS Active App → Rust Backend → Local SQLite → Supabase Sync → Other Devices
     ↓              ↓              ↓              ↓              ↓
Tauri Events → React Frontend → Real-time UI → Cloud Database → Cross-device Sync
     ↓              ↓              ↓              ↓              ↓
Error Handling → Analytics → Productivity Score → User Insights → Data Management
```

## 🎯 Usage

### Getting Started

1. **Launch the application** - tracking begins automatically
2. **Sign in or create an account** - using Supabase authentication
3. **View real-time data** - see which apps you're currently using
4. **Monitor sync status** - automatic background sync every 30 seconds
5. **Explore analytics** - productivity insights and usage patterns

### Key Features

- **Live Tracking**: See your current active application in real-time
- **Usage History**: View detailed breakdown of time spent per app per day
- **Device Identification**: Unique device IDs for multi-device tracking
- **Data Management**: Clear all usage data with one click
- **Cloud Sync**: Automatic synchronization across all your devices
- **Error Recovery**: Robust error handling with automatic retries
- **Productivity Insights**: AI-powered productivity scoring and recommendations

## 🔧 Development

### Project Structure

```
desktop-app/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (UserContext)
│   ├── hooks/             # Custom React hooks (useSync, useAppTracking)
│   ├── lib/               # Utility functions and Supabase client
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main application logic
│   │   ├── usage.rs       # Usage tracking implementation
│   │   ├── database.rs    # Database operations and sync
│   │   ├── supabase.rs    # Supabase client and API calls
│   │   └── main.rs        # Entry point
│   ├── migrations/        # Database migrations
│   └── Cargo.toml         # Rust dependencies
├── docs/                  # Project documentation
│   ├── prd.md            # Product Requirements Document
│   ├── architecture.md   # Technical architecture
│   ├── roadmap.md        # Development roadmap
│   ├── setup-guide.md    # Detailed setup instructions
│   ├── production-setup.md # Production deployment guide
│   ├── storage-architecture.md # Database and storage design
│   └── development-priorities.md # Current development focus
└── public/               # Static assets
```

### Key Commands

- `npm run tauri dev` - Start development server
- `npm run tauri build` - Build for production
- `npm run dev` - Start Next.js dev server only
- `npm run build` - Build Next.js frontend only
- `npm run export` - Export static files for Tauri
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📚 Documentation

- **[Product Requirements Document](docs/prd.md)** - Detailed product specifications
- **[Architecture Guide](docs/architecture.md)** - Technical architecture overview
- **[Development Roadmap](docs/roadmap.md)** - Current development status and future plans
- **[Setup Guide](docs/setup-guide.md)** - Detailed installation and configuration
- **[Production Setup](docs/production-setup.md)** - Production deployment guide
- **[Storage Architecture](docs/storage-architecture.md)** - Database and storage design
- **[Development Priorities](docs/development-priorities.md)** - Current development focus areas

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes** and test on all target platforms
4. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
5. **Push to the branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

### Development Priorities

See [development-priorities.md](docs/development-priorities.md) for current development focus areas.

## 📈 Roadmap

### ✅ Completed Features
- ✅ Real-time app usage tracking
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Local SQLite storage
- ✅ Supabase integration with authentication
- ✅ Real-time data sync with batch processing
- ✅ Modern React frontend with TypeScript
- ✅ Device ID persistence and management
- ✅ Usage data management and clearing
- ✅ Error handling and retry logic
- ✅ Analytics and productivity scoring
- ✅ Production setup and deployment guides

### 🔄 In Progress
- 🔄 App blocking with overlay screens
- 🔄 Emergency override functionality
- 🔄 Advanced analytics dashboard
- 🔄 Customizable tracking intervals

### 📋 Planned Features
- 📋 Focus mode and productivity sessions
- 📋 Goal setting and achievement tracking
- 📋 Data export and reporting
- 📋 System tray integration
- 📋 Keyboard shortcuts and hotkeys
- 📋 Multi-language support

## 🐛 Troubleshooting

### Common Issues

**Build errors on Windows:**
- Ensure Visual Studio Build Tools are installed
- Run `rustup update` to ensure latest Rust toolchain

**Permission errors on macOS:**
- Grant accessibility permissions to the app in System Preferences
- Ensure Xcode Command Line Tools are installed

**X11 errors on Linux:**
- Install X11 development libraries: `sudo apt-get install libx11-dev`
- Ensure X11 server is running

**Supabase sync issues:**
- Check your `.env.local` file has correct Supabase credentials
- Verify RLS policies are set up correctly in Supabase
- Check network connectivity and firewall settings
- Review error logs in the browser console

### Getting Help

If you encounter issues:

1. Check the [Issues](../../issues) page for known problems
2. Create a new issue with detailed information about your problem
3. Include your operating system, Rust version, and Node.js version
4. Check the [Production Setup Guide](docs/production-setup.md) for deployment issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) for cross-platform desktop development
- Powered by [Next.js](https://nextjs.org/) for the frontend framework
- Data storage and sync with [Supabase](https://supabase.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Loopd** - Stay productive, track your time, and sync across devices. 🚀
