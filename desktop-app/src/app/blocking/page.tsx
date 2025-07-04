"use client";

import { useState } from "react";
import { useAppTracking } from "@/hooks/useAppTracking";
import { useBlocking } from "@/hooks/useBlocking";
import { BlockRulesManager } from "@/components/BlockRulesManager";
import { BlockScreen } from "@/components/BlockScreen";
import { BlockingTest } from "@/components/BlockingTest";
import { ProtectedRoute } from "@/components";
import React from "react";

export default function BlockingPage() {
  const {
    deviceId,
    blockRules,
    fetchBlockRules,
  } = useAppTracking();
  const {
    currentBlockStatus,
    handleOverride,
    refreshBlockingRules,
  } = useBlocking(deviceId);

  // Add state to control BlockScreen visibility
  const [showBlockScreen, setShowBlockScreen] = useState(true);

  // Reset showBlockScreen when block status changes
  React.useEffect(() => {
    if (currentBlockStatus?.is_blocked) {
      setShowBlockScreen(true);
    }
  }, [currentBlockStatus]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="app-container p-6 md:p-8 mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Blocking</h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-4">
              Set up which apps to block and manage your blocking rules.
            </p>
            <BlockRulesManager
              blockRules={blockRules}
              deviceId={deviceId}
              onRefresh={() => {
                fetchBlockRules();
                refreshBlockingRules();
              }}
            />
          </div>

          {/* Development Testing Component */}
          {process.env.NODE_ENV === "development" && (
            <div className="app-container p-6 md:p-8">
              <BlockingTest deviceId={deviceId} />
            </div>
          )}
        </div>
        {/* Block Screen Overlay */}
        {currentBlockStatus?.is_blocked && showBlockScreen && (
          <BlockScreen
            blockStatus={currentBlockStatus}
            deviceId={deviceId}
            onOverride={handleOverride}
            onClose={() => setShowBlockScreen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
} 