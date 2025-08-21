/**
 * Message output component
 * 
 * Displays the encrypted or decrypted message result
 * with copy functionality and formatting options.
 */

'use client';

import { useState } from 'react';
import { Copy, Check, Download, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MessageOutputProps {
  value: string;
  mode: 'encrypt' | 'decrypt';
  onCopy: () => void;
  isLoading?: boolean;
}

export function MessageOutput({ 
  value, 
  mode, 
  onCopy,
  isLoading = false 
}: MessageOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (!value) return;

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enigma-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTitle = () => {
    if (isLoading) {
      return mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...';
    }
    return mode === 'encrypt' ? 'Encrypted Message' : 'Decrypted Message';
  };

  const getPlaceholder = () => {
    if (isLoading) {
      return 'Processing your message...';
    }
    if (mode === 'encrypt') {
      return 'Your encrypted message will appear here...\n\nThe output will be encoded using the selected rotors and start positions.';
    }
    return 'Your decrypted message will appear here...\n\nMake sure you use the same rotors and positions that were used for encryption.';
  };

  const formatMessage = (text: string) => {
    if (!text) return '';
    
    // Add line breaks every 64 characters for better readability in encrypted mode
    if (mode === 'encrypt' && text.length > 64) {
      return text.match(/.{1,64}/g)?.join('\n') || text;
    }
    
    return text;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
            {isLoading && (
              <RotateCcw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {value && (
              <Badge variant="secondary">
                {value.length} chars
              </Badge>
            )}
            {value && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isLoading}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="message-output" className="text-sm font-medium">
            Output
          </Label>
          <Textarea
            id="message-output"
            value={isLoading ? '' : formatMessage(value)}
            readOnly
            placeholder={getPlaceholder()}
            className={`min-h-[200px] resize-y font-mono ${
              mode === 'encrypt' ? 'tracking-wider' : ''
            } ${isLoading ? 'bg-muted' : ''}`}
          />
        </div>

        {value && !isLoading && (
          <div className="mt-4 space-y-3">
            {/* Output Statistics */}
            <div className="grid grid-cols-3 gap-4 text-sm text-center">
              <div>
                <div className="font-medium">{value.length}</div>
                <div className="text-muted-foreground">Characters</div>
              </div>
              <div>
                <div className="font-medium">{value.split('\n').length}</div>
                <div className="text-muted-foreground">Lines</div>
              </div>
              <div>
                <div className="font-medium">{new Set(value).size}</div>
                <div className="text-muted-foreground">Unique</div>
              </div>
            </div>

            {/* Mode-specific Information */}
            {mode === 'encrypt' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Encryption complete!</strong> Your message has been encoded using the selected rotors.
                  Share this encrypted text along with the rotor configurations and start positions for decryption.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Decryption complete!</strong> The original message has been recovered.
                  Verify this matches your expected content.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
