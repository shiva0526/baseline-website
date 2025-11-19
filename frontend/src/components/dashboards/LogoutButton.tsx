
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logout } from '@/utils/authUtils';

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const LogoutButton = ({ variant = "ghost" }: LogoutButtonProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout(navigate);
  };
  
  return (
    <Button variant={variant} onClick={handleLogout} className="text-gray-300">
      <LogOut size={18} className="mr-2" /> Logout
    </Button>
  );
};

export default LogoutButton;
