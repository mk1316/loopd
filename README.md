# Loopd - Cross-Platform App Usage Tracker

A modern desktop application built with Tauri that tracks active application usage across Windows, macOS, and Linux in real-time.

![Loopd App Usage Tracker](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Tauri](https://img.shields.io/badge/Built%20with-Tauri-2.0-FFC131)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000)
![Rust](https://img.shields.io/badge/Backend-Rust-DE5842)

## 🚀 Features

- **Real-time tracking**: Monitors active applications and window titles with 1-second precision
- **Cross-platform support**: Works seamlessly on Windows, macOS, and Linux
- **Live updates**: Frontend updates in real-time as you switch between applications
- **Clean UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Efficient**: Lightweight background tracking with minimal resource usage
- **Privacy-focused**: All data stays local on your machine

## 🛠️ Technology Stack

- **Backend**: Rust with Tauri 2.0
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **OS Integration**: Platform-specific APIs for app detection
  - Windows: Win32 API
  - macOS: Cocoa/Objective-C APIs
  - Linux: X11 APIs

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo)
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

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run tauri dev
```

This will start both the Next.js development server and the Tauri application.

### 5. Build for Production

```bash
npm run tauri build
```

## 📁 Project Structure

```
loopd/
├── .git/                    # Git repository
└── desktop-app/            # Main project directory
    ├── src/                # Next.js frontend
    │   ├── app/           # App router pages
    │   └── lib/           # Utility functions
    ├── src-tauri/         # Rust backend
    │   ├── src/
    │   │   ├── lib.rs     # Main application logic
    │   │   ├── usage.rs   # Usage tracking implementation
    │   │   └── main.rs    # Entry point
    │   └── Cargo.toml     # Rust dependencies
    ├── docs/              # Project documentation
    ├── public/            # Static assets
    ├── package.json       # Node.js dependencies
    └── README.md          # Project documentation
```

## 🏗️ Architecture

### Backend (Rust)

The backend consists of two main components:

1. **UsageTracker** (`src-tauri/src/usage.rs`): Core tracking logic that monitors active applications using OS-specific APIs
2. **App State Management** (`src-tauri/src/lib.rs`): Manages usage data and provides Tauri commands

### Frontend (Next.js)

- **Real-time Updates**: Uses Tauri events to receive app switch notifications
- **Responsive Design**: Clean, modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support for better development experience

## 🎯 Usage

1. **Launch the application** using `npm run tauri dev`
2. **The app automatically starts tracking** your active applications
3. **Switch between different applications** to see usage data accumulate
4. **View real-time updates** in the dashboard showing:
   - Currently active application
   - Total usage time for each app
   - Last update timestamp

## 🔧 Development

### Key Components

- **UsageTracker**: Monitors active applications using OS-specific APIs
- **Background Thread**: Runs tracking logic in a separate thread to avoid blocking the UI
- **Event System**: Emits events when applications switch for real-time frontend updates

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

### Error Handling

The application uses Rust's robust error handling with `Result<T, E>` types [[source](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)]. All OS-specific operations are wrapped in proper error handling to ensure the application remains stable even when encountering unexpected system states.

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

### Getting Help

If you encounter issues:

1. Check the [Issues](../../issues) page for known problems
2. Create a new issue with detailed information about your problem
3. Include your operating system, Rust version, and Node.js version

## 📈 Roadmap

- [ ] **Data persistence and export** - Save usage data to local database
- [ ] **Usage analytics and charts** - Visualize usage patterns over time
- [ ] **App blocking functionality** - Set time limits for specific applications
- [ ] **Cloud synchronization** - Optional cloud backup of usage data
- [ ] **Customizable tracking intervals** - Adjust polling frequency
- [ ] **Export reports** - Generate PDF/CSV reports of usage data
- [ ] **System tray integration** - Minimize to system tray
- [ ] **Keyboard shortcuts** - Global hotkeys for quick actions

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
