import React from 'react';
import { User } from '../types';

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      {user.role && (
        <span className="inline-block bg-brand-primary text-white text-xs px-2 py-1 rounded mt-2">
          {user.role}
        </span>
      )}
    </div>
  );
};

export default UserCard;