interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
  }
  
  class FormValidator {
    static required(message: string = 'This field is required'): ValidationRule {
      return {
        validate: (value: any) => 
          value !== null && 
          value !== undefined && 
          value !== '',
        message
      };
    }
  
    static minLength(min: number, message?: string): ValidationRule {
      return {
        validate: (value: string) => 
          value.length >= min,
        message: message || `Minimum length is ${min} characters`
      };
    }
  
    static maxLength(max: number, message?: string): ValidationRule {
      return {
        validate: (value: string) => 
          value.length <= max,
        message: message || `Maximum length is ${max} characters`
      };
    }
  
    static email(message: string = 'Invalid email format'): ValidationRule {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        validate: (value: string) => emailRegex.test(value),
        message
      };
    }
  
    static pattern(regex: RegExp, message: string): ValidationRule {
      return {
        validate: (value: string) => regex.test(value),
        message
      };
    }
  
    static custom(
      validationFn: (value: any) => boolean, 
      message: string
    ): ValidationRule {
      return {
        validate: validationFn,
        message
      };
    }
  
    static validateField(value: any, rules: ValidationRule[]): string | null {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
      return null;
    }
  
    static validateForm(
      formData: Record<string, any>, 
      validationSchema: Record<string, ValidationRule[]>
    ): Record<string, string | null> {
      const errors: Record<string, string | null> = {};
  
      Object.keys(validationSchema).forEach(field => {
        errors[field] = this.validateField(
          formData[field], 
          validationSchema[field]
        );
      });
  
      return errors;
    }
  }
  
  export default FormValidator;