import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInShowPassword, setSignInShowPassword] = useState(false);

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpShowPassword, setSignUpShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Supabase Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please fill in email and password');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = signInEmail.trim().toLowerCase();

      // Admin verification: ONLY samirazmain8@gmail.com with password samir2998 can log in as Admin
      if (cleanEmail === 'samirazmain8@gmail.com') {
        if (signInPassword !== 'samir2998') {
          setErrorMessage('Invalid admin email or password. Access denied.');
          setLoading(false);
          return;
        }

        // Attempt Supabase Auth sign-in
        let { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: signInPassword,
        });

        // If user doesn't exist in Supabase Auth yet, register admin automatically
        if (error) {
          const signUpRes = await supabase.auth.signUp({
            email: cleanEmail,
            password: signInPassword,
          });
          if (signUpRes.data?.session) {
            data = signUpRes.data;
            error = null;
          } else {
            // Re-try sign-in in case account existed
            const retryRes = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: signInPassword,
            });
            if (retryRes.data) {
              data = retryRes.data;
              error = null;
            }
          }
        }

        localStorage.setItem(
          'kozzak_auth',
          JSON.stringify({
            email: 'samirazmain8@gmail.com',
            role: 'admin',
          })
        );
        navigate('/admin');
        return;
      }

      // Standard Customer Sign In via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: signInPassword,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        if (data?.session) {
          localStorage.setItem(
            'kozzak_auth',
            JSON.stringify({
              email: data.user.email,
              role: 'customer',
            })
          );
          navigate('/');
        } else {
          setInfoMessage('Check your email and confirm your account before logging in.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  // Handle Supabase Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    if (!signUpEmail || !signUpPassword) {
      setErrorMessage('Please fill in email and password');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = signUpEmail.trim().toLowerCase();

      if (cleanEmail === 'samirazmain8@gmail.com') {
        if (signUpPassword !== 'samir2998') {
          setErrorMessage('Admin account password must be samir2998');
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: signUpPassword,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        const isAdmin = cleanEmail === 'samirazmain8@gmail.com';
        localStorage.setItem(
          'kozzak_auth',
          JSON.stringify({
            email: data.user?.email || cleanEmail,
            role: isAdmin ? 'admin' : 'customer',
          })
        );
        if (isAdmin) {
          navigate('/admin');
        } else if (!data.session) {
          setInfoMessage('Check your email and confirm your account before logging in.');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setErrorMessage('');
    setInfoMessage('');
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-obsidian text-silver flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-cobalt/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/6 w-[28rem] h-[28rem] rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Main Card Wrapper */}
      <div className="relative w-full max-w-4xl min-h-[600px] rounded-3xl bg-charcoal/80 backdrop-blur-2xl border border-silver/10 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row z-10">
        
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-b border-silver/10 z-20 bg-charcoal/90 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
              !isSignUp ? 'text-cobalt border-b-2 border-cobalt bg-cobalt/5' : 'text-silver/40 hover:text-silver/70'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
              isSignUp ? 'text-cobalt border-b-2 border-cobalt bg-cobalt/5' : 'text-silver/40 hover:text-silver/70'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* CONTAINER B (Sign In Form - Left side on desktop) */}
        <div
          id="b-container"
          className={`w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            !isSignUp ? 'opacity-100 z-10' : 'opacity-100 md:opacity-0 md:pointer-events-none'
          } ${!isSignUp ? 'block' : 'hidden md:block'}`}
        >
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5">
            <div className="text-center md:text-left mb-6 sm:mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cobalt block mb-1">Welcome Back</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-silver tracking-tight">Member Sign In</h2>
              <p className="text-silver/50 text-xs sm:text-sm mt-1.5 font-light">Access your orders, wishlist & personal recommendations</p>
            </div>

            <div>
              <label className="text-silver/70 text-[11px] tracking-widest uppercase mb-1.5 block font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-obsidian/70 border border-silver/15 rounded-xl px-4 py-3.5 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt focus:ring-1 focus:ring-cobalt/50 outline-none transition-all shadow-inner"
                required
              />
            </div>

            <div>
              <label className="text-silver/70 text-[11px] tracking-widest uppercase mb-1.5 block font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={signInShowPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-obsidian/70 border border-silver/15 rounded-xl px-4 py-3.5 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt focus:ring-1 focus:ring-cobalt/50 outline-none pr-11 transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setSignInShowPassword(!signInShowPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver/40 hover:text-silver transition-colors cursor-pointer"
                >
                  {signInShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isSignUp && errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {!isSignUp && infoMessage && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium leading-relaxed">
                {infoMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit w-full py-4 rounded-xl bg-gradient-to-r from-cobalt to-blue-600 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 glow-blue transition-all cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-[0.99] mt-3 shadow-lg"
            >
              <LogIn size={18} />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* CONTAINER A (Sign Up Form - Right side on desktop) */}
        <div
          id="a-container"
          className={`w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isSignUp ? 'opacity-100 z-10' : 'opacity-100 md:opacity-0 md:pointer-events-none'
          } ${isSignUp ? 'block' : 'hidden md:block'}`}
        >
          <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
            <div className="text-center md:text-left mb-6 sm:mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cobalt block mb-1">Kozzak Luxury</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-silver tracking-tight">Create Account</h2>
              <p className="text-silver/50 text-xs sm:text-sm mt-1.5 font-light">Join Kozzak Mens Wear for exclusive bespoke collections</p>
            </div>

            <div>
              <label className="text-silver/70 text-[11px] tracking-widest uppercase mb-1.5 block font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-obsidian/70 border border-silver/15 rounded-xl px-4 py-3.5 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt focus:ring-1 focus:ring-cobalt/50 outline-none transition-all shadow-inner"
                required
              />
            </div>

            <div>
              <label className="text-silver/70 text-[11px] tracking-widest uppercase mb-1.5 block font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={signUpShowPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-obsidian/70 border border-silver/15 rounded-xl px-4 py-3.5 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt focus:ring-1 focus:ring-cobalt/50 outline-none pr-11 transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setSignUpShowPassword(!signUpShowPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver/40 hover:text-silver transition-colors cursor-pointer"
                >
                  {signUpShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignUp && errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {isSignUp && infoMessage && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium leading-relaxed flex items-start gap-2">
                <span>{infoMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit w-full py-4 rounded-xl bg-gradient-to-r from-cobalt to-blue-600 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 glow-blue transition-all cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-[0.99] mt-3 shadow-lg"
            >
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>
        </div>

        {/* OVERLAY / SLIDING CONTAINER (#switch-cnt) */}
        <div
          id="switch-cnt"
          className={`hidden md:flex absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-br from-cobalt via-blue-700 to-indigo-900 transition-all duration-700 ease-in-out z-30 shadow-[0_0_50px_rgba(30,58,138,0.5)] overflow-hidden ${
            isSignUp ? 'translate-x-0 rounded-l-3xl' : 'translate-x-full rounded-r-3xl'
          }`}
        >
          {/* Decorative switch circles with pulse animations */}
          <div className="switch__circle absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none animate-pulse" />
          <div className="switch__circle switch__circle--sm absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-blue-300/15 blur-xl pointer-events-none" />

          {/* SWITCH C1 (Shown when in Sign Up view -> Prompts Sign In) */}
          <div
            id="switch-c1"
            className={`w-full h-full p-10 lg:p-12 flex flex-col items-center justify-center text-center transition-all duration-500 ${
              isSignUp ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 text-white font-display font-bold text-xl shadow-inner">
              K
            </div>
            <h3 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">Already Member?</h3>
            <p className="text-white/80 text-xs sm:text-sm max-w-xs mb-8 leading-relaxed font-light">
              Log in with your email and password to view saved orders and fast checkout.
            </p>
            <button
              type="button"
              onClick={toggleForm}
              className="switch-btn border-2 border-white/80 bg-white/10 backdrop-blur-md text-white font-semibold text-sm tracking-wider uppercase px-9 py-3.5 rounded-xl hover:bg-white hover:text-cobalt transition-all cursor-pointer shadow-xl active:scale-95"
            >
              Sign In
            </button>
          </div>

          {/* SWITCH C2 (Shown when in Sign In view -> Prompts Sign Up) */}
          <div
            id="switch-c2"
            className={`w-full h-full p-10 lg:p-12 flex flex-col items-center justify-center text-center transition-all duration-500 ${
              !isSignUp ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 text-white font-display font-bold text-xl shadow-inner">
              K
            </div>
            <h3 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">Hello, Friend!</h3>
            <p className="text-white/80 text-xs sm:text-sm max-w-xs mb-8 leading-relaxed font-light">
              Enter your email and create a password to begin your luxury shopping experience with Kozzak.
            </p>
            <button
              type="button"
              onClick={toggleForm}
              className="switch-btn border-2 border-white/80 bg-white/10 backdrop-blur-md text-white font-semibold text-sm tracking-wider uppercase px-9 py-3.5 rounded-xl hover:bg-white hover:text-cobalt transition-all cursor-pointer shadow-xl active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

