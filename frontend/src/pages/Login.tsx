import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, Eye, EyeOff, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login({ username, password });
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('ashfaq');
      setPassword('user123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f5ff] via-[#eef9f9] to-[#f7faff] px-4 py-8 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="flex flex-col items-center mb-6 z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold tracking-wider text-slate-800 uppercase leading-tight">
          INTERNAL ATTENDANCE
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Attendance & Task Management
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100/80 z-10">
        {/* Shield Icon Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage attendance and tasks
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email or roll number"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 hover:text-blue-600">
                    Show
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('Please contact your administrator to reset your password.');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Demo access:</span>
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('user')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
          >
            Team member
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400 font-medium tracking-wide z-10">
        Internal use only • Secure attendance portal
      </p>
    </div>
  );
};
