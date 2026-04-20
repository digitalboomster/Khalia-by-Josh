import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { kycService } from '../services/kyc';
import { Shield, CheckCircle2, AlertCircle, Loader, Upload } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [bvn, setBvn] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [biometricFile, setBiometricFile] = useState<File | null>(null);

  // Load KYC status on mount
  useEffect(() => {
    const loadKycStatus = async () => {
      try {
        const status = await kycService.getKYCStatus();
        setKycStatus(status);
        // Set current step based on what's completed
        setCurrentStep(Math.floor(status.completion_percentage / 20));
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadKycStatus();
  }, []);

  const steps = [
    { title: 'BVN Verification', icon: Shield },
    { title: 'Facial Recognition', icon: Shield },
    { title: 'Bank Account', icon: Shield },
    { title: 'Phone Verification', icon: Shield },
    { title: 'Complete!', icon: CheckCircle2 },
  ];

  const handleVerifyBVN = async () => {
    if (!bvn) {
      setError('Please enter BVN');
      return;
    }
    try {
      setLoading(true);
      await kycService.verifyBVN(bvn);
      setCurrentStep(1);
      setBvn('');
      setError(null);
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBiometric = async () => {
    if (!biometricFile) {
      setError('Please upload a photo');
      return;
    }
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await kycService.verifyBiometric(base64);
        setCurrentStep(2);
        setBiometricFile(null);
        setError(null);
        await refreshUser();
      };
      reader.readAsDataURL(biometricFile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBank = async () => {
    if (!bankCode || !accountNumber || !accountName) {
      setError('Please fill all bank details');
      return;
    }
    try {
      setLoading(true);
      await kycService.verifyBankAccount(accountNumber, bankCode, accountName);
      setCurrentStep(3);
      setError(null);
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToComplete = () => {
    // After 3 steps, allow them to proceed
    navigate('/dashboard');
  };

  if (!kycStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-slate-600">Let's verify your identity to get started</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      idx <= currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <p className="text-xs text-center text-slate-600">{step.title}</p>
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: BVN */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>BVN Verification</CardTitle>
              <p className="text-sm text-slate-500 mt-2">
                Enter your 11-digit Bank Verification Number
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">BVN *</label>
                <Input
                  type="text"
                  placeholder="12345678901"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="mt-1"
                  maxLength={11}
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">{bvn.length}/11 characters</p>
              </div>

              <Button
                onClick={handleVerifyBVN}
                disabled={loading || bvn.length !== 11}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify BVN
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Biometric */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Facial Recognition</CardTitle>
              <p className="text-sm text-slate-500 mt-2">
                Upload a clear selfie for biometric verification
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                {biometricFile ? (
                  <div>
                    <p className="text-sm font-medium text-slate-700">{biometricFile.name}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBiometricFile(null)}
                      className="mt-2"
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload photo</p>
                    <p className="text-xs text-slate-500">JPG or PNG, max 5MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setBiometricFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Button
                onClick={handleVerifyBiometric}
                disabled={loading || !biometricFile}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify Biometric
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Bank Account */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Verification</CardTitle>
              <p className="text-sm text-slate-500 mt-2">Link your bank account for payouts</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bank Code *</label>
                <Input
                  placeholder="033 (GTBank)"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Account Number *</label>
                <Input
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Account Name *</label>
                <Input
                  placeholder="Your Full Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleVerifyBank}
                disabled={loading || !bankCode || !accountNumber || !accountName}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify Bank Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep >= 3 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">You're All Set!</h2>
              <p className="text-emerald-700 mb-6">Your Khalia account is fully verified and ready to use</p>

              <Button
                onClick={handleSkipToComplete}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
