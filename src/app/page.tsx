import { AppLayout, PageLayout } from '@/components/layout/AppLayout';
import { MessageProcessor } from '@/components/encryption/MessageProcessor';

export default function HomePage() {
  return (
    <AppLayout>
      <PageLayout
        title="Enigma+ Encryption"
        description="Secure message encoding and decoding with custom rotor configurations"
      >
        <MessageProcessor />
      </PageLayout>
    </AppLayout>
  );
}