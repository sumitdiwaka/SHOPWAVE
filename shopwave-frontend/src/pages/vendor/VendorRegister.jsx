import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Store, CheckCircle2 } from 'lucide-react';
import { vendorAPI } from '../../api/services';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Food & Grocery', 'Health', 'Jewellery', 'Other'];

export default function VendorRegister() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Must be logged in
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to register as a vendor.</p>
          <Link to="/login" className="block w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        shopName: data.shopName,
        category: data.category,
        shopDescription: data.shopDescription || '',
        gstNumber: data.gstNumber || '',
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
        },
      };
      await vendorAPI.register(payload);
      toast.success('Vendor application submitted!');
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      // If already a vendor
      if (msg.includes('already exists')) {
        toast('You already have a vendor profile. Check your dashboard.', { icon: 'ℹ️' });
        navigate('/vendor/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-2">Your vendor application is under review.</p>
        <p className="text-gray-500 mb-6">Login as <strong>Admin</strong> → go to <strong>Vendor Approvals</strong> tab → approve yourself.</p>
        <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition">
          Go to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
        <p className="text-gray-500 mt-2">Logged in as <strong>{user.name}</strong> ({user.email})</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Shop Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
            <input
              {...register('shopName', { required: 'Shop name is required' })}
              placeholder="Your Amazing Store"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
            >
              <option value="">Select your primary category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Description</label>
            <textarea
              {...register('shopDescription')}
              rows={3}
              placeholder="Describe your shop, what you sell..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number (optional)</label>
            <input
              {...register('gstNumber')}
              placeholder="29AAAAA0000A1Z5"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 pt-2">Business Address</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
            <input
              {...register('street')}
              placeholder="123 Business Street"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[['city', 'City', 'Mumbai'], ['state', 'State', 'Maharashtra'], ['pincode', 'Pincode', '400001']].map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  {...register(field)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Note:</strong> After submitting, login as Admin → go to <strong>Vendor Approvals</strong> → approve your application.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition text-base"
          >
            {loading ? 'Submitting...' : 'Submit Vendor Application'}
          </button>
        </form>
      </div>
    </div>
  );
}