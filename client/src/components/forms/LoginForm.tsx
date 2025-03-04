import React from 'react';
import { useForm } from '../../hooks/useForm';
import FormValidator from '../../utils/formValidation';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { 
    values, 
    errors, 
    isSubmitting, 
    handleChange, 
    handleSubmit 
  } = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: {
      email: [
        FormValidator.required('Email is required'),
        FormValidator.email()
      ],
      password: [
        FormValidator.required('Password is required'),
        FormValidator.minLength(8, 'Password must be at least 8 characters')
      ]
    },
    onSubmit: async (values) => {
      // Implement login logic
      console.log('Submitting', values);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>
      <div>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Password"
          className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;