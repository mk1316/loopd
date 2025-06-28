# Loopd - Cross-Platform Productivity App

A powerful desktop application built with Tauri that tracks application usage, blocks distracting apps, and syncs data across devices in real-time.

## 🚀 Features

- **Real-time App Tracking**: Monitors active applications and window titles across Windows, macOS, and Linux
- **Cloud Sync**: Seamless data synchronization across devices using Supabase
- **App Blocking**: Block distracting applications with customizable overlay screens
- **Emergency Override**: Temporary access to blocked apps when needed
- **Live Dashboard**: Real-time usage statistics and productivity insights
- **Cross-Platform**: Native performance on Windows, macOS, and Linux
- **User Authentication**: Secure login and session management
- **Device Management**: Track usage across multiple devices with unique device IDs

## 🛠 Technology Stack

### Backend
- **Rust** with Tauri 2.0 for cross-platform desktop functionality
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
- **PostgreSQL** for data persistence
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates across devices

## 📦 Installation

### Prerequisites

- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo)
- **Platform-specific development tools**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials and X11 development libraries

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd loopd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase** (optional for cloud features):
   - Create a Supabase project
   - Add your Supabase URL and anon key to environment variables
   - Run the database migrations

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
3. **App State Management** (`src-tauri/src/lib.rs`): Coordinates between frontend and backend
4. **Real-time Frontend** (`src/app/page.tsx`): Displays live usage data and manages user interactions

### Data Flow

```
OS Active App → Rust Backend → Local Buffer → Supabase Sync → Other Devices
     ↓              ↓              ↓              ↓              ↓
Tauri Events → React Frontend → Real-time UI → Cloud Database → Cross-device Sync
```

## 🎯 Usage

### Getting Started

1. **Launch the application** - tracking begins automatically
2. **View real-time data** - see which apps you're currently using
3. **Monitor usage patterns** - track time spent across different applications
4. **Manage data** - clear usage data or export statistics

### Key Features

- **Live Tracking**: See your current active application in real-time
- **Usage History**: View detailed breakdown of time spent per app per day
- **Device Identification**: Unique device IDs for multi-device tracking
- **Data Management**: Clear all usage data with one click
- **Cloud Sync**: Automatic synchronization across all your devices

## 🔧 Development

### Project Structure

```
loopd/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable UI components
│   └── lib/               # Utility functions and Supabase client
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main application logic
│   │   ├── usage.rs       # Usage tracking implementation
│   │   ├── database.rs    # Database operations
│   │   └── main.rs        # Entry point
│   └── Cargo.toml         # Rust dependencies
├── docs/                  # Project documentation
│   ├── prd.md            # Product Requirements Document
│   ├── architecture.md   # Technical architecture
│   ├── roadmap.md        # Development roadmap
│   └── setup-guide.md    # Detailed setup instructions
└── public/               # Static assets
```

### Key Commands

- `npm run tauri dev` - Start development server
- `npm run tauri build` - Build for production
- `npm run dev` - Start Next.js dev server only
- `npm run build` - Build Next.js frontend only

### Environment Variables

Create a `.env.local` file for Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

- **[Product Requirements Document](docs/prd.md)** - Detailed product specifications
- **[Architecture Guide](docs/architecture.md)** - Technical architecture overview
- **[Development Roadmap](docs/roadmap.md)** - Current development status and future plans
- **[Setup Guide](docs/setup-guide.md)** - Detailed installation and configuration
- **[Storage Architecture](docs/storage-architecture.md)** - Database and storage design

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

### Current Status
- ✅ Real-time app usage tracking
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Local SQLite storage
- ✅ Supabase integration
- ✅ User authentication
- ✅ Real-time data sync
- ✅ Modern React frontend

### Upcoming Features
- 🔄 App blocking with overlay screens
- 🔄 Emergency override functionality
- 🔄 Usage analytics and charts
- 🔄 Customizable tracking intervals
- 🔄 Data export capabilities
- 🔄 Advanced productivity insights

See [roadmap.md](docs/roadmap.md) for detailed development plans.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for the excellent cross-platform framework
- [Supabase](https://supabase.com/) for the powerful backend-as-a-service
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Loopd** - Stay productive, track your time, and sync across devices. 🚀
