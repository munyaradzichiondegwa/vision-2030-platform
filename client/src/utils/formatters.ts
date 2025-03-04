// Utility functions for formatting
export const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  export const truncateText = (text: string, maxLength: number = 100): string => {
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };