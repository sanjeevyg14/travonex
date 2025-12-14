
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travonex Pro',
  description: 'Upgrade to Travonex Pro to unlock exclusive deals, get unlimited AI trip planning, and save 5% on every booking.',
};

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
