import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Sparkles, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#faq', label: 'FAQ' },
];

export default function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            Interview<span className="text-primary">Ace</span> AI
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>

          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register">Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                Interview<span className="text-primary">Ace</span> AI
              </Link>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                AI-powered interview preparation for students and job seekers. Practice smarter, get hired faster.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: 'Features', to: '/features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Mock Interviews', to: '/register' },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: 'About', to: '/#about' },
                { label: 'Contact', to: '/#contact' },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: 'Privacy Policy', to: '/#' },
                { label: 'Terms of Service', to: '/#' },
              ]}
            />
          </div>

          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} InterviewAce AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
