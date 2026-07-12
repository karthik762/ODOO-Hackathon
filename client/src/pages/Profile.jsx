import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Building2, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, updateProfile, error, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [setError]);

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

    if (!formData.name || !formData.email) {
      setLocalError('Name and Email are required.');
      setIsLoading(false);
      return;
    }

    if (formData.password) {
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
    }

    const res = await updateProfile(
      formData.name,
      formData.email,
      formData.password || undefined
    );

    setIsLoading(false);
    if (res.success) {
      toast.success('Profile updated successfully!');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } else {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My Profile" 
        description="Manage your account profile details, change login information, and view permissions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-md bg-card">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                <span className="text-3xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <CardTitle className="text-xl font-bold">{user?.name || 'User'}</CardTitle>
              <CardDescription className="capitalize font-medium text-primary">
                {user?.role === 'AssetManager' ? 'Asset Manager' : user?.role === 'DepartmentHead' ? 'Department Head' : user?.role || 'Employee'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/20">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                  <p className="text-sm font-semibold truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/20">
                <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium">System Role</p>
                  <p className="text-sm font-semibold">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/20">
                <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium">Department</p>
                  <p className="text-sm font-semibold">{user?.department || 'Not Assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/20">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium">Account Status</p>
                  <p className="text-sm font-semibold capitalize text-emerald-500">{user?.status || 'Active'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Update Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Update Details</CardTitle>
              <CardDescription>
                Modify your personal details and change your account password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(localError || error) && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-6">
                  {localError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-9 h-10 bg-background/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="text"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-9 h-10 bg-background/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 my-6 pt-6">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <Lock className="w-4 h-4 text-primary" /> Security & Password Update
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Leave blank to keep same"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-10 bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Leave blank to keep same"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="h-10 bg-background/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading} className="px-6 h-10">
                    {isLoading ? "Saving changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
