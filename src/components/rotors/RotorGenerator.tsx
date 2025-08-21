/**
 * Rotor generator component
 * 
 * Provides interface for creating new rotor configurations
 * with random generation and custom options.
 */

'use client';

import { useState } from 'react';
import { Shuffle, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createRandomRotor } from '@/lib/rotors/generator';
import { addRotor } from '@/lib/storage/rotors';

interface RotorGeneratorProps {
  onRotorCreated: () => void;
  currentRotorCount: number;
}

export function RotorGenerator({ onRotorCreated, currentRotorCount }: RotorGeneratorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (currentRotorCount >= 10) {
      setError('Maximum number of rotors (10) reached');
      return;
    }

    if (!name.trim()) {
      setError('Please provide a name for the rotor');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const rotor = createRandomRotor(name.trim(), description.trim() || undefined);
      const result = addRotor(rotor);

      if (result.success) {
        onRotorCreated();
        // Reset form
        setName('');
        setDescription('');
      } else {
        setError(result.error || 'Failed to create rotor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleName = () => {
    const adjectives = ['Swift', 'Secure', 'Cipher', 'Secret', 'Golden', 'Silver', 'Prime', 'Alpha', 'Beta', 'Gamma'];
    const nouns = ['Rotor', 'Wheel', 'Scrambler', 'Encoder', 'Guardian', 'Shield', 'Key', 'Lock', 'Vault', 'Core'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100) + 1;
    
    setName(`${adjective} ${noun} ${number}`);
  };

  return (
    <div className="space-y-6">
      {/* Random Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Generate Random Rotor
          </CardTitle>
          <CardDescription>
            Create a new rotor with a cryptographically secure random permutation.
            Each rotor contains a unique mapping of all 64 symbols.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="rotor-name">Rotor Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="rotor-name"
                  placeholder="Enter rotor name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  disabled={isGenerating}
                />
                <Button
                  variant="outline"
                  onClick={generateSampleName}
                  disabled={isGenerating}
                  title="Generate random name"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotor-description">Description (Optional)</Label>
              <Textarea
                id="rotor-description"
                placeholder="Describe this rotor's purpose or characteristics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                disabled={isGenerating}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {currentRotorCount}/10 rotors used
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || currentRotorCount >= 10 || !name.trim()}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rotor
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Rotor Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Security Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Uses crypto.getRandomValues() for cryptographic randomness</li>
              <li>Each rotor contains all 64 symbols exactly once</li>
              <li>Permutations are mathematically validated</li>
              <li>No predictable patterns or correlations</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Symbol Coverage:</h4>
            <div className="text-sm text-muted-foreground bg-muted rounded p-2 font-mono">
              A-Z (26) + a-z (26) + 0-9 (10) + space + period = 64 symbols
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Storage:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Stored locally in your browser only</li>
              <li>Maximum of 10 rotors per device</li>
              <li>Includes creation and modification timestamps</li>
              <li>Can be exported for backup or sharing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
