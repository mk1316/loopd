# 🚀 Loopd Setup Guide

A comprehensive guide to setting up and running the Loopd productivity app on your local development environment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18+** and npm
- **Rust toolchain** (rustc, cargo) - version 1.77.2 or higher - [Install Rust](https://rustup.rs/)
- **Git** for version control

### Platform-Specific Requirements

#### Windows
- **Visual Studio Build Tools** or **Visual Studio Community** with C++ workload
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
- **WebKit dependencies** (for Tauri):
  ```bash
  sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
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
- **Local SQLite storage** for usage data with automatic migrations
- **Live dashboard** showing current active app and usage history
- **Timeline view** for chronological app usage history (no table view)
- **Device identification** with persistent device IDs
- **Data management** (clear all data functionality)
- **Cross-platform compatibility** with native performance
- **Modern UI** with Tailwind CSS and responsive design
- **Real-time updates** via Tauri events
- **Consistent app names**: App names are stored without file extensions for cross-platform consistency

### 🔄 In Development
- **Supabase integration** for cloud sync
- **User authentication** system
- **App blocking** functionality
- **Emergency override** system
- **Advanced analytics** and reporting

## 🧪 Testing the Application

### Basic Functionality Test

1. **Launch the app** using `npm run tauri dev`
2. **Switch between applications** (browser, text editor, etc.)
3. **Observe real-time updates** in the dashboard
4. **Check device ID** - should persist across restarts
5. **Test data clearing** - use the "Clear All Data" button
6. **Verify usage tracking** - check the usage data section

### Platform-Specific Testing

#### Windows
- Test with various Windows applications
- Verify window title detection
- Check process name accuracy
- Test with UWP apps and traditional Win32 apps

#### macOS
- Test with native macOS apps
- Verify app switching detection
- Check permissions (accessibility if needed)
- Test with different window managers

#### Linux
- Test with X11 applications
- Verify window manager compatibility
- Check for Wayland support (if applicable)
- Test with different desktop environments

## 🔧 Development Commands

```bash
# Development
npm run tauri dev          # Start development server
npm run dev               # Start Next.js only
npm run build             # Build Next.js frontend
npm run export            # Export static files for Tauri

# Building
npm run tauri build       # Build for production
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux

# Utilities
npm run lint              # Run ESLint
cargo check               # Check Rust code
cargo test                # Run Rust tests
cargo clippy              # Run Rust linter
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

#### Export Command Issues
If you encounter issues with the export command:
1. Ensure Next.js 15+ is installed
2. Check that `next.config.ts` has `output: 'export'` configured
3. Verify the export script is in `package.json`

#### Permission Issues (macOS)
- Go to System Preferences → Security & Privacy → Privacy
- Add your terminal/IDE to Accessibility permissions
- For app tracking, grant accessibility permissions to the app

#### Windows Build Issues
- Ensure Visual Studio Build Tools are installed with C++ workload
- Run `rustup default stable` to ensure stable Rust
- Check that Windows SDK is properly installed

#### Linux Dependencies
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk3-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel

# Arch Linux
sudo pacman -S webkit2gtk gtk3 libappindicator-gtk3 librsvg
```

#### Tauri Dev Server Issues
```bash
# Reset Tauri cache
rm -rf src-tauri/target
npm run tauri dev
```

### Performance Optimization

#### For Development
- Use `npm run dev` for faster frontend development
- Use `cargo check` for quick Rust syntax checking
- Enable Rust incremental compilation in `Cargo.toml`

#### For Production
- Optimize bundle size with Next.js build analysis
- Use release builds for Rust: `cargo build --release`
- Enable Rust optimizations in `Cargo.toml`

## 📚 Additional Resources

- **[Architecture Guide](architecture.md)** - Technical architecture overview
- **[Development Priorities](development-priorities.md)** - Current development focus
- **[Roadmap](roadmap.md)** - Future development plans
- **[Storage Architecture](storage-architecture.md)** - Database design details

## 🤝 Getting Help

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review the documentation** in the `docs/` directory
3. **Check GitHub issues** for known problems
4. **Create a new issue** with detailed error information

### Debug Information

When reporting issues, include:
- Operating system and version
- Node.js and npm versions
- Rust toolchain version
- Error messages and stack traces
- Steps to reproduce the issue

# 🐞 Troubleshooting & Support

- For installation or setup issues, check the [GitHub Issues](https://github.com/your-org/loopd/issues).
- For real-time help, join the [Tauri Discord](https://discord.gg/tauri).
- Please contribute improvements to this guide via pull requests!

---

_Last updated: 2025-07-03_

**Happy coding! 🚀**
