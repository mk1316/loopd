'use client';
import React from 'react';
import { SyncStatus } from '@/components/SyncStatus';
import { ClearDataButton } from '@/components/ClearDataButton';
import { UserProfile } from '@/components/UserProfile';
import { DeviceIdDisplay } from '@/components/DeviceIdDisplay';
import CustomAuthForm from '@/components/CustomAuthForm';
import { Updater } from '@/components/Updater';
import { useAppTracking } from '@/hooks/useAppTracking';
import { useUser } from '@/contexts/UserContext';

export default function SettingsPage() {
  const { isClearing, deviceId } = useAppTracking();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto app-container p-8 rounded-xl space-y-8">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        {/* Account Section */}
        <div className="settings-card bg-slate-800 rounded-lg p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">Account</h2>
          {user ? <UserProfile /> : <CustomAuthForm />}
        </div>

        {/* Device Information Section */}
        <div className="settings-card bg-slate-800 rounded-lg p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">Device Information</h2>
          <DeviceIdDisplay deviceId={deviceId} />
        </div>

        {/* Sync Section */}
        <div className="settings-card bg-slate-800 rounded-lg p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">Sync</h2>
          <SyncStatus />
        </div>

        {/* Updates Section */}
        <div className="settings-card bg-slate-800 rounded-lg p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">Updates</h2>
          <Updater />
        </div>

        {/* Danger Zone */}
        <div className="settings-card bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <ClearDataButton isClearing={isClearing} />
        </div>
      </div>
    </div>
  );
} 