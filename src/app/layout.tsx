import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppProvider } from '@/lib/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { isClerkConfigured } from '@/lib/clerk';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'CrossTech Collaboration OS - Multi-Tenant Workspace',
  description:
    'Enterprise-grade multi-tenant collaboration operating system with strict hierarchy: Platform -> Organization -> Department -> Team -> Members. Featuring Slack-style channels, Jira-style Kanban, RBAC authorization, and Supabase database isolation.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const content = (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {isClerkConfigured ? (
          <ClerkProvider>{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
