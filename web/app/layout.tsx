import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelAdvisor — AI Trip Planner',
  description: 'Plan your perfect trip with AI-powered personalized itineraries',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
