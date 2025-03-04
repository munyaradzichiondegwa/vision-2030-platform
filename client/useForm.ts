import { useState, useCallback } from 'react';
import FormValidator from '../utils/formValidation';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: Record<keyof T, any[]>;
  onSubmit: (values: T) => Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema = {},
  onSubmit
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate individual field if schema exists
    if (validationSchema[name]) {
      const fieldError = FormValidator.validateField(
        value, 
        validationSchema[name]
      );
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [validationSchema]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate entire form
    const formErrors = FormValidator.validateForm(values, validationSchema);
    setErrors(formErrors);

    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== null);
    
    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validationSchema, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
};