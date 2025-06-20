import Link from 'next/link';
import { SignOutButton } from './auth/SignOutButton';

export const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
            Dashboard
          </Link>
        </div>
        <SignOutButton />
      </div>
    </nav>
  );
};
