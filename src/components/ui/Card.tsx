import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-lg';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800',
    outline: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-md',
  };
  
  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };
  
  // Combine all styles
  const cardStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${paddingStyles[padding]} 
    ${className}
  `;

  return (
    <div className={cardStyles} {...props}>
      {children}
    </div>
  );
};

export default Card;
