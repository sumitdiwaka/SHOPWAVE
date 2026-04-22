import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Heart, Store, Star, ChevronLeft,
  ChevronRight, Minus, Plus, ThumbsUp, Send, ZoomIn, X, Package, ArrowLeft
} from 'lucide-react';
import { fetchProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { authAPI, reviewAPI } from '../api/services';
import { FullPageSpinner, StarRating, Badge } from '../components/common';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { current: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const [imgIdx, setImgIdx] = useState(0);
  const [qty,    setQty]    = useState(1);
  const [tab,    setTab]    = useState('description');
  const [zoom,   setZoom]   = useState(false);

  const [reviews,         setReviews]         = useState([]);
  const [reviewForm,      setReviewForm]      = useState({ rating: 5, title: '', comment: '', orderId: '' });
  const [showReviewForm,  setShowReviewForm]  = useState(false);
  const [submitting,      setSubmitting]      = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    setImgIdx(0); setQty(1); setTab('description');
  }, [id, dispatch]);

  useEffect(() => {
    if (product?._id) {
      reviewAPI.getForProduct(product._id)
        .then((r) => setReviews(r.data.reviews || []))
        .catch(() => {});
    }
  }, [product?._id]);

  if (loading) return <FullPageSpinner />;
  if (!product) return (
    <div className="min-h-96 flex flex-col items-center justify-center text-center px-4">
      <Package className="w-16 h-16 text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
      <Link to="/products" className="text-indigo-600 text-sm hover:underline">Browse Products</Link>
    </div>
  );

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const savings  = product.price - price;

  // HD Cloudinary URL helper
  const hdUrl = (url) => url
    ? url.replace('/upload/', '/upload/q_100,f_auto,w_1400,dpr_2/')
    : 'https://placehold.co/800x800?text=No+Image';

  const thumbUrl = (url) => url
    ? url.replace('/upload/', '/upload/q_auto,w_200,h_200,c_pad/')
    : 'https://placehold.co/200x200?text=?';

  const handleAddToCart = () => dispatch(addToCart({ product, quantity: qty }));

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    try {
      const res = await authAPI.toggleWishlist(product._id);
      toast.success(res.data.message);
    } catch { toast.error('Something went wrong'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); return; }
    if (!reviewForm.orderId.trim()) { toast.error('Enter your Order ID to verify purchase'); return; }
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) { toast.error('Fill in title and comment'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.create({
        productId: product._id,
        orderId:   reviewForm.orderId.trim(),
        rating:    reviewForm.rating,
        title:     reviewForm.title,
        comment:   reviewForm.comment,
      });
      setReviews((p) => [res.data.review, ...p]);
      setReviewForm({ rating: 5, title: '', comment: '', orderId: '' });
      setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed — only verified buyers can review');
    } finally { setSubmitting(false); }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) { toast.error('Login to mark helpful'); return; }
    try {
      const res = await reviewAPI.markHelpful(reviewId);
      setReviews((p) => p.map((r) => r._id === reviewId ? { ...r, helpful: Array(res.data.helpfulCount).fill('') } : r));
    } catch {}
  };

  // Rating breakdown
  const ratingBreakdown = [5,4,3,2,1].map((star) => ({
    star, count: reviews.filter((r) => r.rating === star).length,
  }));

  const images = product.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <button onClick={() => navigate(-1)} className="hover:text-indigo-600 flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span>·</span>
        <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-indigo-600 transition">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

        {/* ══ IMAGE GALLERY ══ */}
        <div>
          {/* Main image */}
          <div
            onClick={() => images.length > 0 && setZoom(true)}
            className="relative bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden mb-4 cursor-zoom-in group"
            style={{ aspectRatio: '1/1' }}
          >
            {images[imgIdx] ? (
              <img
                key={imgIdx}
                src={hdUrl(images[imgIdx].url)}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-opacity duration-300"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-20 h-20" />
              </div>
            )}

            {/* Badges */}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-gray-800 text-white font-bold px-6 py-2 rounded-full text-sm">Out of Stock</span>
              </div>
            )}

            {/* Zoom icon */}
            <div className="absolute top-4 right-4 bg-white/90 shadow rounded-xl p-2 opacity-0 group-hover:opacity-100 transition text-gray-500">
              <ZoomIn className="w-4 h-4" />
            </div>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition bg-white
                    ${i === imgIdx ? 'border-indigo-500 shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img
                    src={thumbUrl(img.url)}
                    alt={`View ${i+1}`}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=?'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ PRODUCT INFO ══ */}
        <div className="flex flex-col gap-4">
          {product.brand && (
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{product.brand}</p>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">{product.name}</h1>

          {/* Rating row */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating rating={product.rating} numReviews={product.numReviews} size="md" />
            <button
              onClick={() => setTab('reviews')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              {reviews.length > 0 ? `See ${reviews.length} reviews` : 'Write first review'}
            </button>
          </div>

          {/* Price block */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-black text-gray-900">₹{price.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-green-700 font-semibold mt-1">You save ₹{savings.toLocaleString()}!</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge color={product.stock > 0 ? 'green' : 'red'}>
              {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
            </Badge>
            {product.isFeatured && <Badge color="indigo">⭐ Featured</Badge>}
            {product.category && <Badge color="blue">{product.category}</Badge>}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q-1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-base font-bold border-x-2 border-gray-100 h-11 flex items-center justify-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q+1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">max {product.stock}</span>
            </div>
          )}

          {/* Total preview */}
          {qty > 1 && (
            <div className="bg-indigo-50 rounded-xl px-4 py-2 text-sm text-indigo-700 font-semibold">
              Total for {qty} items: ₹{(price * qty).toLocaleString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition text-base shadow-md shadow-indigo-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className="w-14 flex items-center justify-center border-2 border-gray-100 rounded-2xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Vendor */}
          {product.vendor && (
            <Link
              to={`/vendors/${product.vendor._id}`}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-2xl transition mt-1"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                {product.vendor.shopLogo
                  ? <img src={product.vendor.shopLogo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  : <Store className="w-6 h-6 text-indigo-600" />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{product.vendor.shopName}</p>
                <StarRating rating={product.vendor.rating} />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="border-b-2 border-gray-100 mb-8">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { key: 'description', label: 'Description' },
            { key: 'specs',       label: `Specifications${product.specifications?.length > 0 ? ` (${product.specifications.length})` : ''}` },
            { key: 'reviews',     label: `Reviews (${reviews.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-4 text-sm font-bold whitespace-nowrap border-b-2 -mb-[2px] transition
                ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESCRIPTION TAB ── */}
      {tab === 'description' && (
        <div className="max-w-3xl">
          <p className="text-gray-700 leading-loose text-base whitespace-pre-line">{product.description}</p>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm text-gray-500 font-medium">Tags:</span>
              {product.tags.map((tag) => (
                <Link key={tag} to={`/products?keyword=${tag}`}
                  className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-3 py-1.5 rounded-full transition font-medium">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SPECS TAB ── */}
      {tab === 'specs' && (
        <div className="max-w-2xl">
          {product.specifications?.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-indigo-600 px-5 py-3">
                <h3 className="text-sm font-bold text-white">Product Specifications</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map(({ key, value }, i) => (
                    <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <td className="py-3.5 px-5 font-semibold text-gray-700 w-2/5 border-r border-gray-100">{key}</td>
                      <td className="py-3.5 px-5 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No specifications added</p>
              <p className="text-gray-400 text-sm mt-1">The vendor can add specs from their dashboard</p>
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {tab === 'reviews' && (
        <div className="max-w-3xl space-y-6">

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
              <div className="text-center shrink-0 flex flex-col items-center justify-center">
                <p className="text-7xl font-black text-gray-900 leading-none">{product.rating?.toFixed(1)}</p>
                <div className="flex mt-2 mb-1">
                  {[...Array(5)].map((_,i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: reviews.length > 0 ? `${(count/reviews.length)*100}%` : '0%' }} />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write review / login prompt */}
          {user ? (
            !showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 py-4 rounded-2xl transition font-semibold text-sm"
              >
                <Star className="w-4 h-4" /> Write a Review
              </button>
            ) : (
              /* Review form */
              <form onSubmit={handleReviewSubmit} className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Write Your Review</h3>
                  <button type="button" onClick={() => setShowReviewForm(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                {/* Star picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                        className="hover:scale-125 transition-transform">
                        <Star className={`w-9 h-9 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2 font-medium">
                      {['','Poor','Fair','Good','Very Good','Excellent'][reviewForm.rating]}
                    </span>
                  </div>
                </div>

                {/* Order ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID *
                    <span className="text-gray-400 font-normal ml-1">(verify your purchase — find in My Account → Orders)</span>
                  </label>
                  <input
                    value={reviewForm.orderId}
                    onChange={(e) => setReviewForm((p) => ({ ...p, orderId: e.target.value }))}
                    placeholder="Paste your order ID here"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Title *</label>
                  <input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    maxLength={80}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)}
                    className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link> to write a review
              </p>
            </div>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {r.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.user?.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_,i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        {r.isVerifiedPurchase && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{r.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleHelpful(r._id)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful ({r.helpful?.length || 0})
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Star className="w-14 h-14 text-gray-200 mx-auto mb-3 fill-gray-200" />
              <p className="text-gray-500 font-semibold">No reviews yet</p>
              <p className="text-gray-400 text-sm mt-1">Purchase this product and be the first to review it!</p>
            </div>
          )}
        </div>
      )}

      {/* ══ ZOOM MODAL ══ */}
      {zoom && images[imgIdx] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <button onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i-1+images.length)%images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i+1)%images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={images[imgIdx].url.replace('/upload/', '/upload/q_100,f_auto,w_2000/')}
            alt={product.name}
            className="max-w-full max-h-screen object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            {imgIdx + 1} / {images.length} · Click outside to close
          </p>
        </div>
      )}
    </div>
  );
}