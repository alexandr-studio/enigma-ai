/**
 * Encryption actions component
 * 
 * Provides action buttons and controls for encryption operations
 * including mode switching and message processing controls.
 */

'use client';

import { Lock, Unlock, RotateCcw, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface EncryptionActionsProps {
  mode: 'encrypt' | 'decrypt';
  onModeChange: (mode: 'encrypt' | 'decrypt') => void;
  onProcess: () => void;
  onClear: () => void;
  onSwapMessages: () => void;
  isProcessing: boolean;
  canProcess: boolean;
  hasOutput: boolean;
}

export function EncryptionActions({
  mode,
  onModeChange,
  onProcess,
  onClear,
  onSwapMessages,
  isProcessing,
  canProcess,
  hasOutput,
}: EncryptionActionsProps) {
  const getModeInfo = () => {
    if (mode === 'encrypt') {
      return {
        title: 'Encrypt Mode',
        description: 'Convert plain text into encrypted message',
        icon: Lock,
        buttonText: 'Encrypt Message',
        buttonVariant: 'default' as const,
      };
    } else {
      return {
        title: 'Decrypt Mode', 
        description: 'Convert encrypted message back to plain text',
        icon: Unlock,
        buttonText: 'Decrypt Message',
        buttonVariant: 'secondary' as const,
      };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'encrypt' | 'decrypt')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encrypt" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Encrypt</span>
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex items-center space-x-2">
              <Unlock className="h-4 w-4" />
              <span>Decrypt</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt" className="mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Encryption Mode</p>
                  <p className="text-xs text-green-700">
                    Convert your plain text message into a secure encrypted format
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decrypt" className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Unlock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Decryption Mode</p>
                  <p className="text-xs text-blue-700">
                    Restore an encrypted message back to its original form
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Main Action Button */}
        <Button
          onClick={onProcess}
          disabled={!canProcess || isProcessing}
          className="w-full"
          variant={modeInfo.buttonVariant}
          size="lg"
        >
          {isProcessing ? (
            <>
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ModeIcon className="h-4 w-4 mr-2" />
              {modeInfo.buttonText}
            </>
          )}
        </Button>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={canProcess ? 'default' : 'secondary'}>
              {canProcess ? 'Ready' : 'Incomplete Setup'}
            </Badge>
          </div>
          {!canProcess && (
            <div className="text-xs text-muted-foreground">
              • Enter a message to process
              <br />
              • Select at least one rotor
              <br />
              • Set start positions for all rotors
            </div>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onSwapMessages}
            disabled={!hasOutput || isProcessing}
            className="text-xs"
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Swap & Switch
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            disabled={isProcessing}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs font-medium mb-2">💡 Quick Tips</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Use "Swap & Switch" to decrypt a message you just encrypted</p>
            <p>• Different rotor orders create different encryption patterns</p>
            <p>• Save your rotor settings and positions for repeated use</p>
            <p>• Remember: same rotors + positions = reversible encryption</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
