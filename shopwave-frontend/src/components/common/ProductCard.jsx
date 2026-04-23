// IMPROVED ProductCard.jsx — glass morphism + micro-interactions
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistItem, selectIsInWishlist } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product, featured = false }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector((s) => s.auth);
  const inWishlist = useSelector(selectIsInWishlist(product._id));
  const [hovered, setHovered] = useState(false);

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const isOutOfStock = product.stock === 0;

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Login to add to wishlist'); return; }
    dispatch(toggleWishlistItem(product._id));
  };

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOutOfStock) return;
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              -{discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
              <Zap className="w-3 h-3" /> Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist btn */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
            ${inWishlist ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Hover overlay with quick actions */}
        <div className={`absolute inset-x-0 bottom-0 p-3 flex gap-2 transition-all duration-300
          ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={handleCart}
            disabled={isOutOfStock}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${product._id}`}
            className="w-10 h-10 bg-white/95 hover:bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide truncate">
          {product.vendor?.shopName || 'ShopWave'}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-indigo-700 transition">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({product.numReviews})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          {/* Mobile add to cart (always visible) */}
          <button
            onClick={handleCart}
            disabled={isOutOfStock}
            className="md:hidden bg-indigo-600 disabled:bg-gray-300 text-white p-2 rounded-xl"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}