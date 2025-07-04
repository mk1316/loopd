import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listen } from "@tauri-apps/api/event";

interface BlockingTestProps {
  deviceId: string;
}

export function BlockingTest({ deviceId }: BlockingTestProps) {
  const [appName, setAppName] = useState('notepad');
  const [blockType, setBlockType] = useState<'time' | 'usage'>('time');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('17:00');
  const [dailyLimit, setDailyLimit] = useState(60);
  const [strictness, setStrictness] = useState<'hard' | 'soft'>('hard');
  const [isCreating, setIsCreating] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [fade, setFade] = useState(false);

  const createTestRule = async () => {
    setIsCreating(true);
    try {
      await invoke('create_block_rule_command', {
        deviceId,
        appName,
        blockType,
        timeWindowStart: blockType === 'time' ? timeStart : null,
        timeWindowEnd: blockType === 'time' ? timeEnd : null,
        dailyLimitMinutes: blockType === 'usage' ? dailyLimit : null,
        strictness,
      });
      
      // Refresh blocking rules
      await invoke('refresh_blocking_rules_command', { deviceId });
      
      alert('Test block rule created successfully!');
    } catch (error) {
      console.error('Failed to create test rule:', error);
      alert('Failed to create test rule');
    } finally {
      setIsCreating(false);
    }
  };

  const testTermination = async () => {
    try {
      await invoke('terminate_blocked_app_command', { appName });
      alert(`Attempted to terminate ${appName}`);
    } catch (error) {
      console.error('Failed to terminate app:', error);
      alert('Failed to terminate app');
    }
  };

  useEffect(() => {
    let unlistenBlocked: (() => void) | undefined;
    let unlistenUnblocked: (() => void) | undefined;
    listen("app_blocked", () => {
      setFade(false);
      setBlocked(true);
    }).then((fn) => (unlistenBlocked = fn));
    listen("app_unblocked", () => {
      setFade(true);
      setTimeout(() => setBlocked(false), 300); // match CSS duration
    }).then((fn) => (unlistenUnblocked = fn));
    return () => {
      if (unlistenBlocked) unlistenBlocked();
      if (unlistenUnblocked) unlistenUnblocked();
    };
  }, []);

  if (!blocked && !fade) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Blocking System Test</CardTitle>
        <CardDescription>
          Create test blocking rules to verify the blocking system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="app-name">App Name</Label>
          <Input
            id="app-name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g., notepad, chrome, discord"
          />
        </div>

        <div>
          <Label htmlFor="block-type">Block Type</Label>
          <Select value={blockType} onValueChange={(value: 'time' | 'usage') => setBlockType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time-based</SelectItem>
              <SelectItem value="usage">Usage-based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {blockType === 'time' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time-start">Start Time</Label>
              <Input
                id="time-start"
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time-end">End Time</Label>
              <Input
                id="time-end"
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        {blockType === 'usage' && (
          <div>
            <Label htmlFor="daily-limit">Daily Limit (minutes)</Label>
            <Input
              id="daily-limit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value) || 60)}
            />
          </div>
        )}

        <div>
          <Label htmlFor="strictness">Strictness</Label>
          <Select value={strictness} onValueChange={(value: 'hard' | 'soft') => setStrictness(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hard">Hard (No Override)</SelectItem>
              <SelectItem value="soft">Soft (Allow Override)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={createTestRule}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Create Test Rule'}
          </Button>
          
          <Button
            onClick={testTermination}
            variant="outline"
            className="flex-1"
          >
            Test Termination
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Enter an app name (e.g., &quot;notepad&quot; for Windows)</li>
            <li>Choose block type and configure settings</li>
            <li>Create the test rule</li>
            <li>Try to open the blocked app</li>
            <li>Observe the blocking behavior</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

export default BlockingTest; 