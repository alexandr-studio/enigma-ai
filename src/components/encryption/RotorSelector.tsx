/**
 * Rotor selection component
 * 
 * Allows users to select which rotors to use for encryption
 * from their available rotor configurations.
 */

'use client';

import { useState } from 'react';
import { RotateCcw, Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotorConfig } from '@/lib/rotors/types';

interface RotorSelectorProps {
  availableRotors: RotorConfig[];
  selectedRotors: RotorConfig[];
  onSelectionChange: (rotors: RotorConfig[]) => void;
  maxRotors?: number;
}

export function RotorSelector({ 
  availableRotors, 
  selectedRotors, 
  onSelectionChange,
  maxRotors = 5 
}: RotorSelectorProps) {
  const [isAddingRotor, setIsAddingRotor] = useState(false);

  const availableForSelection = availableRotors.filter(
    rotor => !selectedRotors.some(selected => selected.id === rotor.id)
  );

  const handleAddRotor = (rotorId: string) => {
    const rotor = availableRotors.find(r => r.id === rotorId);
    if (rotor) {
      onSelectionChange([...selectedRotors, rotor]);
      setIsAddingRotor(false);
    }
  };

  const handleRemoveRotor = (rotorId: string) => {
    onSelectionChange(selectedRotors.filter(r => r.id !== rotorId));
  };

  const handleMoveRotor = (fromIndex: number, toIndex: number) => {
    const newRotors = [...selectedRotors];
    const [movedRotor] = newRotors.splice(fromIndex, 1);
    newRotors.splice(toIndex, 0, movedRotor);
    onSelectionChange(newRotors);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Active Rotors</h3>
          <p className="text-sm text-muted-foreground">
            Select and order rotors for encryption ({selectedRotors.length}/{maxRotors})
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingRotor(true)}
          disabled={selectedRotors.length >= maxRotors || availableForSelection.length === 0}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Rotor
        </Button>
      </div>

      {/* Selected Rotors List */}
      {selectedRotors.length > 0 ? (
        <div className="space-y-2">
          {selectedRotors.map((rotor, index) => (
            <Card key={rotor.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div className="flex flex-col space-y-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveRotor(index, index - 1)}
                          className="h-4 w-4 p-0"
                        >
                          ↑
                        </Button>
                      )}
                      {index < selectedRotors.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveRotor(index, index + 1)}
                          className="h-4 w-4 p-0"
                        >
                          ↓
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium truncate">{rotor.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        64-symbol
                      </Badge>
                    </div>
                    {rotor.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {rotor.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Created {formatDate(rotor.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {rotor.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRotor(rotor.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
            <h4 className="font-medium">No Rotors Selected</h4>
            <p className="text-sm text-muted-foreground">
              Choose rotors from your configurations to start encrypting
            </p>
          </div>
        </Card>
      )}

      {/* Add Rotor Dialog */}
      {isAddingRotor && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add Rotor</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingRotor(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {availableForSelection.length > 0 ? (
              <Select onValueChange={handleAddRotor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rotor to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableForSelection.map((rotor) => (
                    <SelectItem key={rotor.id} value={rotor.id}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{rotor.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {rotor.id.slice(0, 8)}...
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                All available rotors are already selected.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Usage Hint */}
      <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
        <p className="font-medium mb-1">💡 Rotor Order Matters</p>
        <p>
          The order of rotors affects encryption strength. Use the ↑↓ buttons to reorder.
          Multiple rotors provide layered encryption for enhanced security.
        </p>
      </div>
    </div>
  );
}
