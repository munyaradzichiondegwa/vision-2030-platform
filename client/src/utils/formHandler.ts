import { useState, ChangeEvent } from 'react';

interface FormField {
  value: string;
  error: string;
  validate: () => boolean;
}

export const useForm = <T extends Record<string, FormField>>(initialState: T) => {
  const [fields, setFields] = useState(initialState);

  const handleChange = (key: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFields(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        error: ''
      }
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const updatedFields = { ...fields };

    Object.keys(updatedFields).forEach(key => {
      const field = updatedFields[key as keyof T];
      const fieldIsValid = field.validate();
      
      if (!fieldIsValid) {
        isValid = false;
      }
    });

    setFields(updatedFields);
    return isValid;
  };

  const resetForm = () => {
    setFields(initialState);
  };

  const getFormData = () => {
    return Object.keys(fields).reduce((acc, key) => {
      acc[key] = fields[key as keyof T].value;
      return acc;
    }, {} as { [K in keyof T]: string });
  };

  return {
    fields,
    handleChange,
    validateForm,
    resetForm,
    getFormData
  };
};