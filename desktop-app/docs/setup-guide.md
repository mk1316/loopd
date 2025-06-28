# 🚀 Loopd Setup Guide

A comprehensive guide to setting up and running the Loopd productivity app on your local development environment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo) - [Install Rust](https://rustup.rs/)
- **Git** for version control

### Platform-Specific Requirements

#### Windows
- **Visual Studio Build Tools** or **Visual Studio Community**
- **Windows 10/11** (recommended)

#### macOS
- **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```
- **macOS 10.15+** (recommended)

#### Linux
- **Build essentials**:
  ```bash
  sudo apt update
  sudo apt install build-essential curl wget file
  ```
- **X11 development libraries** (for app detection):
  ```bash
  sudo apt install libx11-dev libxrandr-dev libxinerama-dev libxcursor-dev libxi-dev
  ```

## 🛠 Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd loopd
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify Rust installation
rustc --version
cargo --version
```

### Step 3: Set Up Supabase (Optional)

Loopd supports both local-only mode and cloud sync. For full functionality:

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up database schema** (if using cloud sync):
   ```sql
   -- Run these in your Supabase SQL editor
   
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
   
   -- Create app usage logs table
   CREATE TABLE app_usage_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     app_name TEXT NOT NULL,
     window_title TEXT,
     duration_seconds INTEGER NOT NULL,
     start_time TIMESTAMP WITH TIME ZONE,
     device_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Create RLS policies
   CREATE POLICY "Users can view their own usage data" ON app_usage_logs
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own usage data" ON app_usage_logs
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

### Step 4: Start Development Server

```bash
# Start the development server
npm run tauri dev
```

This command will:
1. Start the Next.js development server
2. Build the Rust backend
3. Launch the Tauri application

## 🎯 Current Features

### ✅ Implemented Features
- **Real-time app tracking** across Windows, macOS, and Linux
- **Local SQLite storage** for usage data
- **Live dashboard** showing current active app and usage history
- **Device identification** with persistent device IDs
- **Data management** (clear all data functionality)
- **Cross-platform compatibility**

### 🔄 In Development
- **Supabase integration** for cloud sync
- **User authentication** system
- **App blocking** functionality
- **Emergency override** system

## 🧪 Testing the Application

### Basic Functionality Test

1. **Launch the app** using `npm run tauri dev`
2. **Switch between applications** (browser, text editor, etc.)
3. **Observe real-time updates** in the dashboard
4. **Check device ID** - should persist across restarts
5. **Test data clearing** - use the "Clear All Data" button

### Platform-Specific Testing

#### Windows
- Test with various Windows applications
- Verify window title detection
- Check process name accuracy

#### macOS
- Test with native macOS apps
- Verify app switching detection
- Check permissions (accessibility if needed)

#### Linux
- Test with X11 applications
- Verify window manager compatibility
- Check for Wayland support (if applicable)

## 🔧 Development Commands

```bash
# Development
npm run tauri dev          # Start development server
npm run dev               # Start Next.js only
npm run build             # Build Next.js frontend

# Building
npm run tauri build       # Build for production
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux

# Utilities
npm run lint              # Run ESLint
cargo check               # Check Rust code
cargo test                # Run Rust tests
```

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clean and rebuild
npm run build
cargo clean
npm run tauri dev
```

#### Permission Issues (macOS)
- Go to System Preferences → Security & Privacy → Privacy
- Add your terminal/IDE to Accessibility permissions

#### Windows Build Issues
- Ensure Visual Studio Build Tools are installed
- Run `rustup default stable` to ensure stable Rust

#### Linux Dependencies
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk3-devel gtk3-devel libappindicator-gtk3-dev librsvg2-devel
```

### Debug Mode

Enable debug logging by setting the `RUST_LOG` environment variable:

```bash
# Windows
set RUST_LOG=debug
npm run tauri dev

# macOS/Linux
RUST_LOG=debug npm run tauri dev
```

## 📦 Production Build

### Building for Distribution

```bash
# Build for current platform
npm run tauri build

# Build for specific platforms
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Distribution Files

Built applications will be available in:
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/appimage/`

## 🔄 Next Steps

After successful setup:

1. **Explore the codebase**:
   - `src-tauri/src/usage.rs` - App tracking logic
   - `src-tauri/src/database.rs` - Database operations
   - `src/app/page.tsx` - Main dashboard

2. **Review documentation**:
   - [Product Requirements Document](prd.md)
   - [Architecture Guide](architecture.md)
   - [Development Roadmap](roadmap.md)

3. **Contribute to development**:
   - Check [development priorities](development-priorities.md)
   - Review open issues
   - Submit pull requests

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review the logs** with `RUST_LOG=debug`
3. **Search existing issues** in the repository
4. **Create a new issue** with detailed information

---

**Happy coding! 🚀**
