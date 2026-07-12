import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
    department: ''
  });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, user, error, setError } = useAuth();
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

  const handleRoleChange = (val) => {
    setFormData({ ...formData, role: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
      formData.department
    );

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
        className="w-full max-w-lg"
      >
        <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-base">
              Register to join the AssetFlow Enterprise ERP
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
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11 bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="h-11 bg-background/50">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="DepartmentHead">Department Head</SelectItem>
                      <SelectItem value="AssetManager">Asset Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="e.g. IT, HR"
                    value={formData.department}
                    onChange={handleChange}
                    className="h-11 bg-background/50"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-6 pb-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
