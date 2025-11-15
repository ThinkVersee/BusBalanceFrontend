import ReduxProvider from '@/providers/ReduxProvider';
import './globals.css';
import RouteGuard from '@/routes/RouteGuard';

export const metadata = {
  title: 'BusBook',
  description: 'Your app description',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Bus Icon as Favicon - Inline SVG */}
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12h20M5 17h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z'/%3E%3Ccircle cx='7' cy='17' r='2'/%3E%3Ccircle cx='17' cy='17' r='2'/%3E%3C/svg%3E"
          type="image/svg+xml"
        />
      </head>
      <body>
        <ReduxProvider>
          <RouteGuard>{children}</RouteGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}