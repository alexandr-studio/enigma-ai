/**
 * Start position controls component
 * 
 * Provides input controls for setting the starting position
 * of each selected rotor (1-64).
 */

'use client';

import { useState } from 'react';
import { RotateCcw, Shuffle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotorConfig, CHARSET_SIZE } from '@/lib/rotors/types';

interface StartPositionControlsProps {
  rotors: RotorConfig[];
  positions: number[];
  onPositionChange: (positions: number[]) => void;
}

export function StartPositionControls({ 
  rotors, 
  positions, 
  onPositionChange 
}: StartPositionControlsProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validatePosition = (value: string, index: number): number | null => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > CHARSET_SIZE) {
      return null;
    }
    return num;
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPosition = validatePosition(value, index);
    const newErrors = [...errors];
    
    if (newPosition === null && value !== '') {
      newErrors[index] = `Position must be between 1 and ${CHARSET_SIZE}`;
    } else {
      newErrors[index] = '';
    }
    
    setErrors(newErrors);
    
    if (newPosition !== null) {
      const newPositions = [...positions];
      newPositions[index] = newPosition;
      onPositionChange(newPositions);
    }
  };

  const handleRandomizeAll = () => {
    const randomPositions = rotors.map(() => 
      Math.floor(Math.random() * CHARSET_SIZE) + 1
    );
    onPositionChange(randomPositions);
    setErrors([]);
  };

  const handleRandomizeOne = (index: number) => {
    const newPositions = [...positions];
    newPositions[index] = Math.floor(Math.random() * CHARSET_SIZE) + 1;
    onPositionChange(newPositions);
    
    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleResetAll = () => {
    const resetPositions = new Array(rotors.length).fill(1);
    onPositionChange(resetPositions);
    setErrors([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Start Positions</h3>
          <p className="text-sm text-muted-foreground">
            Set the initial position for each rotor (1-{CHARSET_SIZE})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomizeAll}
          >
            <Shuffle className="h-3 w-3 mr-1" />
            Random All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Position Controls */}
      <div className="grid gap-4">
        {rotors.map((rotor, index) => (
          <Card key={rotor.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{rotor.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {rotor.id.slice(0, 8)}...
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor={`position-${index}`} className="text-sm font-medium">
                    Position:
                  </Label>
                  <div className="relative">
                    <Input
                      id={`position-${index}`}
                      type="number"
                      min="1"
                      max={CHARSET_SIZE}
                      value={positions[index] || ''}
                      onChange={(e) => handlePositionChange(index, e.target.value)}
                      className={`w-20 text-center ${errors[index] ? 'border-destructive' : ''}`}
                      placeholder="1"
                    />
                    {errors[index] && (
                      <div className="absolute top-full left-0 mt-1 text-xs text-destructive">
                        {errors[index]}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRandomizeOne(index)}
                    title="Randomize this position"
                  >
                    <Shuffle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Information Panel */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">
                Start Position Guide
              </p>
              <div className="text-blue-800 space-y-1">
                <p>• Each rotor can start at any position from 1 to {CHARSET_SIZE}</p>
                <p>• Different start positions produce completely different encrypted output</p>
                <p>• Use the same positions to decrypt messages that were encrypted with them</p>
                <p>• Random positions provide maximum security but must be shared securely</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
