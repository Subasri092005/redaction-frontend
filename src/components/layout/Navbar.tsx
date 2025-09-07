import React from 'react';
import { Search, Bell, CheckCircle, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10 bg-muted border-border"
          />
        </div>
      </div>

      {/* Right Side: Only User Profile */}
      <div className="flex items-center">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="Dr. Sarah Johnson" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Navbar;