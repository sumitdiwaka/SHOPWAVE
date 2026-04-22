import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistItem, selectIsInWishlist } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector((s) => s.auth);
  const inWishlist = useSelector(selectIsInWishlist(product._id));

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    dispatch(toggleWishlistItem(product._id));
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Wishlist button — always visible if in wishlist, hover otherwise */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200
          ${inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full shadow flex items-center justify-center transition
              ${inWishlist
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white hover:bg-red-50 hover:text-red-500 text-gray-400'}`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.vendor?.shopName && (
          <p className="text-xs text-indigo-500 font-medium mb-1 truncate">{product.vendor.shopName}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 flex-1">{product.name}</h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-base font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.price.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition"
          >
            <ShoppingCart className="w-3 h-3" /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}