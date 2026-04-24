import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Top Banner */}
          <div className="bg-blue-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">HostelOS</h1>
            <p className="text-blue-200 text-sm mt-1">Hostel Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400 mb-6">Sign in to your admin account</p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-slate-400 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg outline-none
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               placeholder-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-medium py-2.5 rounded-lg transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Hint */}
            <p className="text-xs text-slate-400 text-center mt-6">
              Default credentials: <span className="font-medium text-slate-500">admin / admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} HostelOS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;