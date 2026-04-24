// FeaturedProducts.jsx — 4 different display modes in one component
// Admin can toggle: GRID | CAROUSEL | BENTO | SPOTLIGHT
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Zap, ArrowRight } from 'lucide-react';
// import { addToCart } from '../store/slices/cartSlice';
// 
// ─────────────────────────────────────────
//  VIEW 1 — CLASSIC GRID (4 columns)
// ─────────────────────────────────────────
function GridView({ products }) {
  const dispatch = useDispatch();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {(products || []).filter(p => p && p._id).map(p => {
        const price = p.discountPrice > 0 ? p.discountPrice : p.price;
        const disc  = p.discountPrice > 0 ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
        return (
          <Link key={p._id} to={`/products/${p._id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300">
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {disc > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{disc}%</span>}
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider truncate">{p.vendor?.shopName}</p>
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5">{p.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                <button onClick={(e)=>{ e.preventDefault(); dispatch(addToCart({product:p, quantity:1})); }}
                  className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
//  VIEW 2 — HORIZONTAL CAROUSEL (auto-scroll)
// ─────────────────────────────────────────
function CarouselView({ products }) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <div className="relative">
      <button onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-indigo-50 transition border border-gray-100">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <div ref={ref} className="flex gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {(products || []).filter(p => p && p._id).map(p => {
          const price = p.discountPrice > 0 ? p.discountPrice : p.price;
          const disc  = p.discountPrice > 0 ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
          return (
            <Link key={p._id} to={`/products/${p._id}`}
              className="group flex-none w-56 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative w-full h-48 bg-gray-50 overflow-hidden">
                <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {disc > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{disc}%</span>}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{p.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  <button onClick={(e)=>{ e.preventDefault(); dispatch(addToCart({product:p, quantity:1})); }}
                    className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition">
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <button onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-indigo-50 transition border border-gray-100">
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
//  VIEW 3 — BENTO GRID (magazine style)
//  First product = large hero, rest = small
// ─────────────────────────────────────────
function BentoView({ products }) {
  const dispatch = useDispatch();
  const safe = (products || []).filter(p => p && p._id);
  const [hero, ...rest] = safe.slice(0, 5);
  const heroPrice = hero?.discountPrice > 0 ? hero.discountPrice : hero?.price;
  const heroDisc  = hero?.discountPrice > 0 ? Math.round(((hero.price - hero.discountPrice) / hero.price) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gridTemplateRows: 'auto' }}>
      {/* Hero card — spans 2 rows and 2 cols on desktop */}
      {hero && (
        <Link to={`/products/${hero?._id}`}
          className="group relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden bg-gray-900 min-h-[360px] flex flex-col justify-end hover:shadow-2xl transition-all duration-300">
          <img src={hero.images?.[0]?.url} alt={hero.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative p-6 text-white">
            {heroDisc > 0 && <span className="inline-block bg-red-500 text-[11px] font-bold px-3 py-1 rounded-full mb-3">-{heroDisc}% OFF</span>}
            <span className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">{hero.vendor?.shopName}</span>
            <h3 className="text-xl font-black mb-1 leading-tight">{hero.name}</h3>
            <div className="flex items-center justify-between mt-3">
              <span className="text-2xl font-black">₹{heroPrice?.toLocaleString('en-IN')}</span>
              <button onClick={(e) => { e.preventDefault(); dispatch(addToCart({ product: hero, quantity: 1 })); }}
                className="bg-white text-gray-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 transition flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </Link>
      )}
      {/* Small cards */}
      {rest.filter(p => p && p._id).map(p => {
        const price = p.discountPrice > 0 ? p.discountPrice : p.price;
        return (
          <Link key={p._id} to={`/products/${p._id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex">
            <div className="w-24 h-full bg-gray-50 flex-none overflow-hidden">
              <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
              <div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase truncate">{p.vendor?.shopName}</p>
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-0.5">{p.name}</h3>
              </div>
              <span className="text-sm font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
//  VIEW 4 — SPOTLIGHT (full-width highlight)
//  One product at a time with prev/next
// ─────────────────────────────────────────
function SpotlightView({ products }) {
  const dispatch = useDispatch();
  const [idx, setIdx] = useState(0);
  const safe  = (products || []).filter(p => p && p._id);
  const p     = safe[idx] || safe[0];
  const price = p?.discountPrice > 0 ? p.discountPrice : p?.price;
  const disc  = p?.discountPrice > 0 ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
  const prev  = () => setIdx(i => (i - 1 + safe.length) % safe.length);
  const next  = () => setIdx(i => (i + 1) % safe.length);

  // auto-advance every 4s
  useEffect(() => {
    const t = setTimeout(next, 4000);
    return () => clearTimeout(t);
  }, [idx]);

  if (!p) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 min-h-[400px] flex items-center">
      {/* Background product image blurred */}
      <div className="absolute inset-0 opacity-20">
        <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
      </div>

      <div className="relative z-10 w-full grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
        {/* Text */}
        <div className="text-white order-2 md:order-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Featured Pick
            </span>
            {disc > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{disc}% OFF</span>}
          </div>
          <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-2">{p.vendor?.shopName}</p>
          <h3 className="text-3xl font-black mb-3 leading-tight">{p.name}</h3>
          <p className="text-indigo-200 text-sm line-clamp-2 mb-6">{p.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/20'}`} />)}</div>
            <span className="text-white/60 text-sm">({p.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-4xl font-black text-white">₹{price?.toLocaleString('en-IN')}</span>
              {disc > 0 && <span className="text-white/50 line-through text-lg ml-2">₹{p.price?.toLocaleString('en-IN')}</span>}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => dispatch(addToCart({ product: p, quantity: 1 }))}
              className="bg-white text-indigo-900 font-black px-6 py-3 rounded-2xl hover:bg-indigo-50 transition flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <Link to={`/products/${p._id}`}
              className="border border-white/30 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition flex items-center gap-2">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product image */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
            <img src={p.images?.[0]?.url} alt={p.name}
              className="relative w-full h-full object-contain drop-shadow-2xl rounded-3xl" />
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {safe.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  MAIN EXPORT — FeaturedProducts section
//  with view switcher tabs
// ─────────────────────────────────────────
const VIEWS = [
  { key: 'bento',     label: 'Magazine' },
  { key: 'spotlight', label: 'Spotlight' },
  { key: 'carousel',  label: 'Carousel' },
  { key: 'grid',      label: 'Grid' },
];

export default function FeaturedProducts({ products = [] }) {
  const [view, setView] = useState('bento');
  const safeProducts = (products || []).filter(p => p && p._id);
  if (!safeProducts.length) return null;

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Hand-picked by our team
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Featured Products</h2>
        </div>
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${view === v.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active view */}
      {view === 'grid'      && <GridView     products={safeProducts} />}
      {view === 'carousel'  && <CarouselView products={safeProducts} />}
      {view === 'bento'     && <BentoView    products={safeProducts} />}
      {view === 'spotlight' && <SpotlightView products={safeProducts} />}

      {/* View all link */}
      <div className="flex justify-center mt-10">
        <Link to="/products?featured=true"
          className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200">
          View All Featured
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}