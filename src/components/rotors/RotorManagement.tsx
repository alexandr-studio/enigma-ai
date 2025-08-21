/**
 * Main rotor management component
 * 
 * Provides a comprehensive interface for managing rotor configurations
 * including listing, creating, editing, and deleting rotors.
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotorConfig } from '@/lib/rotors/types';
import { loadRotors, addRotor } from '@/lib/storage/rotors';
import { createRandomRotor } from '@/lib/rotors/generator';
import { RotorList } from './RotorList';
import { RotorEditor } from './RotorEditor';
import { RotorGenerator } from './RotorGenerator';

export function RotorManagement() {
  const [rotors, setRotors] = useState<Map<string, RotorConfig>>(new Map());
  const [selectedRotor, setSelectedRotor] = useState<RotorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rotors on component mount
  useEffect(() => {
    loadRotorsFromStorage();
  }, []);

  const loadRotorsFromStorage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = loadRotors();
      if (result.success && result.data) {
        setRotors(result.data);
      } else {
        setError(result.error || 'Failed to load rotors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRandomRotor = async () => {
    try {
      const newRotor = createRandomRotor(`Rotor ${rotors.size + 1}`);
      const result = addRotor(newRotor);
      
      if (result.success) {
        await loadRotorsFromStorage();
        setSelectedRotor(newRotor);
      } else {
        setError(result.error || 'Failed to create rotor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rotor');
    }
  };

  const handleRotorUpdated = () => {
    loadRotorsFromStorage();
  };

  const handleEditRotor = (rotor: RotorConfig) => {
    setSelectedRotor(rotor);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 animate-spin" />
          <span>Loading rotors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Error: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRotorsFromStorage}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rotors</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rotors.size}</div>
            <p className="text-xs text-muted-foreground">
              of 10 maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{10 - rotors.size}</div>
            <p className="text-xs text-muted-foreground">
              slots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleCreateRandomRotor}
              disabled={rotors.size >= 10}
              className="flex-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Upload className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Rotor List</TabsTrigger>
          <TabsTrigger value="generator">Generate New</TabsTrigger>
          {selectedRotor && (
            <TabsTrigger value="editor">
              Edit: {selectedRotor.name}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <RotorList
            rotors={Array.from(rotors.values())}
            onEdit={handleEditRotor}
            onUpdate={handleRotorUpdated}
          />
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <RotorGenerator
            onRotorCreated={handleRotorUpdated}
            currentRotorCount={rotors.size}
          />
        </TabsContent>

        {selectedRotor && (
          <TabsContent value="editor" className="space-y-4">
            <RotorEditor
              rotor={selectedRotor}
              onSave={handleRotorUpdated}
              onCancel={() => setSelectedRotor(null)}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Empty State */}
      {rotors.size === 0 && !error && (
        <Card>
          <CardHeader>
            <CardTitle>No Rotors Yet</CardTitle>
            <CardDescription>
              Create your first rotor configuration to get started with encryption.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateRandomRotor}>
                <Plus className="h-4 w-4 mr-2" />
                Create Random Rotor
              </Button>
              <span className="text-muted-foreground">or</span>
              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Import Rotors
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
