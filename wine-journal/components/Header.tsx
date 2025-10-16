
import React from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  // Get display name or email, removing everything after @ in email
  const displayName = user 
    ? user.displayName || user.email?.split('@')[0] || 'User'
    : null;

  return (
    <header className="flex items-center justify-between pb-4 border-b border-gray-200">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Journal</h1>
        {displayName && (
          <p className="mt-2 text-lg text-gray-600">Welcome, {displayName}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
