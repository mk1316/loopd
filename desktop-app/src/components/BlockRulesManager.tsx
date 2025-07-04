import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BlockRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BlockRulesManagerProps {
  blockRules: BlockRule[];
  deviceId: string;
  onRefresh: () => void;
}

interface BlockRuleForm {
  app_name: string;
  block_type: 'time' | 'usage';
  time_window_start: string;
  time_window_end: string;
  daily_limit_minutes: number;
  strictness: 'hard' | 'soft';
  enabled: boolean;
}

export function BlockRulesManager({ blockRules, deviceId, onRefresh }: BlockRulesManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<BlockRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [form, setForm] = useState<BlockRuleForm>({
    app_name: '',
    block_type: 'time',
    time_window_start: '09:00',
    time_window_end: '17:00',
    daily_limit_minutes: 60,
    strictness: 'hard',
    enabled: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRule = async () => {
    setIsSubmitting(true);
    try {
      await invoke('create_block_rule_command', {
        deviceId,
        appName: form.app_name,
        blockType: form.block_type,
        timeWindowStart: form.block_type === 'time' ? form.time_window_start : null,
        timeWindowEnd: form.block_type === 'time' ? form.time_window_end : null,
        dailyLimitMinutes: form.block_type === 'usage' ? form.daily_limit_minutes : null,
        strictness: form.strictness,
      });
      
      setShowCreateDialog(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to create block rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;
    
    setIsSubmitting(true);
    try {
      await invoke('update_block_rule_command', {
        ruleId: editingRule.id,
        appName: form.app_name,
        timeWindowStart: form.block_type === 'time' ? form.time_window_start : null,
        timeWindowEnd: form.block_type === 'time' ? form.time_window_end : null,
        dailyLimitMinutes: form.block_type === 'usage' ? form.daily_limit_minutes : null,
        strictness: form.strictness,
        enabled: form.enabled,
      });
      
      setEditingRule(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to update block rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const testTauriInvoke = async () => {
    try {
      console.log('Testing Tauri invoke...');
      const result = await invoke('test_command');
      console.log('Test command result:', result);
      
      // Also test database connection
      console.log('Testing database connection...');
      const dbResult = await invoke('test_database_connection_command');
      console.log('Database test result:', dbResult);
      
      alert('Tauri invoke and database are working!');
    } catch (error) {
      console.error('Tauri invoke test failed:', error);
      alert(`Tauri invoke test failed: ${error}`);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    console.log('Delete button clicked for rule:', ruleId);
    
    if (!confirm('Are you sure you want to delete this block rule?')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    setDeletingRuleId(ruleId);
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Calling delete_block_rule_command with ruleId: ${ruleId} (attempt ${retryCount + 1})`);
        await invoke('delete_block_rule_command', { ruleId });
        console.log('Delete command executed successfully');
        onRefresh();
        return; // Success, exit the retry loop
      } catch (error) {
        retryCount++;
        console.error(`Failed to delete block rule (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          // Show user-friendly error message after all retries failed
          alert(`Failed to delete block rule after ${maxRetries} attempts: ${error}`);
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    setDeletingRuleId(null);
  };

  const handleEditRule = (rule: BlockRule) => {
    setEditingRule(rule);
    setForm({
      app_name: rule.app_name,
      block_type: rule.block_type,
      time_window_start: rule.time_window_start || '09:00',
      time_window_end: rule.time_window_end || '17:00',
      daily_limit_minutes: rule.daily_limit_minutes || 60,
      strictness: rule.strictness,
      enabled: rule.enabled,
    });
  };

  const resetForm = () => {
    setForm({
      app_name: '',
      block_type: 'time',
      time_window_start: '09:00',
      time_window_end: '17:00',
      daily_limit_minutes: 60,
      strictness: 'hard',
      enabled: true,
    });
  };

  const getBlockTypeText = (rule: BlockRule) => {
    switch (rule.block_type) {
      case 'time':
        return `Time: ${rule.time_window_start} - ${rule.time_window_end}`;
      case 'usage':
        return `Usage: ${rule.daily_limit_minutes} min/day`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Block Rules</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testTauriInvoke}
            className="text-xs"
          >
            Test Invoke
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            Add Block Rule
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {blockRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rule.app_name}</CardTitle>
                  <CardDescription>{getBlockTypeText(rule)}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.strictness === 'hard' ? 'destructive' : 'secondary'}>
                    {rule.strictness}
                  </Badge>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRule(rule)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingRuleId === rule.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteRule(rule.id);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ 
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    cursor: deletingRuleId === rule.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deletingRuleId === rule.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {blockRules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No block rules configured yet.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowCreateDialog(true)}
              >
                Create your first rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingRule} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingRule(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Block Rule' : 'Create Block Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure when and how to block this application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="app-name">Application Name</Label>
              <Input
                id="app-name"
                value={form.app_name}
                onChange={(e) => setForm({ ...form, app_name: e.target.value })}
                placeholder="e.g., Discord, Chrome, etc."
              />
            </div>

            <div>
              <Label htmlFor="block-type">Block Type</Label>
              <Select
                value={form.block_type}
                onValueChange={(value: 'time' | 'usage') => setForm({ ...form, block_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Time-based</SelectItem>
                  <SelectItem value="usage">Usage-based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.block_type === 'time' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={form.time_window_start}
                    onChange={(e) => setForm({ ...form, time_window_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={form.time_window_end}
                    onChange={(e) => setForm({ ...form, time_window_end: e.target.value })}
                  />
                </div>
              </div>
            )}

            {form.block_type === 'usage' && (
              <div>
                <Label htmlFor="daily-limit">Daily Limit (minutes)</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={form.daily_limit_minutes}
                  onChange={(e) => setForm({ ...form, daily_limit_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="strictness">Strictness</Label>
              <Select
                value={form.strictness}
                onValueChange={(value: 'hard' | 'soft') => setForm({ ...form, strictness: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard - No override allowed</SelectItem>
                  <SelectItem value="soft">Soft - Override available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingRule && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingRule(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={editingRule ? handleUpdateRule : handleCreateRule}
              disabled={isSubmitting || !form.app_name}
            >
              {isSubmitting ? 'Saving...' : (editingRule ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 