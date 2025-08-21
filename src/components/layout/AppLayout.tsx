/**
 * Main application layout wrapper
 * 
 * Provides consistent layout structure with navigation
 * and responsive design for the entire application.
 */

'use client';

import { MainNav, CompactNav } from '@/components/navigation/MainNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main navigation for desktop/tablet */}
      <MainNav />
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
      
      {/* Compact navigation for mobile */}
      <CompactNav />
    </div>
  );
}

/**
 * Page wrapper for consistent spacing and layout
 */
interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageLayout({ title, description, children, actions }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
