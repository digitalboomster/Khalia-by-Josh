import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@context/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 12) return 'Password must be at least 12 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain a number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain a special character';
    return null;
  };

  const validatePhoneNumber = (phone: string): string | null => {
    // Nigerian format: +234 or 0, followed by 7, 8, or 9, then 9 digits
    if (!/^(\+234|0)[789]\d{9}$/.test(phone)) {
      return 'Invalid Nigerian phone number. Use format: 08012345678 or +2348012345678';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.phone, formData.firstName, formData.lastName);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Join Khalia</CardTitle>
          <p className="text-sm text-slate-500 mt-2">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error || authError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone *</label>
              <Input
                type="tel"
                name="phone"
                placeholder="09012345678 or +2349012345678"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">Nigerian number: 080-089 or 070-079 networks</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password *</label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-2">Must contain: 12+ characters, uppercase, lowercase, number, special char (!@#$%^&* etc)</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm Password *</label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-emerald-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
