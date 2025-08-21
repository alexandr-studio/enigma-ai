/**
 * Main message encryption/decryption interface
 * 
 * Provides the primary user interface for encoding and decoding messages
 * using selected rotor configurations and start positions.
 */

'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCcw, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotorConfig } from '@/lib/rotors/types';
import { loadRotors } from '@/lib/storage/rotors';
import { RotorSelector } from './RotorSelector';
import { StartPositionControls } from './StartPositionControls';
import { MessageInput } from './MessageInput';
import { MessageOutput } from './MessageOutput';
import { EncryptionActions } from './EncryptionActions';

interface EncryptionState {
  selectedRotors: RotorConfig[];
  startPositions: number[];
  inputMessage: string;
  outputMessage: string;
  isEncrypting: boolean;
  mode: 'encrypt' | 'decrypt';
  error: string | null;
}

export function MessageProcessor() {
  const [availableRotors, setAvailableRotors] = useState<Map<string, RotorConfig>>(new Map());
  const [state, setState] = useState<EncryptionState>({
    selectedRotors: [],
    startPositions: [],
    inputMessage: '',
    outputMessage: '',
    isEncrypting: false,
    mode: 'encrypt',
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load available rotors on component mount
  useEffect(() => {
    loadAvailableRotors();
  }, []);

  const loadAvailableRotors = async () => {
    setIsLoading(true);
    try {
      const result = loadRotors();
      if (result.success && result.data) {
        setAvailableRotors(result.data);
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to load rotors' }));
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error loading rotors' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotorSelection = (rotors: RotorConfig[]) => {
    setState(prev => ({
      ...prev,
      selectedRotors: rotors,
      startPositions: new Array(rotors.length).fill(1),
      error: null,
    }));
  };

  const handleStartPositionChange = (positions: number[]) => {
    setState(prev => ({
      ...prev,
      startPositions: positions,
      error: null,
    }));
  };

  const handleInputChange = (message: string) => {
    setState(prev => ({
      ...prev,
      inputMessage: message,
      error: null,
    }));
  };

  const handleModeChange = (mode: 'encrypt' | 'decrypt') => {
    setState(prev => ({
      ...prev,
      mode,
      error: null,
    }));
  };

  const handleProcess = async () => {
    if (!state.inputMessage.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a message to process' }));
      return;
    }

    if (state.selectedRotors.length === 0) {
      setState(prev => ({ ...prev, error: 'Please select at least one rotor' }));
      return;
    }

    if (state.startPositions.length !== state.selectedRotors.length) {
      setState(prev => ({ ...prev, error: 'Start positions must be set for all rotors' }));
      return;
    }

    setState(prev => ({ ...prev, isEncrypting: true, error: null }));

    try {
      // Import encryption functions dynamically to avoid SSR issues
      const { encryptText, decryptText } = await import('@/lib/rotors/core');
      
      const result = state.mode === 'encrypt' 
        ? encryptText(state.inputMessage, state.selectedRotors, state.startPositions)
        : decryptText(state.inputMessage, state.selectedRotors, state.startPositions);

      setState(prev => ({
        ...prev,
        outputMessage: result.result,
        isEncrypting: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Encryption/decryption failed',
        isEncrypting: false,
      }));
    }
  };

  const handleCopy = async () => {
    if (state.outputMessage) {
      try {
        await navigator.clipboard.writeText(state.outputMessage);
        // Could add a toast notification here
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to copy to clipboard' 
        }));
      }
    }
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      inputMessage: '',
      outputMessage: '',
      error: null,
    }));
  };

  const handleSwapMessages = () => {
    setState(prev => ({
      ...prev,
      inputMessage: prev.outputMessage,
      outputMessage: '',
      mode: prev.mode === 'encrypt' ? 'decrypt' : 'encrypt',
      error: null,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 animate-spin" />
          <span>Loading encryption interface...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* No Rotors Warning */}
      {availableRotors.size === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              No Rotors Available
            </CardTitle>
            <CardDescription className="text-amber-700">
              You need to create at least one rotor configuration before you can encrypt messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/rotors'}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Create Rotor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      {availableRotors.size > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Encryption Configuration</CardTitle>
                <CardDescription>
                  Select rotors and configure start positions for encryption
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RotorSelector
                  availableRotors={Array.from(availableRotors.values())}
                  selectedRotors={state.selectedRotors}
                  onSelectionChange={handleRotorSelection}
                />

                {state.selectedRotors.length > 0 && (
                  <StartPositionControls
                    rotors={state.selectedRotors}
                    positions={state.startPositions}
                    onPositionChange={handleStartPositionChange}
                  />
                )}
              </CardContent>
            </Card>

            <EncryptionActions
              mode={state.mode}
              onModeChange={handleModeChange}
              onProcess={handleProcess}
              onClear={handleClear}
              onSwapMessages={handleSwapMessages}
              isProcessing={state.isEncrypting}
              canProcess={state.inputMessage.trim().length > 0 && state.selectedRotors.length > 0}
              hasOutput={state.outputMessage.length > 0}
            />
          </div>

          {/* Message Processing Panel */}
          <div className="space-y-6">
            <MessageInput
              value={state.inputMessage}
              onChange={handleInputChange}
              mode={state.mode}
              disabled={state.isEncrypting}
            />

            <MessageOutput
              value={state.outputMessage}
              mode={state.mode}
              onCopy={handleCopy}
              isLoading={state.isEncrypting}
            />
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use Enigma+</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Encryption Process:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Select one or more rotor configurations</li>
                <li>Set start positions for each rotor (1-64)</li>
                <li>Enter your message in the input area</li>
                <li>Click "Encrypt Message" to encode</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>64-symbol character set support</li>
                <li>Multiple rotor configurations</li>
                <li>Customizable start positions</li>
                <li>Local-only processing (no cloud)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
