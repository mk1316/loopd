'use client';

import { useEffect, useState } from 'react';
import { usePostHog } from '@/hooks/usePostHog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, MousePointer, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  const posthog = usePostHog();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const handleTestEvent = () => {
    posthog.trackButtonClick('test_button', {
      location: 'analytics_dashboard',
      timestamp: new Date().toISOString()
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-slate-800/90 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics (Dev)
          </CardTitle>
          <CardDescription className="text-gray-400">
            PostHog tracking is active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <div className="text-green-400 font-medium">Tracking</div>
              <div className="text-gray-300">Active</div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <div className="text-blue-400 font-medium">Mode</div>
              <div className="text-gray-300">Debug</div>
            </div>
          </div>
          
          <Button 
            onClick={handleTestEvent}
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Send Test Event
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Check browser console for events
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 