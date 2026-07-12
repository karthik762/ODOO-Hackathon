import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(localError || error) && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-6 flex items-start gap-2">
                <span className="block sm:inline">{localError || error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 bg-background/50"
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-6 pb-8">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
