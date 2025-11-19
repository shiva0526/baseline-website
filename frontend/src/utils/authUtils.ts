
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const logout = (navigate: NavigateFunction) => {
  // Clear authentication data
  localStorage.removeItem('userRole');
  
  // Show toast notification
  toast({
    title: "Logged out successfully",
    description: "You have been logged out of your account",
  });
  
  // Redirect to login page
  navigate('/login');
};
