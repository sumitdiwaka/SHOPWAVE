// AdminToggleFeatured — drop this inside your AdminDashboard products tab
// Adds a toggle switch on each product to mark it featured
// Backend: PUT /api/admin/products/:id/feature

import { useState } from 'react';
import { Zap } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export function FeaturedToggle({ product, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/products/${product._id}/feature`);
      onUpdate(res.data.product);
      toast.success(res.data.product.isFeatured ? '⚡ Marked as Featured!' : 'Removed from Featured');
    } catch (e) {
      toast.error('Failed to update featured status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all
        ${product.isFeatured
          ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-amber-50 hover:text-amber-600'
        }`}
    >
      <Zap className={`w-3 h-3 ${product.isFeatured ? 'fill-amber-500' : ''}`} />
      {loading ? '...' : product.isFeatured ? 'Featured' : 'Set Featured'}
    </button>
  );
}