import { User, Project } from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};