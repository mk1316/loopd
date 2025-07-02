import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BlockStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BlockScreenProps {
  blockStatus: BlockStatus;
  deviceId: string;
  onOverride?: () => void;
}

export function BlockScreen({ blockStatus, deviceId, onOverride }: BlockScreenProps) {
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  const handleOverride = async () => {
    if (!blockStatus.rule) return;
    
    setIsOverriding(true);
    try {
      await invoke('record_block_override_command', {
        deviceId,
        ruleId: blockStatus.rule.id,
        appName: blockStatus.rule.app_name,
        overrideReason: overrideReason || null,
      });
      
      setShowOverrideDialog(false);
      setOverrideReason('');
      onOverride?.();
    } catch (error) {
      console.error('Failed to record override:', error);
    } finally {
      setIsOverriding(false);
    }
  };

  const getBlockTypeText = () => {
    if (!blockStatus.rule) return '';
    
    switch (blockStatus.rule.block_type) {
      case 'time':
        return `Time-based block (${blockStatus.rule.time_window_start} - ${blockStatus.rule.time_window_end})`;
      case 'usage':
        return `Usage limit exceeded (${blockStatus.rule.daily_limit_minutes} minutes per day)`;
      default:
        return 'Unknown block type';
    }
  };

  const getStrictnessText = () => {
    if (!blockStatus.rule) return '';
    
    switch (blockStatus.rule.strictness) {
      case 'hard':
        return 'Hard Block - No override allowed';
      case 'soft':
        return 'Soft Block - Override available';
      default:
        return 'Unknown strictness';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            ⛔ App Blocked
          </CardTitle>
          <CardDescription className="text-lg">
            {blockStatus.rule?.app_name}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">{blockStatus.reason}</p>
            <p className="text-sm text-gray-500">{getBlockTypeText()}</p>
            <p className="text-sm font-medium text-orange-600 mt-2">
              {getStrictnessText()}
            </p>
          </div>

          {blockStatus.can_override && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowOverrideDialog(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Override Block
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 mt-4">
            <p>This block screen will remain active until the blocking condition is resolved.</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Block</DialogTitle>
            <DialogDescription>
              You&apos;re about to override the block for {blockStatus.rule?.app_name}. 
              This action will be recorded.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="override-reason">Reason for override (optional)</Label>
              <Input
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Why are you overriding this block?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOverrideDialog(false)}
              disabled={isOverriding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverride}
              disabled={isOverriding}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isOverriding ? 'Overriding...' : 'Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 