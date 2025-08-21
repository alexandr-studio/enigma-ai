import { AppLayout, PageLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <AppLayout>
      <PageLayout
        title="Enigma+ Encryption"
        description="Secure message encoding and decoding with custom rotor mappings and advanced obfuscation features"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Welcome to Enigma+
                <Badge variant="secondary">Beta</Badge>
              </CardTitle>
              <CardDescription>
                A modern implementation of rotor-based encryption with enhanced security features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  🚧 Development Status: Phase 4 - Building UI Components
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  The encryption engine and storage system are complete. UI components are being developed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">64-Symbol Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for letters, numbers, spaces, and punctuation with custom rotor permutations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data stored locally in your browser. No cloud dependencies or external API calls.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Obfuscation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pre-encryption layer that eliminates patterns and statistical vulnerabilities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Development Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Progress</CardTitle>
              <CardDescription>Current implementation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project Foundation</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Core Encryption Engine</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Local Storage System</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">UI Components</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advanced Obfuscation</span>
                  <Badge variant="outline">Planned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </AppLayout>
  );
}
