import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { De } from '../lib/sdk';

const ADMIN_EMAIL = 'samirazmain8@gmail.com';

export const Login: React.FC = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminPassword, setAdminPassword] = useState('samir2998'); // Fallback default
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to load live site settings to read custom admin password
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res.length > 0 && res[0].admin_password) {
          setAdminPassword(res[0].admin_password);
        }
      })
      .catch((err) => console.error('Failed to load site settings:', err));
  }, []);

  const handleAuth = () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('kozzak_users') || '{}');

    if (isLoginTab) {
      // 1. Admin Login
      if (email === ADMIN_EMAIL) {
        // Support either the database-configured admin password or the custom storage password or 'admin123'
        const customStorageAdminPw = localStorage.getItem('kozzak_admin_pw');
        if (password !== adminPassword && password !== customStorageAdminPw && password !== 'admin123') {
          setErrorMessage('Invalid admin password');
          return;
        }
        localStorage.setItem(
          'kozzak_auth',
          JSON.stringify({ email: email, role: 'admin' })
        );
        navigate('/admin');
      }
      // 2. Customer Login
      else if (users[email]) {
        if (users[email].password !== password) {
          setErrorMessage('Invalid password');
          return;
        }
        localStorage.setItem(
          'kozzak_auth',
          JSON.stringify({ email: email, role: 'customer' })
        );
        navigate('/');
      } else {
        setErrorMessage('Account not found. Please sign up.');
      }
    } else {
      // Sign Up Tab
      if (email === ADMIN_EMAIL) {
        setErrorMessage('Admin account already exists. Please login.');
        return;
      }
      if (users[email]) {
        setErrorMessage('Account already exists. Please login.');
        return;
      }

      users[email] = { password: password, role: 'customer' };
      localStorage.setItem('kozzak_users', JSON.stringify(users));
      localStorage.setItem(
        'kozzak_auth',
        JSON.stringify({ email: email, role: 'customer' })
      );
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl overflow-hidden border border-silver/5">
          {/* Tabs */}
          <div className="flex border-b border-silver/10">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-4 text-sm tracking-widest uppercase transition-all cursor-pointer ${
                isLoginTab ? 'text-cobalt border-b-2 border-cobalt' : 'text-silver/40'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-4 text-sm tracking-widest uppercase transition-all cursor-pointer ${
                isLoginTab ? 'text-silver/40' : 'text-cobalt border-b-2 border-cobalt'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <motion.div
            key={isLoginTab ? 'login' : 'signup'}
            initial={{ opacity: 0, rotateY: 30 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 space-y-5"
          >
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl font-bold text-silver">
                {isLoginTab ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-silver/40 text-sm mt-1">
                {isLoginTab ? 'Sign in to your account' : 'Join Kozzak Mens Wear'}
              </p>
            </div>

            <div>
              <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm placeholder:text-silver/20 focus:border-cobalt outline-none pr-10 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-silver transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-destructive text-xs font-semibold">{errorMessage}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAuth}
              className="w-full py-4 rounded-xl bg-cobalt text-white font-semibold flex items-center justify-center gap-3 glow-blue transition-all cursor-pointer"
            >
              <LogIn size={18} />
              <span>{isLoginTab ? 'Login' : 'Sign Up'}</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Login;
