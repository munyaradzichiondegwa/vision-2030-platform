import React from 'react';

interface AccessibleComponentProps {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
}

const AccessibleComponent: React.FC<AccessibleComponentProps> = ({ 
  children, 
  role = 'region', 
  ariaLabel 
}) => {
  return (
    <div>
      role={role} 
      aria-label={ariaLabel}
      className="accessible-component"
      {children}
    </div>
  );
};

export default AccessibleComponent;