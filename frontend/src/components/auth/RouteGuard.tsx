
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

interface RouteGuardProps {
  children: ReactNode;
  requiredRole: 'coach' | 'parent';
}

const RouteGuard = ({ children, requiredRole }: RouteGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check for userRole in localStorage
    const userRole = localStorage.getItem('userRole');
    console.log('RouteGuard checking role:', { userRole, requiredRole });
    
    if (!userRole) {
      // Not logged in, redirect to login
      console.log('No user role found, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate('/login', { replace: true });
      return;
    }
    
    if (userRole !== requiredRole) {
      // Wrong role, redirect to login
      console.log('Wrong role, redirecting to login');
      toast({
        title: "Access denied",
        description: `You need to be logged in as a ${requiredRole} to access this page.`,
        variant: "destructive"
      });
      navigate('/login', { replace: true });
      return;
    }
    
    // User is authorized
    console.log('User authorized');
    setAuthorized(true);
  }, [navigate, requiredRole, toast]);

  // Show nothing while checking authorization
  if (!authorized) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
};

export default RouteGuard;
