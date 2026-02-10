'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { validateInvite, acceptInvite } from '@/features/stylistInvite/stylistInviteThunks';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { invitePreview, loading, error, acceptSuccess } = useAppSelector((s) => s.stylistInvite);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validateName = (value: string): string => {
    if (!value.trim()) {
      return 'Full name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.trim().length > 50) {
      return 'Name must not exceed 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) {
      return ''; 
    }
    const cleanPhone = value.replace(/\s/g, '');
    
    const coreNumber = cleanPhone.startsWith('+91') ? cleanPhone.slice(3) : cleanPhone;
    
    if (!/^\d{10}$/.test(coreNumber)) {
      return 'Phone number must contain exactly 10 digits';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    if (!/[!@#$%^&*]/.test(value)) return 'Must contain at least one special character (!@#$%^&*)';
    return '';
  };
  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof typeof form) => {
    let error = '';

    switch (field) {
      case 'name':
        error = validateName(form.name);
        break;
      case 'phone':
        error = validatePhone(form.phone);
        break;
      case 'password':
        error = validatePassword(form.password);
        if (form.confirmPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(form.password, form.confirmPassword);
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const field = id as keyof typeof form;

    const newValue = field === 'phone' ? value.replace(/\s/g, '') : value;

    setForm((prev) => ({ ...prev, [field]: newValue }));

    if (touched[field]) {
      validateField(field);
    }
  };

  const isFormValid = (): boolean => {
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);

    return !nameError && !phoneError && !passwordError && !confirmPasswordError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);

    setFieldErrors({
      name: nameError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (!nameError && !phoneError && !passwordError && !confirmPasswordError && token) {
      const cleanPhone = form.phone.trim().replace(/\s/g, '');
      
      dispatch(
        acceptInvite({
          token,
          name: form.name.trim(),
          phone: cleanPhone || undefined,
          password: form.password,
        }),
      );
    }
  };

  useEffect(() => {
    if (token) {
      dispatch(validateInvite({ token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (acceptSuccess) {
      setTimeout(() => navigate('/stylist/login'), 3000);
    }
  }, [acceptSuccess, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
          <p className="text-lg">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-10 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-xl font-semibold text-red-600">{error}</p>
            <p className="mt-4 text-muted-foreground">Please contact admin for a new invite.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <span className="text-2xl">✓</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">Success!</p>
            <p className="mt-4 text-lg">Your account has been created.</p>
            <p className="mt-2 text-muted-foreground">
              Waiting for admin approval. You will be redirected to login shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-6 space-y-2 text-sm rounded-lg bg-muted">
            <p>
              <strong>Invited Email:</strong> {invitePreview?.email}
            </p>
            {/* <p>
              <strong>Specialization:</strong> {invitePreview?.specialization}
            </p>
            <p>
              <strong>Experience:</strong> {invitePreview?.experience} years
            </p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleInputChange}
                onBlur={() => handleBlur('name')}
                className={`mt-1 transition-colors ${
                  touched.name && fieldErrors.name
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.name && fieldErrors.name && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.name}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="font-medium">
                Phone <span className="text-xs text-gray-400">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={form.phone}
                onChange={handleInputChange}
                onBlur={() => handleBlur('phone')}
                className={`mt-1 transition-colors ${
                  touched.phone && fieldErrors.phone
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.phone && fieldErrors.phone && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.phone}</p>
                </div>
              )}
            </div>
            {/* 
            <div>
              <Label htmlFor="password" className="font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleInputChange}
                onBlur={() => handleBlur('password')}
                className={`mt-1 transition-colors ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.password && fieldErrors.password && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.password}</p>
                </div>
              )}
            </div> */}

            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Strong password"
                  value={form.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('password')}
                  className={
                    touched.password && fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strong password feedback */}
              {touched.password && (
                <div className="mt-2 space-y-1 text-xs">
                  {[
                    { valid: form.password.length >= 8, text: 'At least 8 characters' },
                    { valid: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
                    { valid: /[a-z]/.test(form.password), text: 'One lowercase letter' },
                    { valid: /[0-9]/.test(form.password), text: 'One number' },
                    {
                      valid: /[!@#$%^&*]/.test(form.password),
                      text: 'One special char (!@#$%^&*)',
                    },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={rule.valid ? 'text-green-600' : 'text-red-600'}>
                        {rule.valid ? '✓' : '✗'}
                      </span>
                      <span className={rule.valid ? 'text-green-600' : 'text-red-600'}>
                        {rule.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <p className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleInputChange}
                onBlur={() => handleBlur('confirmPassword')}
                className={`mt-1 transition-colors ${
                  touched.confirmPassword && fieldErrors.confirmPassword
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.confirmPassword}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid()}
              size="lg"
              className="w-full mt-6"
            >
              {loading ? 'Completing Registration...' : 'Complete Registration'}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            After submission, the admin will review and approve your account before you can log in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
