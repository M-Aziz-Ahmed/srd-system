'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Get the actual user session to determine role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role) {
          const role = session.user.role;
          
          // Redirect based on actual role from session
          if (role === 'admin') {
            router.push('/dashboard/admin');
          } else if (role === 'production-manager') {
            router.push('/dashboard/production-manager');
          } else {
            // For department roles (vmd, cad, commercial, mmc, etc.)
            router.push(`/dashboard/${role}`);
          }
        } else {
          // Fallback
          router.push('/dashboard/vmd');
        }
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'vmd@demo.com', role: 'VMD Manager' },
    { email: 'cad@demo.com', role: 'CAD Manager' },
    { email: 'commercial@demo.com', role: 'Commercial Manager' },
    { email: 'mmc@demo.com', role: 'MMC Manager' },
    { email: 'production@demo.com', role: 'Production Manager' },
    { email: 'admin@demo.com', role: 'Admin' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">SRD Tracking System</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-4">Demo Password: password</p>
            
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-center text-gray-700">Demo Accounts:</p>
              {demoCredentials.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password');
                  }}
                  className="w-full text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <span className="font-medium">{cred.role}:</span> {cred.email}
                </button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}