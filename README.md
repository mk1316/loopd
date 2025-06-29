# Loopd - Cross-Platform Digital Wellness & Productivity Tracker

A modern desktop application built with Tauri that tracks active application usage across Windows, macOS, and Linux in real-time, with cloud synchronization and digital wellness features.

![Loopd App Usage Tracker](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Tauri](https://img.shields.io/badge/Built%20with-Tauri-2.0-FFC131)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-000000)
![Rust](https://img.shields.io/badge/Backend-Rust-DE5842)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)

## 🚀 Features

- **Real-time tracking**: Monitors active applications and window titles with 1-second precision
- **Cross-platform support**: Works seamlessly on Windows, macOS, and Linux
- **Cloud synchronization**: Automatic data sync with Supabase for multi-device access
- **User authentication**: Secure login system with Supabase Auth
- **Live updates**: Frontend updates in real-time as you switch between applications
- **Clean UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Efficient**: Lightweight background tracking with minimal resource usage
- **Privacy-focused**: Local-first approach with optional cloud sync
- **Batch syncing**: Automatic background sync every 30 seconds
- **Error handling**: Robust error handling with retry logic and user-friendly messages

## 🛠️ Technology Stack

- **Backend**: Rust with Tauri 2.0
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with session management
- **OS Integration**: Platform-specific APIs for app detection
  - Windows: Win32 API
  - macOS: Cocoa/Objective-C APIs
  - Linux: X11 APIs

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo) - version 1.77.2 or higher
- **Platform-specific development tools**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials and X11 development libraries

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd loopd
```

### 2. Navigate to the Project Directory

```bash
cd desktop-app
```

### 3. Set Up Supabase (Optional but Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. Run the database setup SQL (see [docs/production-setup.md](docs/production-setup.md))

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run tauri dev
```

This will start both the Next.js development server and the Tauri application.

### 6. Build for Production

```bash
npm run tauri build
```

## 📁 Project Structure

```
loopd/
├── desktop-app/            # Main Tauri application
│   ├── src/               # Next.js frontend
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (UserContext)
│   │   ├── hooks/        # Custom hooks (useSync, useAppTracking)
│   │   ├── lib/          # Utility functions and Supabase config
│   │   └── types/        # TypeScript type definitions
│   ├── src-tauri/        # Rust backend
│   │   ├── src/
│   │   │   ├── lib.rs    # Main application logic
│   │   │   ├── usage.rs  # Usage tracking implementation
│   │   │   ├── database.rs # Local SQLite database operations
│   │   │   └── supabase.rs # Supabase client and sync logic
│   │   └── Cargo.toml    # Rust dependencies
│   ├── docs/             # Project documentation
│   └── package.json      # Node.js dependencies
├── webclient/            # Web client application
│   ├── src/             # Next.js web frontend
│   └── package.json     # Web client dependencies
└── docs/                # Project-wide documentation
```

## 🏗️ Architecture

### Backend (Rust)

The backend consists of several key components:

1. **UsageTracker** (`src-tauri/src/usage.rs`): Core tracking logic that monitors active applications using OS-specific APIs
2. **Database Manager** (`src-tauri/src/database.rs`): Local SQLite database operations and Supabase sync
3. **Supabase Client** (`src-tauri/src/supabase.rs`): Cloud synchronization and authenticated API calls
4. **App State Management** (`src-tauri/src/lib.rs`): Manages usage data and provides Tauri commands

### Frontend (Next.js)

- **Real-time Updates**: Uses Tauri events to receive app switch notifications
- **Authentication**: Supabase Auth integration with protected routes
- **Sync Management**: Automatic and manual data synchronization
- **Responsive Design**: Clean, modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support for better development experience

### Cloud Integration (Supabase)

- **Authentication**: User registration, login, and session management
- **Data Sync**: Real-time synchronization between local and cloud storage
- **Row Level Security**: User data isolation and security
- **Error Handling**: Comprehensive error management with retry logic

## 🎯 Usage

1. **Launch the application** using `npm run tauri dev`
2. **Sign in or create an account** using Supabase authentication
3. **The app automatically starts tracking** your active applications
4. **Data syncs automatically** every 30 seconds to the cloud
5. **View real-time updates** in the dashboard showing:
   - Currently active application
   - Total usage time for each app
   - Sync status and unsynced data count
   - Last sync timestamp

## 🔧 Development

### Key Components

- **UsageTracker**: Monitors active applications using OS-specific APIs
- **Background Thread**: Runs tracking logic in a separate thread to avoid blocking the UI
- **Event System**: Emits events when applications switch for real-time frontend updates
- **Sync System**: Automatic batch synchronization with Supabase
- **Error Handling**: Robust error handling with user-friendly messages

### Available Scripts

```bash
# Development
npm run tauri dev          # Start development server
npm run dev               # Start Next.js dev server only

# Building
npm run tauri build       # Build for production
npm run build            # Build Next.js frontend only

# Testing
npm run test             # Run tests (when implemented)
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test on all target platforms
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Test on all target platforms (Windows, macOS, Linux)
- Follow Rust and TypeScript best practices
- Add appropriate error handling
- Update documentation for new features
- Ensure Supabase integration works correctly

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

### Getting Help

If you encounter issues:

1. Check the [Issues](../../issues) page for known problems
2. Create a new issue with detailed information about your problem
3. Include your operating system, Rust version, and Node.js version

## 📈 Roadmap

### ✅ Completed Features
- [x] **Real-time app usage tracking** - Cross-platform application monitoring
- [x] **Local SQLite storage** - Persistent local data storage
- [x] **Supabase integration** - Cloud synchronization and authentication
- [x] **User authentication** - Secure login system
- [x] **Real-time data sync** - Automatic background synchronization
- [x] **Error handling** - Comprehensive error management
- [x] **Modern UI** - Responsive design with Tailwind CSS

### 🔄 In Progress
- [ ] **App blocking functionality** - Set time limits for specific applications
- [ ] **Usage analytics and charts** - Visualize usage patterns over time
- [ ] **Productivity insights** - AI-powered productivity scoring

### 📋 Planned Features
- [ ] **Customizable tracking intervals** - Adjust polling frequency
- [ ] **Export reports** - Generate PDF/CSV reports of usage data
- [ ] **System tray integration** - Minimize to system tray
- [ ] **Keyboard shortcuts** - Global hotkeys for quick actions
- [ ] **Focus mode** - Distraction-free work sessions
- [ ] **Goal setting** - Set daily/weekly usage goals

## 📚 Documentation

- **[Product Requirements Document](docs/prd.md)** - Detailed product specifications
- **[Architecture Guide](docs/architecture.md)** - Technical architecture overview
- **[Development Roadmap](docs/roadmap.md)** - Current development status and future plans
- **[Setup Guide](docs/setup-guide.md)** - Detailed installation and configuration
- **[Production Setup](docs/production-setup.md)** - Production deployment guide
- **[Storage Architecture](docs/storage-architecture.md)** - Database and storage design
- **[Development Priorities](docs/development-priorities.md)** - Current development focus areas

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for the excellent desktop app framework
- [Next.js](https://nextjs.org/) for the powerful React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- The Rust community for the robust systems programming language

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Documentation**: Check the `docs/` folder for detailed guides

---

**Made with ❤️ for productivity enthusiasts**

*Loopd - Track your digital life, one app at a time.*
