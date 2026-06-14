import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center grid-bg">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </Button>
    </div>
  );
}
