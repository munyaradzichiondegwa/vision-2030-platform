import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { fetchUsers } from '../services/api';
import UserCard from '../components/UserCard';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;