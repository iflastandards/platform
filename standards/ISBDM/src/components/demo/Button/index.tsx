import React from 'react';
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends AntButtonProps {
  /** The button text content */
  children: React.ReactNode;
}

/**
 * Demo Button component - wraps Ant Design Button
 * This is a demo component for the ISBDM documentation site
 */
export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <AntButton {...props}>{children}</AntButton>
);

export default Button;
