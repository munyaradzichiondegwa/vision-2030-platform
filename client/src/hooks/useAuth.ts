import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// src/hooks/useValidation.ts
import { useState } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
}

export const useValidation = (initialValue = '', rules: ValidationRules = {}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const validate = () => {
    if (rules.required && !value) {
      setError('This field is required');
      return false;
    }

    if (rules.minLength && value.length < rules.minLength) {
      setError(`Minimum length is ${rules.minLength} characters`);
      return false;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      setError(`Maximum length is ${rules.maxLength} characters`);
      return false;
    }

    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Invalid email format');
        return false;
      }
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      setError('Invalid format');
      return false;
    }

    setError('');
    return true;
  };

  return {
    value,
    error,
    setValue,
    validate,
  };
};