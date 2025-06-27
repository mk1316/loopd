# Loopd - Cross-Platform App Usage Tracker

A desktop application built with Tauri that tracks active application usage across Windows, macOS, and Linux.

## Features

- **Real-time tracking**: Monitors active applications and window titles
- **Cross-platform support**: Works on Windows, macOS, and Linux
- **Live updates**: Frontend updates in real-time as you switch between applications
- **Clean UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Efficient**: Lightweight background tracking with minimal resource usage

## Technology Stack

- **Backend**: Rust with Tauri 2.0
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **OS Integration**: Platform-specific APIs for app detection
  - Windows: Win32 API
  - macOS: Cocoa/Objective-C APIs
  - Linux: X11 APIs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust toolchain (rustc, cargo)
- Platform-specific development tools:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials and X11 development libraries

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd loopd
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Build and run the application:
   ```bash
   npm run tauri dev
   ```

### Building for Production

```bash
npm run tauri build
```

## Architecture

### Backend (Rust)

The backend consists of two main components:

1. **UsageTracker** (`src-tauri/src/usage.rs`): Core tracking logic that monitors active applications
2. **App State Management** (`src-tauri/src/lib.rs`): Manages usage data and provides Tauri commands

### Frontend (Next.js)

- **Real-time Updates**: Uses Tauri events to receive app switch notifications
- **Responsive Design**: Clean, modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support for better development experience

## Usage

1. Launch the application
2. The app automatically starts tracking your active applications
3. Switch between different applications to see usage data accumulate
4. View real-time updates in the dashboard

## Development

### Project Structure

```
loopd/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   └── lib/               # Utility functions
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main application logic
│   │   ├── usage.rs       # Usage tracking implementation
│   │   └── main.rs        # Entry point
│   └── Cargo.toml         # Rust dependencies
└── docs/                  # Project documentation
```

### Key Components

- **UsageTracker**: Monitors active applications using OS-specific APIs
- **Background Thread**: Runs tracking logic in a separate thread to avoid blocking the UI
- **Event System**: Emits events when applications switch for real-time frontend updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all target platforms
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Data persistence and export
- [ ] Usage analytics and charts
- [ ] App blocking functionality
- [ ] Cloud synchronization
- [ ] Customizable tracking intervals
