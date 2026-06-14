import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Request failed', description: error.message });
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 grid-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            Interview<span className="text-primary">Ace</span> AI
          </Link>
          <CardTitle className="mt-4 text-2xl">Reset your password</CardTitle>
          <CardDescription>We'll email you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                <MailCheck className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-semibold text-foreground">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
