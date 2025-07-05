import React from 'react';
import { useUpdater } from '@/hooks/useUpdater';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function Updater() {
  const { status, checkForUpdates, installUpdate, clearError } = useUpdater();

  const handleCheckForUpdates = () => {
    checkForUpdates();
  };

  const handleInstallUpdate = () => {
    installUpdate();
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          App Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Version */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Version:</span>
          <Badge variant="outline">{status.currentVersion}</Badge>
        </div>

        {/* Error Display */}
        {status.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{status.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearError}
                className="h-6 px-2"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Update Available */}
        {status.updateAvailable && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Update Available:</span>
                  <Badge variant="secondary">
                    v{status.updateAvailable.version}
                  </Badge>
                </div>
                {status.updateAvailable.body && (
                  <p className="text-sm text-muted-foreground">
                    {status.updateAvailable.body}
                  </p>
                )}
                <Button
                  onClick={handleInstallUpdate}
                  disabled={status.isInstalling}
                  className="w-full"
                >
                  {status.isInstalling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Install Update
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Check for Updates Button */}
        <Button
          onClick={handleCheckForUpdates}
          disabled={status.isChecking || status.isInstalling}
          variant="outline"
          className="w-full"
        >
          {status.isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check for Updates
            </>
          )}
        </Button>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {status.isChecking && 'Checking for updates...'}
            {status.isDownloading && 'Downloading update...'}
            {status.isInstalling && 'Installing update...'}
            {!status.isChecking && !status.isDownloading && !status.isInstalling && 'Ready'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 