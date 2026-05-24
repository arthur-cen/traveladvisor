import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expedition Planner — TravelAdvisor',
  description: 'Chart your next expedition. AI-crafted itineraries for the discerning traveler.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
