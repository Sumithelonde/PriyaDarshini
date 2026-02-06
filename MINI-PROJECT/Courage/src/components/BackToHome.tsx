import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken, getUser, signOut } from '@/utils/authStorage';

/**
 * BackToHome - Navigation button that takes users back to the homepage.
 * Features:
 * - Hides automatically on the home page
 * - Keyboard shortcut: Alt + ← (Alt + Left Arrow)
 * - Smooth hover animations
 * - Consistent styling across all pages
 */
const BackToHome: React.FC<{ className?: string; alwaysShow?: boolean }> = ({ className, alwaysShow = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the button on the home page (unless alwaysShow is true)
  if (!alwaysShow && (location.pathname === '/' || location.pathname === '' || location.pathname === '/home')) return null;

  const handleBackToHome = () => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      // If authenticated, go to role-specific home
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'ngo') navigate('/ngo');
      else if (user.role === 'lawyer') navigate('/lawyer');
      else if (user.role === 'individual') navigate('/home');
      else navigate('/home');
    } else {
      // If not authenticated, go to public landing page
      signOut();
      navigate('/');
    }
  };

  // Keyboard shortcut: Alt + Left Arrow
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleBackToHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Button
      variant="outline"
      onClick={handleBackToHome}
      title="Back to Home (Alt + ←)"
      className={className || 'inline-flex items-center gap-1 sm:gap-2 text-foreground bg-background hover:bg-accent hover:scale-105 px-2 sm:px-4 py-2 transition-all duration-200 ease-in-out border border-border shadow-sm hover:shadow-md relative z-50'}
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
      <span className="font-medium hidden sm:inline">Back to Home</span>
      <span className="font-medium text-xs sm:hidden">Back</span>
    </Button>
  );
};

export default BackToHome;
