// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones,
//   Star, ChevronRight, TrendingUp, Zap, Award, Users
// } from 'lucide-react';
// import { fetchFeatured, fetchCategories } from '../store/slices/productsSlice';
// import ProductCard from '../components/common/ProductCard';
// import { FullPageSpinner } from '../components/common';
// import FeaturedProducts from '../components/common/FeaturedProducts';
// const CATEGORIES = [
//   { name: 'Electronics',     emoji: '📱', color: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',   text: 'text-blue-700'   },
//   { name: 'Fashion',         emoji: '👗', color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-50',   text: 'text-pink-700'   },
//   { name: 'Home & Kitchen',  emoji: '🏠', color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
//   { name: 'Books',           emoji: '📚', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50',  text: 'text-green-700'  },
//   { name: 'Sports',          emoji: '⚽', color: 'from-cyan-500 to-teal-600',     bg: 'bg-cyan-50',   text: 'text-cyan-700'   },
//   { name: 'Beauty',          emoji: '💄', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700' },
//   { name: 'Toys',            emoji: '🧸', color: 'from-yellow-500 to-amber-500',  bg: 'bg-yellow-50', text: 'text-yellow-700' },
//   { name: 'Automotive',      emoji: '🚗', color: 'from-gray-600 to-slate-700',    bg: 'bg-gray-50',   text: 'text-gray-700'   },
// ];

// const FEATURES = [
//   { icon: Truck,      title: 'Free Delivery',     desc: 'On all orders above ₹999',      color: 'text-blue-600',   bg: 'bg-blue-50'   },
//   { icon: ShieldCheck, title: 'Secure Payments',  desc: '100% safe via Razorpay',        color: 'text-green-600',  bg: 'bg-green-50'  },
//   { icon: RefreshCw,  title: '7-Day Returns',     desc: 'Hassle-free return policy',     color: 'text-amber-600',  bg: 'bg-amber-50'  },
//   { icon: Headphones, title: '24/7 Support',      desc: 'Dedicated customer care',        color: 'text-purple-600', bg: 'bg-purple-50' },
// ];

// const STATS = [
//   { icon: Users,      value: '1,00,000+', label: 'Happy Customers' },
//   { icon: Award,      value: '2,000+',    label: 'Verified Vendors' },
//   { icon: TrendingUp, value: '50,000+',   label: 'Products Listed'  },
//   { icon: Zap,        value: '99.9%',     label: 'Uptime'           },
// ];

// const TESTIMONIALS = [
//   { name: 'Priya Sharma',   role: 'Regular Buyer',      rating: 5, text: 'ShopWave has the best variety I\'ve seen. Fast delivery and genuine products every time!', city: 'Mumbai' },
//   { name: 'Rahul Verma',    role: 'Verified Vendor',    rating: 5, text: 'As a seller, the vendor dashboard is amazing. I grew my sales 3x in just 2 months!', city: 'Delhi' },
//   { name: 'Ananya Reddy',   role: 'Fashion Shopper',    rating: 5, text: 'Love the quality of fashion products here. Returns are so easy if something doesn\'t fit.', city: 'Bengaluru' },
// ];

// const HERO_BADGES = ['✅ 100% Authentic Products', '🚀 Same-Day Shipping', '💳 Secure Razorpay Checkout'];

// export default function Home() {
//   const dispatch = useDispatch();
//   const { featured, categories, loading } = useSelector((s) => s.products);
//   const [activeTestimonial, setActiveTestimonial] = useState(0);

//   useEffect(() => {
//     dispatch(fetchFeatured());
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   // Auto-rotate testimonials
//   useEffect(() => {
//     const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length), 4000);
//     return () => clearInterval(t);
//   }, []);

//   // Build displayable categories (backend + fallback)
//   const displayCategories = categories.length > 0
//     ? CATEGORIES.filter((c) => categories.includes(c.name))
//     : CATEGORIES;

//   return (
//     <div className="bg-white">

//       {/* ══ HERO SECTION ══════════════════════════════════════ */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
//         {/* Background pattern */}
//         <div className="absolute inset-0 opacity-20" style={{
//           backgroundImage: `radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%),
//                             radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%),
//                             radial-gradient(circle at 60% 80%, #06b6d4 0%, transparent 40%)`
//         }} />

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//             {/* Left */}
//             <div>
//               {/* Trust badges */}
//               <div className="flex flex-wrap gap-2 mb-6">
//                 {HERO_BADGES.map((b) => (
//                   <span key={b} className="text-xs bg-white/10 backdrop-blur text-white/90 px-3 py-1.5 rounded-full border border-white/20 font-medium">
//                     {b}
//                   </span>
//                 ))}
//               </div>

//               <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-5">
//                 India's Most{' '}
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
//                   Trusted
//                 </span>
//                 <br />Multi-Vendor<br />
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
//                   Marketplace
//                 </span>
//               </h1>

//               <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
//                 Shop from <strong className="text-white">2,000+ verified vendors</strong> with guaranteed authenticity, easy returns, and lightning-fast delivery across India.
//               </p>

//               <div className="flex flex-wrap gap-3 mb-10">
//                 <Link to="/products"
//                   className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-indigo-900/50 text-base">
//                   Shop Now <ArrowRight className="w-5 h-5" />
//                 </Link>
//                 <Link to="/vendor/register"
//                   className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl transition backdrop-blur text-base">
//                   Become a Seller
//                 </Link>
//               </div>

//               {/* Mini stats row */}
//               <div className="flex flex-wrap gap-6">
//                 {STATS.map(({ icon: Icon, value, label }) => (
//                   <div key={label} className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
//                       <Icon className="w-4 h-4 text-indigo-300" />
//                     </div>
//                     <div>
//                       <p className="text-base font-black text-white leading-none">{value}</p>
//                       <p className="text-xs text-white/50">{label}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right — floating cards */}
//             <div className="hidden md:flex flex-col gap-4 items-end">
//               {[
//                 { label: 'New Arrival',  name: 'Sony WH-1000XM5',     price: '₹24,990',  discount: '20% OFF', img: '🎧', color: 'bg-indigo-500' },
//                 { label: '⚡ Flash Sale', name: 'Samsung 4K Smart TV', price: '₹34,999',  discount: '35% OFF', img: '📺', color: 'bg-rose-500'   },
//                 { label: 'Best Seller',  name: 'Nike Air Max 2024',    price: '₹8,999',   discount: '15% OFF', img: '👟', color: 'bg-amber-500'  },
//               ].map((item, i) => (
//                 <div key={i}
//                   className={`flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 w-72 hover:bg-white/15 transition
//                     ${i === 1 ? 'translate-x-4' : ''}`}>
//                   <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
//                     {item.img}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{item.label}</span>
//                     <p className="text-sm font-bold text-white truncate">{item.name}</p>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-black text-white">{item.price}</span>
//                       <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">{item.discount}</span>
//                     </div>
//                   </div>
//                   <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══ FEATURES STRIP ════════════════════════════════════ */}
//       <section className="border-b border-gray-100 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//             {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
//               <div key={title} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition">
//                 <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
//                   <Icon className={`w-5 h-5 ${color}`} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-gray-900">{title}</p>
//                   <p className="text-xs text-gray-500">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ CATEGORIES ════════════════════════════════════════ */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Explore</p>
//             <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
//           </div>
//           <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
//             View All <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
//           {displayCategories.slice(0, 8).map((cat) => (
//             <Link
//               key={cat.name}
//               to={`/products?category=${encodeURIComponent(cat.name)}`}
//               className={`group flex flex-col items-center gap-2 p-3 ${cat.bg} rounded-2xl hover:shadow-md transition-all hover:-translate-y-1 duration-200 border border-transparent hover:border-indigo-100`}
//             >
//               <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
//                 {cat.emoji}
//               </div>
//               <span className={`text-xs font-bold ${cat.text} text-center leading-tight`}>{cat.name}</span>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* ══ FEATURED PRODUCTS ═════════════════════════════════ */}
//       {/* <section className="bg-gray-50 py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="flex items-end justify-between mb-8">
//             <div>
//               <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Handpicked</p>
//               <h2 className="text-3xl font-black text-gray-900">Featured Products</h2>
//             </div>
//             <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
//               View All <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>

//           {loading ? (
//             <FullPageSpinner />
//           ) : featured.length > 0 ? (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {featured.slice(0, 8).map((product) => (
//                 <ProductCard key={product._id} product={product} />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p className="text-lg font-medium">No featured products yet</p>
//               <p className="text-sm mt-1">Admin can feature products from the dashboard</p>
//             </div>
//           )}

//           <div className="text-center mt-8">
//             <Link to="/products"
//               className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold px-8 py-3 rounded-2xl transition">
//               Browse All Products <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       </section> */}

//       <FeaturedProducts products={featured} />

//       {/* ══ WHY SHOPWAVE — 3 COLUMN ═══════════════════════════ */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
//         <div className="text-center mb-12">
//           <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Why Choose Us</p>
//           <h2 className="text-3xl font-black text-gray-900">Built for India, Built to Last</h2>
//           <p className="text-gray-500 mt-2 max-w-xl mx-auto">From Kanyakumari to Kashmir — we serve every pin code with the same commitment to quality and speed.</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[
//             {
//               emoji: '🔍',
//               title: 'Curated Vendors',
//               desc: 'Every vendor on ShopWave goes through a strict verification process. We check GST, address, and product quality before they can sell.',
//               color: 'border-blue-100 bg-blue-50',
//             },
//             {
//               emoji: '⚡',
//               title: 'Lightning Fast',
//               desc: 'Our fulfillment network ensures same-day dispatch for orders placed before 2 PM. Most customers receive their orders within 2-3 business days.',
//               color: 'border-amber-100 bg-amber-50',
//             },
//             {
//               emoji: '🛡️',
//               title: 'Buyer Protection',
//               desc: 'Shop with confidence. If your product is damaged, wrong, or doesn\'t arrive — we\'ve got you covered with our full buyer protection guarantee.',
//               color: 'border-green-100 bg-green-50',
//             },
//           ].map((item) => (
//             <div key={item.title} className={`border rounded-3xl p-8 ${item.color} hover:shadow-md transition`}>
//               <div className="text-4xl mb-4">{item.emoji}</div>
//               <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
//               <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
//       <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
//           <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Customer Stories</p>
//           <h2 className="text-3xl font-black text-white mb-10">Loved Across India</h2>

//           <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 md:p-10 mb-6">
//             <div className="flex justify-center mb-4">
//               {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
//                 <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
//               ))}
//             </div>
//             <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 italic">
//               "{TESTIMONIALS[activeTestimonial].text}"
//             </p>
//             <div className="flex items-center justify-center gap-3">
//               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-white text-lg">
//                 {TESTIMONIALS[activeTestimonial].name.charAt(0)}
//               </div>
//               <div className="text-left">
//                 <p className="font-bold text-white">{TESTIMONIALS[activeTestimonial].name}</p>
//                 <p className="text-indigo-200 text-sm">{TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].city}</p>
//               </div>
//             </div>
//           </div>

//           {/* Dots */}
//           <div className="flex justify-center gap-2">
//             {TESTIMONIALS.map((_, i) => (
//               <button key={i} onClick={() => setActiveTestimonial(i)}
//                 className={`rounded-full transition-all ${i === activeTestimonial ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'}`}
//               />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ STATS BANNER ══════════════════════════════════════ */}
//       <section className="bg-gray-900 py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//             {STATS.map(({ value, label }) => (
//               <div key={label}>
//                 <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
//                 <p className="text-gray-400 text-sm">{label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ SELL ON SHOPWAVE CTA ══════════════════════════════ */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
//         <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-10 md:p-14">
//           <div className="absolute inset-0 opacity-10"
//             style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
//           <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//             <div>
//               <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">For Entrepreneurs</p>
//               <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Start Selling on ShopWave</h2>
//               <p className="text-white/80 leading-relaxed mb-6 max-w-md">
//                 Join 2,000+ vendors who trust ShopWave to grow their business. Zero listing fee, powerful dashboard, real-time analytics, and access to lakhs of customers.
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <Link to="/vendor/register"
//                   className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-7 py-3.5 rounded-2xl hover:bg-orange-50 transition shadow-lg text-base">
//                   Start Selling Free <ArrowRight className="w-5 h-5" />
//                 </Link>
//               </div>
//             </div>
//             <div className="hidden md:grid grid-cols-2 gap-3">
//               {[
//                 { emoji: '📦', label: 'Zero Listing Fee',     sub: 'List unlimited products' },
//                 { emoji: '📊', label: 'Analytics Dashboard',  sub: 'Track sales & revenue'   },
//                 { emoji: '💳', label: 'Fast Payouts',         sub: 'Weekly settlements'       },
//                 { emoji: '🚀', label: 'Marketing Tools',      sub: 'Reach more customers'     },
//               ].map((f) => (
//                 <div key={f.label} className="bg-white/15 backdrop-blur border border-white/30 rounded-2xl p-4">
//                   <div className="text-2xl mb-2">{f.emoji}</div>
//                   <p className="font-bold text-white text-sm">{f.label}</p>
//                   <p className="text-white/70 text-xs mt-0.5">{f.sub}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══ NEWSLETTER ════════════════════════════════════════ */}
//       <section className="bg-gray-50 border-t border-gray-100 py-14">
//         <div className="max-w-2xl mx-auto px-4 text-center">
//           <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Stay Updated</p>
//           <h2 className="text-2xl font-black text-gray-900 mb-2">Get Exclusive Deals</h2>
//           <p className="text-gray-500 text-sm mb-6">Subscribe for flash sales, new arrivals, and exclusive offers straight to your inbox.</p>
//           <div className="flex gap-2 max-w-md mx-auto">
//             <input
//               type="email"
//               placeholder="Enter your email address"
//               className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//             />
//             <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm whitespace-nowrap">
//               Subscribe
//             </button>
//           </div>
//           <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime. 🔒</p>
//         </div>
//       </section>

//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones,
  Star, ChevronRight, TrendingUp, Zap, Award, Users
} from 'lucide-react';
import { fetchFeatured, fetchCategories } from '../store/slices/productsSlice';
import ProductCard from '../components/common/ProductCard';
import { FullPageSpinner } from '../components/common';

const CATEGORIES = [
  { name: 'Electronics',     emoji: '📱', color: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',   text: 'text-blue-700'   },
  { name: 'Fashion',         emoji: '👗', color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-50',   text: 'text-pink-700'   },
  { name: 'Home & Kitchen',  emoji: '🏠', color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
  { name: 'Books',           emoji: '📚', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50',  text: 'text-green-700'  },
  { name: 'Sports',          emoji: '⚽', color: 'from-cyan-500 to-teal-600',     bg: 'bg-cyan-50',   text: 'text-cyan-700'   },
  { name: 'Beauty',          emoji: '💄', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  { name: 'Toys',            emoji: '🧸', color: 'from-yellow-500 to-amber-500',  bg: 'bg-yellow-50', text: 'text-yellow-700' },
  { name: 'Automotive',      emoji: '🚗', color: 'from-gray-600 to-slate-700',    bg: 'bg-gray-50',   text: 'text-gray-700'   },
];

const FEATURES = [
  { icon: Truck,      title: 'Free Delivery',     desc: 'On all orders above ₹999',      color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { icon: ShieldCheck, title: 'Secure Payments',  desc: '100% safe via Razorpay',        color: 'text-green-600',  bg: 'bg-green-50'  },
  { icon: RefreshCw,  title: '7-Day Returns',     desc: 'Hassle-free return policy',     color: 'text-amber-600',  bg: 'bg-amber-50'  },
  { icon: Headphones, title: '24/7 Support',      desc: 'Dedicated customer care',        color: 'text-purple-600', bg: 'bg-purple-50' },
];

const STATS = [
  { icon: Users,      value: '1,00,000+', label: 'Happy Customers' },
  { icon: Award,      value: '2,000+',    label: 'Verified Vendors' },
  { icon: TrendingUp, value: '50,000+',   label: 'Products Listed'  },
  { icon: Zap,        value: '99.9%',     label: 'Uptime'           },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',   role: 'Regular Buyer',      rating: 5, text: 'ShopWave has the best variety I\'ve seen. Fast delivery and genuine products every time!', city: 'Mumbai' },
  { name: 'Rahul Verma',    role: 'Verified Vendor',    rating: 5, text: 'As a seller, the vendor dashboard is amazing. I grew my sales 3x in just 2 months!', city: 'Delhi' },
  { name: 'Ananya Reddy',   role: 'Fashion Shopper',    rating: 5, text: 'Love the quality of fashion products here. Returns are so easy if something doesn\'t fit.', city: 'Bengaluru' },
];

const HERO_BADGES = ['✅ 100% Authentic Products', '🚀 Same-Day Shipping', '💳 Secure Razorpay Checkout'];

export default function Home() {
  const dispatch = useDispatch();
  const { featured, categories, loading } = useSelector((s) => s.products);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Build displayable categories (backend + fallback)
  const displayCategories = categories.length > 0
    ? CATEGORIES.filter((c) => categories.includes(c.name))
    : CATEGORIES;

  return (
    <div className="bg-white">

      {/* ══ HERO SECTION ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%),
                            radial-gradient(circle at 60% 80%, #06b6d4 0%, transparent 40%)`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {HERO_BADGES.map((b) => (
                  <span key={b} className="text-xs bg-white/10 backdrop-blur text-white/90 px-3 py-1.5 rounded-full border border-white/20 font-medium">
                    {b}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-5">
                India's Most{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Trusted
                </span>
                <br />Multi-Vendor<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Marketplace
                </span>
              </h1>

              <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
                Shop from <strong className="text-white">2,000+ verified vendors</strong> with guaranteed authenticity, easy returns, and lightning-fast delivery across India.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/products"
                  className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-indigo-900/50 text-base">
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/vendor/register"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl transition backdrop-blur text-base">
                  Become a Seller
                </Link>
              </div>

              {/* Mini stats row */}
              <div className="flex flex-wrap gap-6">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-base font-black text-white leading-none">{value}</p>
                      <p className="text-xs text-white/50">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="hidden md:flex flex-col gap-4 items-end">
              {[
                { label: 'New Arrival',  name: 'Sony WH-1000XM5',     price: '₹24,990',  discount: '20% OFF', img: '🎧', color: 'bg-indigo-500' },
                { label: '⚡ Flash Sale', name: 'Samsung 4K Smart TV', price: '₹34,999',  discount: '35% OFF', img: '📺', color: 'bg-rose-500'   },
                { label: 'Best Seller',  name: 'Nike Air Max 2024',    price: '₹8,999',   discount: '15% OFF', img: '👟', color: 'bg-amber-500'  },
              ].map((item, i) => (
                <div key={i}
                  className={`flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 w-72 hover:bg-white/15 transition
                    ${i === 1 ? 'translate-x-4' : ''}`}>
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                    {item.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{item.label}</span>
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{item.price}</span>
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">{item.discount}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES STRIP ════════════════════════════════════ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Explore</p>
            <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {displayCategories.slice(0, 8).map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`group flex flex-col items-center gap-2 p-3 ${cat.bg} rounded-2xl hover:shadow-md transition-all hover:-translate-y-1 duration-200 border border-transparent hover:border-indigo-100`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                {cat.emoji}
              </div>
              <span className={`text-xs font-bold ${cat.text} text-center leading-tight`}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ═════════════════════════════════ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Handpicked</p>
              <h2 className="text-3xl font-black text-gray-900">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <FullPageSpinner />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.filter(p => p && p._id).slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No featured products yet</p>
              <p className="text-sm mt-1">Admin can feature products from the dashboard</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/products"
              className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold px-8 py-3 rounded-2xl transition">
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ WHY SHOPWAVE — 3 COLUMN ═══════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Why Choose Us</p>
          <h2 className="text-3xl font-black text-gray-900">Built for India, Built to Last</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">From Kanyakumari to Kashmir — we serve every pin code with the same commitment to quality and speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: '🔍',
              title: 'Curated Vendors',
              desc: 'Every vendor on ShopWave goes through a strict verification process. We check GST, address, and product quality before they can sell.',
              color: 'border-blue-100 bg-blue-50',
            },
            {
              emoji: '⚡',
              title: 'Lightning Fast',
              desc: 'Our fulfillment network ensures same-day dispatch for orders placed before 2 PM. Most customers receive their orders within 2-3 business days.',
              color: 'border-amber-100 bg-amber-50',
            },
            {
              emoji: '🛡️',
              title: 'Buyer Protection',
              desc: 'Shop with confidence. If your product is damaged, wrong, or doesn\'t arrive — we\'ve got you covered with our full buyer protection guarantee.',
              color: 'border-green-100 bg-green-50',
            },
          ].map((item) => (
            <div key={item.title} className={`border rounded-3xl p-8 ${item.color} hover:shadow-md transition`}>
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Customer Stories</p>
          <h2 className="text-3xl font-black text-white mb-10">Loved Across India</h2>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 md:p-10 mb-6">
            <div className="flex justify-center mb-4">
              {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 italic">
              "{TESTIMONIALS[activeTestimonial].text}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-white text-lg">
                {TESTIMONIALS[activeTestimonial].name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-bold text-white">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-indigo-200 text-sm">{TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].city}</p>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i === activeTestimonial ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS BANNER ══════════════════════════════════════ */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SELL ON SHOPWAVE CTA ══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-10 md:p-14">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">For Entrepreneurs</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Start Selling on ShopWave</h2>
              <p className="text-white/80 leading-relaxed mb-6 max-w-md">
                Join 2,000+ vendors who trust ShopWave to grow their business. Zero listing fee, powerful dashboard, real-time analytics, and access to lakhs of customers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/vendor/register"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-7 py-3.5 rounded-2xl hover:bg-orange-50 transition shadow-lg text-base">
                  Start Selling Free <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { emoji: '📦', label: 'Zero Listing Fee',     sub: 'List unlimited products' },
                { emoji: '📊', label: 'Analytics Dashboard',  sub: 'Track sales & revenue'   },
                { emoji: '💳', label: 'Fast Payouts',         sub: 'Weekly settlements'       },
                { emoji: '🚀', label: 'Marketing Tools',      sub: 'Reach more customers'     },
              ].map((f) => (
                <div key={f.label} className="bg-white/15 backdrop-blur border border-white/30 rounded-2xl p-4">
                  <div className="text-2xl mb-2">{f.emoji}</div>
                  <p className="font-bold text-white text-sm">{f.label}</p>
                  <p className="text-white/70 text-xs mt-0.5">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER ════════════════════════════════════════ */}
      <section className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Stay Updated</p>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Get Exclusive Deals</h2>
          <p className="text-gray-500 text-sm mb-6">Subscribe for flash sales, new arrivals, and exclusive offers straight to your inbox.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime. 🔒</p>
        </div>
      </section>

    </div>
  );
}