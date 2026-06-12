import type { Metadata } from 'next';
import './globals.css';
import { FlowProvider } from '../context/FlowContext';

export const metadata: Metadata = {
  title: 'NexusFlow AI — Smart Venue Crowd Management Platform',
  description: 'AI-first real-time crowd dynamics, predictive navigation, and response coordination for large-scale stadiums.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <FlowProvider>
          {children}
        </FlowProvider>
      </body>
    </html>
  );
}
