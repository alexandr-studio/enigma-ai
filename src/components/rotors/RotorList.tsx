/**
 * Rotor list component
 * 
 * Displays all stored rotor configurations in a clean,
 * organized layout with actions for each rotor.
 */

'use client';

import { useState } from 'react';
import { Edit2, Trash2, Copy, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RotorConfig } from '@/lib/rotors/types';
import { removeRotor } from '@/lib/storage/rotors';

interface RotorListProps {
  rotors: RotorConfig[];
  onEdit: (rotor: RotorConfig) => void;
  onUpdate: () => void;
}

export function RotorList({ rotors, onEdit, onUpdate }: RotorListProps) {
  const [rotorToDelete, setRotorToDelete] = useState<RotorConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!rotorToDelete) return;

    setIsDeleting(true);
    try {
      const result = removeRotor(rotorToDelete.id);
      if (result.success) {
        onUpdate();
        setRotorToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete rotor:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const copyRotorId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  if (rotors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No rotors found. Create your first rotor to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rotors.map((rotor) => (
          <Card key={rotor.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">
                    {rotor.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      64-symbol
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {rotor.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyRotorId(rotor.id)}
                  title="Copy Rotor ID"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {rotor.description && (
                <CardDescription className="line-clamp-2">
                  {rotor.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Metadata */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created: {formatDate(rotor.createdAt)}</div>
                  {rotor.updatedAt.getTime() !== rotor.createdAt.getTime() && (
                    <div>Updated: {formatDate(rotor.updatedAt)}</div>
                  )}
                </div>

                {/* Permutation Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Permutation Preview:
                  </div>
                  <div className="bg-muted rounded p-2 text-xs font-mono">
                    <div className="flex flex-wrap gap-1">
                      {rotor.permutation.slice(0, 16).map((value, index) => (
                        <span
                          key={index}
                          className="inline-block w-6 text-center"
                          title={`Position ${index} → ${value}`}
                        >
                          {value.toString().padStart(2, '0')}
                        </span>
                      ))}
                      <span className="text-muted-foreground">...</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(rotor)}
                    className="flex-1 mr-2"
                  >
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotorToDelete(rotor)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!rotorToDelete} onOpenChange={() => setRotorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rotor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{rotorToDelete?.name}"? 
              This action cannot be undone and will permanently remove the rotor configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
