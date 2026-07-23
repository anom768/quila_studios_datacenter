import { UserProvider } from '../../context/UserContext';
import ProtectedNav from '../../components/ProtectedNav';

export default function ProtectedLayout({ children }) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ProtectedNav />
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
