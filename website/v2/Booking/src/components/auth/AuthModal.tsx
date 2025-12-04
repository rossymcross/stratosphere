import React, { useState } from 'react';
import { X, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [view, setView] = useState<'login' | 'signup' | 'phone' | 'otp'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneStart = async () => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        setView('otp');
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
        if (error) throw error;
        onSuccess();
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
       <div className="relative w-full max-w-md bg-[#041C2C] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
         {/* Background effects */}
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#71D2EB]/5 to-transparent pointer-events-none" />
         
         <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10">
           <X className="w-5 h-5" />
         </button>

         <div className="relative z-10">
            <h2 className="font-montserrat font-black text-2xl text-white uppercase tracking-wide mb-2">
                {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Join the Squad' : view === 'otp' ? 'Verify Phone' : 'Phone Login'}
            </h2>
            <p className="text-white/60 text-sm mb-8">
                {view === 'login' ? 'Sign in to access your bookings' : view === 'signup' ? 'Create an account to get started' : view === 'otp' ? 'Enter the code sent to your phone' : 'We will send you a code'}
            </p>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">{error}</div>}
            {message && <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm">{message}</div>}

            <div className="flex flex-col gap-4">
                {(view === 'login' || view === 'signup') && (
                    <>
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 w-5 h-5 text-white/40" />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 w-5 h-5 text-white/40" />
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all"
                            />
                        </div>
                    </>
                )}

                {view === 'phone' && (
                     <div className="relative">
                        <Phone className="absolute top-3 left-3 w-5 h-5 text-white/40" />
                        <input 
                            type="tel" 
                            placeholder="Phone Number (e.g. +1555...)" 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all"
                        />
                    </div>
                )}

                {view === 'otp' && (
                     <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Enter 6-digit code" 
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-center text-xl tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-[#71D2EB] focus:bg-white/10 transition-all"
                        />
                    </div>
                )}

                <button 
                    onClick={view === 'otp' ? handleVerifyOtp : view === 'phone' ? handlePhoneStart : handleEmailAuth}
                    disabled={loading}
                    className="w-full bg-[#71D2EB] hover:bg-[#5dbcd3] text-[#041C2C] font-bold py-3 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                           <span>{view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Continue'}</span>
                           <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {(view === 'login' || view === 'signup') && (
                <>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#041C2C] px-2 text-white/40">Or continue with</span></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Official Google Button */}
                        <button 
                            onClick={handleGoogle}
                            className="relative flex items-center justify-center w-full bg-white hover:bg-gray-100 transition-colors rounded-xl py-3 px-4 shadow-md group overflow-hidden"
                        >
                            <div className="absolute left-4 flex items-center justify-center w-6 h-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                                </svg>
                            </div>
                            <span className="font-roboto font-medium text-[#1f1f1f] text-sm">Sign in with Google</span>
                        </button>

                        {/* Phone Button */}
                         <button 
                            onClick={() => setView('phone')}
                            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl transition-all"
                        >
                            <Phone className="w-5 h-5 text-white" />
                            <span className="font-bold text-sm text-white">Phone</span>
                        </button>
                    </div>
                </>
            )}

            <div className="mt-6 text-center">
                {(view === 'login' || view === 'signup') && (
                    <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm text-[#71D2EB] hover:text-white underline transition-colors">
                        {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                )}
                {(view === 'phone' || view === 'otp') && (
                    <button onClick={() => setView('login')} className="text-sm text-white/50 hover:text-white transition-colors">
                        Back to Email Login
                    </button>
                )}
            </div>
         </div>
       </div>
    </div>
  );
};
