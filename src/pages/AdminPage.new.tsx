import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Home, LogOut } from 'lucide-react';
import { AdminPanel } from '../components/AdminPanel.new';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

export const AdminPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and App Name */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Wallet className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Finance Planner
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* User info - hidden on mobile */}
            {user && (
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
                {user.email}
              </span>
            )}
            
            {/* Dashboard Link */}
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminPanel />
      </div>
    </div>
  );
};

export default AdminPage;
