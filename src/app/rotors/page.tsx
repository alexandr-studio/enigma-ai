import { AppLayout, PageLayout } from '@/components/layout/AppLayout';
import { RotorManagement } from '@/components/rotors/RotorManagement';

export default function RotorsPage() {
  return (
    <AppLayout>
      <PageLayout
        title="Rotor Management"
        description="Create, edit, and manage your encryption rotor configurations"
      >
        <RotorManagement />
      </PageLayout>
    </AppLayout>
  );
}
