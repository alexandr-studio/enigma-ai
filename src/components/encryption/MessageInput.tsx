/**
 * Message input component
 * 
 * Provides a textarea for entering messages to be encrypted or decrypted
 * with character validation and input formatting.
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHARSET } from '@/lib/rotors/types';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: 'encrypt' | 'decrypt';
  disabled?: boolean;
  maxLength?: number;
}

export function MessageInput({ 
  value, 
  onChange, 
  mode, 
  disabled = false,
  maxLength = 5000 
}: MessageInputProps) {
  const [stats, setStats] = useState({
    charCount: 0,
    validChars: 0,
    invalidChars: 0,
    lines: 0,
  });

  useEffect(() => {
    calculateStats(value);
  }, [value]);

  const calculateStats = (text: string) => {
    const lines = text.split('\n').length;
    const charCount = text.length;
    let validChars = 0;
    let invalidChars = 0;

    for (const char of text) {
      if (CHARSET.includes(char)) {
        validChars++;
      } else {
        invalidChars++;
      }
    }

    setStats({
      charCount,
      validChars,
      invalidChars,
      lines,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getPlaceholderText = () => {
    if (mode === 'encrypt') {
      return 'Enter your message to encrypt...\n\nSupported characters: A-Z, a-z, 0-9, space, and period.\nExample: "Hello World! This is a secret message."';
    } else {
      return 'Paste the encrypted message to decrypt...\n\nMake sure to use the same rotors and start positions that were used for encryption.';
    }
  };

  const getSupportedCharsDisplay = () => {
    return CHARSET.split('').map(char => {
      if (char === ' ') return '·'; // Visual space representation
      if (char === '.') return '.';
      return char;
    }).join('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">
              {mode === 'encrypt' ? 'Message to Encrypt' : 'Message to Decrypt'}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={stats.invalidChars > 0 ? 'destructive' : 'secondary'}>
              {stats.charCount}/{maxLength}
            </Badge>
            {stats.invalidChars > 0 && (
              <Badge variant="destructive">
                {stats.invalidChars} invalid
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="message-input" className="text-sm font-medium">
            Message Content
          </Label>
          <Textarea
            id="message-input"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={getPlaceholderText()}
            className={`min-h-[200px] resize-y font-mono ${
              stats.invalidChars > 0 ? 'border-destructive focus:border-destructive' : ''
            }`}
          />
        </div>

        {/* Character Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">{stats.charCount}</div>
            <div className="text-muted-foreground">Characters</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">{stats.validChars}</div>
            <div className="text-muted-foreground">Valid</div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${stats.invalidChars > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {stats.invalidChars}
            </div>
            <div className="text-muted-foreground">Invalid</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{stats.lines}</div>
            <div className="text-muted-foreground">Lines</div>
          </div>
        </div>

        {/* Invalid Character Warning */}
        {stats.invalidChars > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Invalid Characters Detected
                </p>
                <p className="text-sm text-destructive/80 mt-1">
                  Some characters in your message are not supported. They will be ignored during encryption.
                  Use only: A-Z, a-z, 0-9, space, and period.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supported Characters Reference */}
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Supported Character Set (64 symbols)</p>
              <div className="text-xs font-mono bg-background border rounded p-2 break-all">
                {getSupportedCharsDisplay()}
              </div>
              <p className="text-xs text-muted-foreground">
                Includes: Uppercase letters (A-Z), lowercase letters (a-z), digits (0-9), space (·), and period (.)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
