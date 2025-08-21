/**
 * Rotor editor component
 * 
 * Provides interface for viewing and editing rotor configurations
 * including permutation visualization and metadata editing.
 */

'use client';

import { useState } from 'react';
import { Save, X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RotorConfig, CHARSET } from '@/lib/rotors/types';
import { updateRotor } from '@/lib/storage/rotors';
import { updateRotor as createUpdatedRotor } from '@/lib/rotors/generator';

interface RotorEditorProps {
  rotor: RotorConfig;
  onSave: () => void;
  onCancel: () => void;
}

export function RotorEditor({ rotor, onSave, onCancel }: RotorEditorProps) {
  const [name, setName] = useState(rotor.name);
  const [description, setDescription] = useState(rotor.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullPermutation, setShowFullPermutation] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedRotor = createUpdatedRotor(rotor, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      const result = updateRotor(updatedRotor);
      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Failed to save rotor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name !== rotor.name || description !== (rotor.description || '');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getSymbolForIndex = (index: number): string => {
    return CHARSET[index] || '?';
  };

  const renderPermutationGrid = () => {
    const displayCount = showFullPermutation ? 64 : 32;
    const permutation = rotor.permutation.slice(0, displayCount);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Permutation Mapping ({displayCount} of 64 shown)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullPermutation(!showFullPermutation)}
          >
            {showFullPermutation ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-1 text-xs font-mono">
          {permutation.map((outputIndex, inputIndex) => (
            <div
              key={inputIndex}
              className="bg-muted rounded p-2 text-center"
              title={`Input: ${getSymbolForIndex(inputIndex)} (${inputIndex}) → Output: ${getSymbolForIndex(outputIndex)} (${outputIndex})`}
            >
              <div className="font-bold text-primary">
                {getSymbolForIndex(inputIndex)}
              </div>
              <div className="text-muted-foreground">↓</div>
              <div className="font-bold">
                {getSymbolForIndex(outputIndex)}
              </div>
            </div>
          ))}
        </div>

        {!showFullPermutation && (
          <div className="text-center text-muted-foreground text-xs">
            ... {64 - displayCount} more mappings
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Rotor Configuration</CardTitle>
              <CardDescription>
                Modify rotor metadata and view permutation details
              </CardDescription>
            </div>
            <Badge variant="secondary">{rotor.id.slice(0, 8)}...</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metadata" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="permutation">Permutation</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Rotor Name *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                    disabled={isSaving}
                    placeholder="Optional description for this rotor..."
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {hasChanges ? 'You have unsaved changes' : 'No changes made'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges || !name.trim()}
                    >
                      {isSaving ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permutation" className="space-y-4">
              {renderPermutationGrid()}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rotor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{rotor.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbols:</span>
                      <span>64 (A-Z, a-z, 0-9, space, period)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>Permutation Cipher</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Created:</div>
                      <div className="font-mono text-xs">{formatDate(rotor.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Modified:</div>
                      <div className="font-mono text-xs">{formatDate(rotor.updatedAt)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Permutation Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Mappings:</div>
                      <div className="font-bold">64</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Unique Values:</div>
                      <div className="font-bold">64</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Min Value:</div>
                      <div className="font-bold">{Math.min(...rotor.permutation)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Value:</div>
                      <div className="font-bold">{Math.max(...rotor.permutation)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
