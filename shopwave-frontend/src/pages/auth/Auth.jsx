import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Store, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '../../store/slices/authSlice';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Shop<span className="text-indigo-600">Wave</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => { if (user) navigate(user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/'); }, [user, navigate]);

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ShopWave account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            type="email" placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPass ? 'text' : 'password'} placeholder="Your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition mt-2">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-medium hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  );
}

export function Register() {
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'customer' } });

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));
  const role = watch('role');

  return (
    <AuthLayout title="Create account" subtitle="Join ShopWave today — it's free!">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            placeholder="Rahul Sharma"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            type="email" placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 'customer', label: '🛍️ Shop', desc: 'Buy products' }, { value: 'vendor', label: '🏪 Sell', desc: 'List products' }].map((opt) => (
              <label key={opt.value}
                className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition ${role === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input {...register('role')} type="radio" value={opt.value} className="hidden" />
                <span className="text-lg">{opt.label.split(' ')[0]}</span>
                <span className="text-sm font-medium text-gray-900">{opt.label.split(' ')[1]}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
