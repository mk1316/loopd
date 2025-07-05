# Tauri Updater Setup Guide

This document explains how the automatic updater has been configured for the Loopd desktop application.

## Overview

The Tauri updater allows users to automatically receive and install updates without manually downloading new versions. It integrates with GitHub Releases to distribute updates.

## Configuration

### 1. Backend Configuration

#### Dependencies
- `tauri-plugin-updater = "2"` added to `Cargo.toml`

#### Tauri Configuration (`tauri.conf.json`)
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/mk1316/loopd/releases/latest/download/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDhGRjM5QjY4QjE5QjY4QjE5CmlkOiA4RkYzOUI2OEIxOUI2OEIxOQo="
    }
  }
}
```

#### Rust Implementation
- **File**: `src-tauri/src/updater.rs`
- **Commands**:
  - `check_for_updates`: Checks for available updates
  - `install_update`: Downloads and installs the update
  - `get_current_version`: Returns the current app version

### 2. Frontend Implementation

#### React Hook (`src/hooks/useUpdater.ts`)
- Manages updater state and events
- Provides functions for checking and installing updates
- Listens for updater events from the backend

#### UI Component (`src/components/Updater.tsx`)
- Displays current version
- Shows update availability
- Provides buttons for checking and installing updates
- Shows progress indicators and error messages

#### Integration
- Added to Settings page (`src/app/settings/page.tsx`)
- Accessible via the "Updates" section

## How It Works

### 1. Update Check Process
1. User clicks "Check for Updates" button
2. Frontend calls `check_for_updates` command
3. Backend queries GitHub Releases API
4. If update is available, emits `update-available` event
5. Frontend displays update information

### 2. Update Installation Process
1. User clicks "Install Update" button
2. Frontend calls `install_update` command
3. Backend downloads the update file
4. Emits `update-downloaded` event when complete
5. Automatically installs the update
6. Emits `update-installed` event
7. App restarts with new version

### 3. Event System
The updater uses Tauri events to communicate between backend and frontend:
- `update-available`: New version is available
- `update-downloaded`: Update has been downloaded
- `update-installed`: Update has been installed
- `no-update-available`: No updates found
- `update-error`: Error occurred during update process

## GitHub Integration

### Release Process
1. Push to `release` branch triggers GitHub Actions
2. Builds are created for all platforms (Windows, macOS, Linux)
3. Releases are published to GitHub with proper tags
4. Updater endpoints point to these releases

### Release Format
- **Tag**: `loopd-v__VERSION__` (e.g., `loopd-v0.1.1`)
- **Release Name**: `Loopd v__VERSION__`
- **Assets**: Platform-specific installers

## Security

### Code Signing
- Updates are signed with a public key
- Prevents tampering with update files
- Key is embedded in the configuration

### Update Verification
- Tauri verifies update signatures automatically
- Only signed updates are installed
- Failed verification prevents installation

## Testing

### Development Testing
1. Build the app in release mode: `npm run tauri build`
2. Test update checking functionality
3. Verify event handling in the frontend

### Production Testing
1. Create a test release on GitHub
2. Test the full update flow
3. Verify the app restarts correctly

## Troubleshooting

### Common Issues

#### Update Not Found
- Check GitHub release exists and is public
- Verify endpoint URL format
- Ensure version number is higher than current

#### Installation Fails
- Check file permissions
- Verify disk space
- Ensure app is not running as admin (Windows)

#### Signature Verification Fails
- Verify public key is correct
- Check that release was signed properly
- Ensure update file wasn't corrupted

### Debug Information
- Check console logs for updater events
- Verify network connectivity to GitHub
- Check app permissions on the system

## Future Enhancements

### Planned Features
- Automatic update checking on app startup
- Update notifications in system tray
- Rollback functionality for failed updates
- Delta updates for smaller download sizes

### Configuration Options
- Update check frequency
- Auto-install vs. manual install
- Update channel selection (stable/beta)
- Custom update servers

## References

- [Tauri Updater Documentation](https://tauri.app/v2/guides/distribution/updater/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [Code Signing Guide](https://tauri.app/v2/guides/distribution/sign-macos/)

---

*Last updated: 2025-01-27* 