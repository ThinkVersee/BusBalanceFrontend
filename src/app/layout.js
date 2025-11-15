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
      <body>
        <ReduxProvider>
          <RouteGuard>
            {children}
          </RouteGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}