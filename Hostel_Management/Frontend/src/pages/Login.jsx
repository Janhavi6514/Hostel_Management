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
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* CARD */}
        <div className="
          bg-white/5 backdrop-blur-2xl
          border border-white/10
          rounded-2xl shadow-2xl
          overflow-hidden
        ">

          {/* HEADER */}
          <div className="px-6 py-6 text-center border-b border-white/10">

            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Hotel size={24} className="text-white" />
            </div>

            <h1 className="text-xl font-semibold text-white">HostelOS</h1>
            <p className="text-slate-400 text-xs mt-1">Management System</p>

          </div>

          {/* FORM */}
          <div className="px-6 py-6 text-white">

            <h2 className="text-base font-medium mb-1">Sign in</h2>
            <p className="text-xs text-slate-400 mb-5">Enter your credentials</p>

            {/* ERROR */}
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* USERNAME */}
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                           focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg
                             focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2
                           bg-gradient-to-r from-blue-600 to-indigo-600
                           hover:opacity-90 text-white text-sm font-medium py-2 rounded-lg transition mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <LogIn size={14} />
                    Sign In
                  </>
                )}
              </button>

            </form>

            {/* FOOTER */}
            <p className="text-[11px] text-slate-500 text-center mt-4">
              admin / admin123
            </p>

          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-3">
          © {new Date().getFullYear()} HostelOS
        </p>

      </div>
    </div>
  );
};

export default Login;