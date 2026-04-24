// import { useEffect, useState } from 'react';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import {
//   Package, ShoppingBag, TrendingUp, IndianRupee,
//   Plus, Edit, Trash2, ChevronRight, Store, X, ImagePlus, Loader2, Link2, RefreshCw
// } from 'lucide-react';
// import { vendorAPI, productAPI, orderAPI, uploadAPI } from '../../api/services';
// import api from '../../api/axios';
// import { OrderStatusBadge, FullPageSpinner, EmptyState, Badge } from '../../components/common';
// import toast from 'react-hot-toast';

// const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// const CATEGORIES = ['Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Toys','Automotive','Food & Grocery','Health','Jewellery','Other'];
// const VENDOR_TABS = [
//   { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
//   { id: 'products',  label: 'My Products', icon: Package },
//   { id: 'orders',    label: 'Orders', icon: ShoppingBag },
//   { id: 'returns',   label: 'Returns',        icon: RefreshCw },
//   { id: 'settings',  label: 'Shop Settings', icon: Store },
// ];

// /* ══════════════════════════════════════════════
//    MAIN DASHBOARD
// ══════════════════════════════════════════════ */
// export default function VendorDashboard() {
//   const { tab = 'dashboard' } = useParams();
//   const navigate = useNavigate();
//   const [analytics, setAnalytics] = useState(null);
//   const [products,  setProducts]  = useState([]);
//   const [orders,    setOrders]    = useState([]);
//   const [vendor,    setVendor]    = useState(null);
//   const [loading,   setLoading]   = useState(true);
//   const [showForm,  setShowForm]  = useState(false);
//   const [editItem,  setEditItem]  = useState(null);
//   const [vReturns,  setVReturns]  = useState([]);

//   const reloadProducts = async (v) => {
//     const id = v?._id || vendor?._id;
//     if (!id) return;
//     const r = await productAPI.getAll({ vendor: id, limit: 100 }).catch(() => null);
//     setProducts(r?.data?.products || []);
//   };

//   useEffect(() => {
//     setLoading(true);
//     vendorAPI.getMyProfile().then(async (res) => {
//       const v = res.data.vendor;
//       setVendor(v);
//       if (tab === 'dashboard') {
//         const a = await vendorAPI.getAnalytics().catch(() => null);
//         if (a) setAnalytics(a.data.analytics);
//       }
//       if (tab === 'products') await reloadProducts(v);
//       if (tab === 'orders') {
//         const o = await orderAPI.getVendorOrders().catch(() => null);
//         setOrders(o?.data?.orders || []);
//       }
//       if (tab === 'returns') {
//         const r = await api.get('/returns/vendor-returns').catch(() => null);
//         setVReturns(r?.data?.returns || []);
//       }
//     }).catch(() => {}).finally(() => setLoading(false));
//   }, [tab]);

//   if (loading) return <FullPageSpinner />;

//   if (!vendor) return (
//     <div className="max-w-xl mx-auto px-4 py-20 text-center">
//       <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//         <Store className="w-8 h-8 text-indigo-600" />
//       </div>
//       <h2 className="text-xl font-bold text-gray-900 mb-2">No Vendor Profile</h2>
//       <p className="text-gray-500 mb-4">Register as a vendor to access the dashboard.</p>
//       <Link to="/vendor/register" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium">Register as Vendor</Link>
//     </div>
//   );

//   if (!vendor.isApproved) return (
//     <div className="max-w-xl mx-auto px-4 py-20 text-center">
//       <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//         <Store className="w-8 h-8 text-amber-500" />
//       </div>
//       <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Approval</h2>
//       <p className="text-gray-500">Login as Admin → Vendor Approvals → Approve your shop.</p>
//     </div>
//   );

//   const chartData = analytics?.monthlySales?.map((m) => ({
//     month: MONTHS[m._id.month - 1], revenue: Math.round(m.revenue), orders: m.orders,
//   })) || [];

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">{vendor.shopName}</h1>
//           <p className="text-sm text-gray-500">{vendor.category}</p>
//         </div>
//         {tab === 'products' && (
//           <button onClick={() => { setEditItem(null); setShowForm(true); window.scrollTo(0,0); }}
//             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
//             <Plus className="w-4 h-4" /> Add Product
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         {/* Sidebar */}
//         <div className="md:col-span-1">
//           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
//             <nav className="p-2">
//               {VENDOR_TABS.map(({ id, label, icon: Icon }) => (
//                 <button key={id} onClick={() => navigate(`/vendor/${id}`)}
//                   className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-0.5
//                     ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
//                   <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
//                   <ChevronRight className="w-3 h-3 opacity-50" />
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Main */}
//         <div className="md:col-span-4">

//           {/* ── DASHBOARD ── */}
//           {tab === 'dashboard' && analytics && (
//             <div className="space-y-5">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                   { label: 'Products',  value: analytics.totalProducts,   icon: Package,      color: 'bg-blue-50 text-blue-600' },
//                   { label: 'Orders',    value: analytics.totalOrders,     icon: ShoppingBag,  color: 'bg-purple-50 text-purple-600' },
//                   { label: 'Delivered', value: analytics.deliveredOrders, icon: TrendingUp,   color: 'bg-green-50 text-green-600' },
//                   { label: 'Revenue',   value: `₹${(analytics.totalRevenue||0).toLocaleString()}`, icon: IndianRupee, color: 'bg-amber-50 text-amber-600' },
//                 ].map(({ label, value, icon: Icon, color }) => (
//                   <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
//                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-4 h-4" /></div>
//                     <p className="text-2xl font-bold text-gray-900">{value}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{label}</p>
//                   </div>
//                 ))}
//               </div>
//               {chartData.length > 0 && (
//                 <div className="bg-white border border-gray-100 rounded-2xl p-5">
//                   <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
//                   <ResponsiveContainer width="100%" height={220}>
//                     <BarChart data={chartData}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                       <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//                       <YAxis tick={{ fontSize: 12 }} />
//                       <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
//                       <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//               {analytics.topProducts?.length > 0 && (
//                 <div className="bg-white border border-gray-100 rounded-2xl p-5">
//                   <h2 className="font-semibold text-gray-900 mb-4">Top Selling Products</h2>
//                   <div className="space-y-3">
//                     {analytics.topProducts.map((p, i) => (
//                       <div key={p._id} className="flex items-center gap-3">
//                         <span className="text-sm font-bold text-gray-400 w-5">#{i+1}</span>
//                         <img src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=?'} alt={p.name} className="w-10 h-10 object-cover rounded-xl bg-gray-50" />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
//                           <p className="text-xs text-gray-500">{p.sold} sold · ₹{p.price.toLocaleString()}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── PRODUCTS ── */}
//           {tab === 'products' && (
//             <div>
//               {showForm && (
//                 <ProductForm
//                   existing={editItem}
//                   onClose={() => { setShowForm(false); setEditItem(null); }}
//                   onSave={() => { setShowForm(false); setEditItem(null); reloadProducts(); }}
//                 />
//               )}
//               {products.length === 0 && !showForm ? (
//                 <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling"
//                   action={<button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Add Product</button>} />
//               ) : (
//                 <div className="space-y-3">
//                   {products.map((p) => (
//                     <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
//                       <img src={p.images?.[0]?.url || 'https://placehold.co/56x56?text=?'} alt={p.name}
//                         className="w-16 h-16 object-cover rounded-xl bg-gray-50 shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <p className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</p>
//                         <p className="text-xs text-gray-500 mt-0.5">{p.category} · Stock: {p.stock} · Sold: {p.sold}</p>
//                         <p className="text-xs text-gray-400 mt-0.5">{p.specifications?.length || 0} specs · {p.images?.length || 0} images</p>
//                         <p className="text-sm font-bold text-indigo-600 mt-0.5">₹{p.price.toLocaleString()}</p>
//                       </div>
//                       <Badge color={p.isActive ? 'green' : 'red'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
//                       <button onClick={() => { setEditItem(p); setShowForm(true); window.scrollTo(0,0); }}
//                         className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button onClick={async () => {
//                         if (!window.confirm('Delete this product?')) return;
//                         await productAPI.delete(p._id);
//                         setProducts((ps) => ps.filter((x) => x._id !== p._id));
//                         toast.success('Deleted');
//                       }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── ORDERS ── */}
//           {tab === 'orders' && (
//             <div className="space-y-3">
//               {orders.length === 0
//                 ? <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders from customers will appear here" />
//                 : orders.map((order) => <OrderCard key={order._id} order={order} onUpdate={setOrders} />)
//               }
//             </div>
//           )}

//           {/* ── SETTINGS ── */}
//           {/* ── RETURNS TAB ── */}
//           {tab === 'returns' && <VendorReturnsTab returns={vReturns} />}

//           {tab === 'settings' && vendor && <VendorSettings vendor={vendor} onUpdate={setVendor} />}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════
//    PRODUCT FORM — with Specs + Image URL
// ══════════════════════════════════════════════ */
// function ProductForm({ existing, onClose, onSave }) {
//   const [form, setForm] = useState({
//     name:          existing?.name          || '',
//     description:   existing?.description   || '',
//     price:         existing?.price         || '',
//     discountPrice: existing?.discountPrice || '',
//     category:      existing?.category      || '',
//     brand:         existing?.brand         || '',
//     stock:         existing?.stock         || '',
//     tags:          existing?.tags?.join(', ') || '',
//   });

//   // Images: [{url, public_id}]
//   const [images,    setImages]    = useState(existing?.images || []);
//   const [imageUrl,  setImageUrl]  = useState('');   // for URL input
//   const [uploading, setUploading] = useState(false);
//   const [loading,   setLoading]   = useState(false);

//   // Specifications: [{key, value}]
//   const [specs,   setSpecs]   = useState(existing?.specifications || []);
//   const [specKey, setSpecKey] = useState('');
//   const [specVal, setSpecVal] = useState('');

//   /* ── Image handlers ── */
//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;
//     if (images.length + files.length > 5) { toast.error('Max 5 images'); return; }
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       files.forEach((f) => fd.append('images', f));
//       const res = await uploadAPI.uploadImages(fd);
//       setImages((p) => [...p, ...res.data.images]);
//       toast.success(`${files.length} image(s) uploaded!`);
//     } catch { toast.error('Upload failed — check Cloudinary .env'); }
//     finally { setUploading(false); e.target.value = ''; }
//   };

//   const handleAddUrl = () => {
//     const url = imageUrl.trim();
//     if (!url) return;
//     if (images.length >= 5) { toast.error('Max 5 images'); return; }
//     if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) && !url.startsWith('https://')) {
//       toast.error('Enter a valid image URL (starts with https://)'); return;
//     }
//     setImages((p) => [...p, { url, public_id: '' }]);
//     setImageUrl('');
//     toast.success('Image URL added!');
//   };

//   const removeImage = async (idx) => {
//     const img = images[idx];
//     if (img.public_id) { try { await uploadAPI.deleteImage(img.public_id); } catch {} }
//     setImages((p) => p.filter((_, i) => i !== idx));
//   };

//   /* ── Spec handlers ── */
//   const addSpec = () => {
//     if (!specKey.trim() || !specVal.trim()) { toast.error('Enter both spec name and value'); return; }
//     setSpecs((p) => [...p, { key: specKey.trim(), value: specVal.trim() }]);
//     setSpecKey(''); setSpecVal('');
//   };

//   const removeSpec = (idx) => setSpecs((p) => p.filter((_, i) => i !== idx));

//   /* ── Submit ── */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.price || !form.category || !form.stock) {
//       toast.error('Fill all required fields'); return;
//     }
//     setLoading(true);
//     try {
//       const data = {
//         ...form,
//         price:          Number(form.price),
//         discountPrice:  Number(form.discountPrice) || 0,
//         stock:          Number(form.stock),
//         tags:           form.tags.split(',').map((t) => t.trim()).filter(Boolean),
//         images,
//         specifications: specs,
//       };
//       if (existing) await productAPI.update(existing._id, data);
//       else          await productAPI.create(data);
//       toast.success(existing ? 'Product updated!' : 'Product created!');
//       onSave();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     } finally { setLoading(false); }
//   };

//   return (
//     <div className="bg-white border border-indigo-100 rounded-2xl p-6 mb-6 shadow-sm">
//       <div className="flex items-center justify-between mb-5">
//         <h3 className="font-bold text-gray-900 text-lg">{existing ? 'Edit Product' : 'Add New Product'}</h3>
//         <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
//       </div>

//       {/* ── IMAGES SECTION ── */}
//       <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
//         <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Images <span className="text-gray-400 font-normal">(max 5)</span></h4>

//         {/* Thumbnails */}
//         <div className="flex flex-wrap gap-3 mb-3">
//           {images.map((img, idx) => (
//             <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-white">
//               <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=ERR'; }} />
//               <button type="button" onClick={() => removeImage(idx)}
//                 className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
//                 <X className="w-5 h-5 text-white" />
//               </button>
//               {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[9px] text-center py-0.5">Main</span>}
//             </div>
//           ))}
//           {images.length < 5 && (
//             <label className={`w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition
//               ${uploading ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
//               {uploading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /> : (
//                 <><ImagePlus className="w-6 h-6 text-gray-400" /><span className="text-[10px] text-gray-400 mt-1">Upload</span></>
//               )}
//               <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
//             </label>
//           )}
//         </div>
//         <p className="text-xs text-gray-400 mb-3">First image = main photo. Hover to remove.</p>

//         {/* URL Input */}
//         {images.length < 5 && (
//           <div className="flex gap-2">
//             <div className="flex-1 relative">
//               <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="url"
//                 value={imageUrl}
//                 onChange={(e) => setImageUrl(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
//                 placeholder="Or paste image URL: https://example.com/photo.jpg"
//                 className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//               />
//             </div>
//             <button type="button" onClick={handleAddUrl}
//               className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition font-medium whitespace-nowrap">
//               Add URL
//             </button>
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5">
//         {/* ── BASIC INFO ── */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-400">*</span></label>
//             <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               placeholder="e.g. Wireless Bluetooth Headphones"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-400">*</span></label>
//             <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
//               <option value="">Select category</option>
//               {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
//             <input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
//               placeholder="e.g. Sony, Samsung, Nike"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-400">*</span></label>
//             <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
//               placeholder="1999" min="0"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹) <span className="text-gray-400 font-normal">optional</span></label>
//             <input type="number" value={form.discountPrice} onChange={(e) => setForm((p) => ({ ...p, discountPrice: e.target.value }))}
//               placeholder="1499 (leave 0 for no discount)" min="0"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-400">*</span></label>
//             <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
//               placeholder="50" min="0"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">comma separated</span></label>
//             <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
//               placeholder="wireless, bluetooth, noise-cancelling"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-400">*</span></label>
//             <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
//               rows={4} placeholder="Describe your product — features, materials, what's in the box..."
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
//           </div>
//         </div>

//         {/* ── SPECIFICATIONS ── */}
//         <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
//           <h4 className="text-sm font-semibold text-gray-700 mb-3">
//             Specifications
//             <span className="text-gray-400 font-normal ml-1">(shown in product detail specs tab)</span>
//           </h4>

//           {/* Existing specs */}
//           {specs.length > 0 && (
//             <div className="mb-3 border border-gray-200 rounded-xl overflow-hidden bg-white">
//               {specs.map((s, i) => (
//                 <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 last:border-0`}>
//                   <span className="text-sm font-medium text-gray-700 w-1/3 truncate">{s.key}</span>
//                   <span className="text-sm text-gray-600 flex-1 truncate">{s.value}</span>
//                   <button type="button" onClick={() => removeSpec(i)}
//                     className="text-gray-300 hover:text-red-500 transition shrink-0">
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Add new spec */}
//           <div className="flex gap-2">
//             <input
//               value={specKey}
//               onChange={(e) => setSpecKey(e.target.value)}
//               placeholder="Spec name (e.g. Battery Life)"
//               className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//             />
//             <input
//               value={specVal}
//               onChange={(e) => setSpecVal(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
//               placeholder="Value (e.g. 30 hours)"
//               className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//             />
//             <button type="button" onClick={addSpec}
//               className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition font-medium whitespace-nowrap">
//               + Add
//             </button>
//           </div>
//           <p className="text-xs text-gray-400 mt-2">Press Enter or click Add. Examples: Connectivity → Bluetooth 5.3 | Weight → 250g | Warranty → 1 Year</p>
//         </div>

//         {/* ── SUBMIT ── */}
//         <div className="flex gap-3">
//           <button type="submit" disabled={loading || uploading}
//             className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-60 transition font-medium">
//             {loading && <Loader2 className="w-4 h-4 animate-spin" />}
//             {loading ? 'Saving...' : existing ? 'Update Product' : 'Create Product'}
//           </button>
//           <button type="button" onClick={onClose}
//             className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════
//    ORDER CARD
// ══════════════════════════════════════════════ */
// const ALL_ORDER_STATUSES = [
//   { value: 'placed',     label: 'Placed',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
//   { value: 'confirmed',  label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
//   { value: 'processing', label: 'Processing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
//   { value: 'shipped',    label: 'Shipped',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
//   { value: 'delivered',  label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200' },
//   { value: 'cancelled',  label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200' },
// ];

// function OrderCard({ order, onUpdate }) {
//   const [updating,   setUpdating]   = useState(false);
//   const [showItems,  setShowItems]  = useState(false);
//   const isFinal = ['delivered','cancelled','refunded'].includes(order.orderStatus);
//   const currentStatus = ALL_ORDER_STATUSES.find((s) => s.value === order.orderStatus);

//   const handleStatusChange = async (newStatus) => {
//     if (newStatus === order.orderStatus) return;
//     if (!window.confirm(`Change status to "${newStatus}"?`)) return;
//     setUpdating(true);
//     try {
//       const res = await orderAPI.updateStatus(order._id, { status: newStatus });
//       onUpdate((prev) => prev.map((o) => o._id === order._id ? res.data.order : o));
//       toast.success(`Order marked as ${newStatus}`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Update failed');
//     } finally { setUpdating(false); }
//   };

//   return (
//     <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
//       <div className="flex items-center justify-between p-4 border-b border-gray-50">
//         <div>
//           <p className="text-xs text-gray-400 font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</p>
//           <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
//         </div>
//         <div className="text-right">
//           <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${currentStatus?.color}`}>{currentStatus?.label}</span>
//           <p className="text-base font-bold text-gray-900 mt-1">₹{order.totalPrice.toLocaleString()}</p>
//         </div>
//       </div>

//       <div className="px-4 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
//             {order.customer?.name?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
//             <p className="text-xs text-gray-500">{order.customer?.email}</p>
//           </div>
//         </div>
//         <button onClick={() => setShowItems(!showItems)} className="text-xs text-indigo-600 hover:underline">
//           {showItems ? 'Hide items' : `View ${order.items?.length} item(s)`}
//         </button>
//       </div>

//       {showItems && (
//         <div className="px-4 pb-3 space-y-2">
//           {order.items?.map((item, i) => (
//             <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
//               <img src={item.image || 'https://placehold.co/40x40?text=?'} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-white" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
//                 <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
//               </div>
//               <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {!isFinal ? (
//         <div className="px-4 pb-4">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status:</p>
//           <div className="flex flex-wrap gap-2">
//             {ALL_ORDER_STATUSES.filter((s) => s.value !== order.orderStatus).map((s) => (
//               <button key={s.value} onClick={() => handleStatusChange(s.value)} disabled={updating}
//                 className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition disabled:opacity-50
//                   ${s.value === 'cancelled'
//                     ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
//                     : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
//                 {updating ? '...' : `→ ${s.label}`}
//               </button>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="px-4 pb-4">
//           <p className={`text-xs font-medium px-3 py-2 rounded-xl text-center ${order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
//             {order.orderStatus === 'delivered' ? '✓ Completed' : '✗ Cancelled — no further updates'}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════
//    VENDOR SETTINGS
// ══════════════════════════════════════════════ */
// function VendorSettings({ vendor, onUpdate }) {
//   const [form, setForm] = useState({
//     shopName: vendor.shopName || '', shopDescription: vendor.shopDescription || '',
//     category: vendor.category || '', gstNumber: vendor.gstNumber || '',
//   });
//   const handleSave = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await vendorAPI.updateProfile(form);
//       onUpdate(res.data.vendor);
//       toast.success('Shop updated!');
//     } catch { toast.error('Update failed'); }
//   };
//   return (
//     <div className="bg-white border border-gray-100 rounded-2xl p-6">
//       <h2 className="font-bold text-gray-900 mb-5">Shop Settings</h2>
//       <form onSubmit={handleSave} className="space-y-4 max-w-lg">
//         {[['shopName','Shop Name','Your Store Name'],['gstNumber','GST Number','29AAAAA0000A1Z5']].map(([field,label,placeholder]) => (
//           <div key={field}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//             <input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
//               placeholder={placeholder}
//               className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>
//         ))}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
//           <textarea value={form.shopDescription} onChange={(e) => setForm((p) => ({ ...p, shopDescription: e.target.value }))}
//             rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//           <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
//             className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
//             {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//         </div>
//         <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition font-medium">Save Changes</button>
//       </form>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    VENDOR RETURNS TAB
// ══════════════════════════════════════════════════════════ */
// function VendorReturnsTab({ returns }) {
//   const STATUS_COLORS = {
//     requested:        'bg-yellow-100 text-yellow-700',
//     approved:         'bg-green-100 text-green-700',
//     rejected:         'bg-red-100 text-red-600',
//     refund_initiated: 'bg-blue-100 text-blue-700',
//     refunded:         'bg-green-100 text-green-700',
//   };

//   const REASON_LABELS = {
//     defective_damaged:      'Defective/Damaged',
//     wrong_item_received:    'Wrong Item',
//     not_as_described:       'Not As Described',
//     missing_parts:          'Missing Parts',
//     size_fit_issue:         'Size/Fit Issue',
//     changed_mind:           'Changed Mind',
//     better_price_elsewhere: 'Better Price Elsewhere',
//     arrived_late:           'Arrived Late',
//     other:                  'Other',
//   };

//   if (returns.length === 0) return (
//     <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
//       <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//         <RefreshCw className="w-7 h-7 text-gray-400" />
//       </div>
//       <p className="font-semibold text-gray-900 mb-1">No Return Requests</p>
//       <p className="text-sm text-gray-400">Return requests from customers on your products will appear here.</p>
//     </div>
//   );

//   return (
//     <div className="space-y-4">
//       {/* Summary */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: 'Total Returns',   value: returns.length,                                           color: 'bg-gray-50' },
//           { label: 'Pending',          value: returns.filter((r) => r.status === 'requested').length,  color: 'bg-yellow-50' },
//           { label: 'Refunded',         value: `₹${returns.filter((r) => r.status === 'refunded').reduce((s, r) => s + (r.refundAmount || 0), 0).toLocaleString('en-IN')}`, color: 'bg-green-50' },
//         ].map(({ label, value, color }) => (
//           <div key={label} className={`${color} rounded-2xl p-4 border border-gray-100`}>
//             <p className="text-xl font-black text-gray-900">{value}</p>
//             <p className="text-xs text-gray-500 mt-0.5">{label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Note */}
//       <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
//         ℹ️ Return approvals and refunds are handled by the <strong>Admin</strong>. You will be notified when a return is requested on your product.
//       </div>

//       {/* List */}
//       {returns.map((ret) => (
//         <div key={ret._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
//           <div className="flex items-start justify-between p-4 border-b border-gray-50">
//             <div>
//               <p className="text-xs font-mono font-bold text-gray-400 mb-1">#{ret._id?.slice(-8).toUpperCase()}</p>
//               <p className="text-sm font-semibold text-gray-900">{ret.customer?.name}</p>
//               <p className="text-xs text-gray-500">{ret.customer?.email}</p>
//               <p className="text-xs text-indigo-500 mt-0.5 font-medium">{REASON_LABELS[ret.reason] || ret.reason}</p>
//             </div>
//             <div className="text-right">
//               <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[ret.status] || 'bg-gray-100 text-gray-600'}`}>
//                 {ret.status?.replace(/_/g, ' ')}
//               </span>
//               <p className="text-lg font-black text-gray-900 mt-1">₹{ret.refundAmount?.toLocaleString('en-IN')}</p>
//             </div>
//           </div>

//           {/* Items */}
//           <div className="px-4 py-3 space-y-2">
//             {ret.items?.map((item, i) => (
//               <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
//                 <img src={item.image || 'https://placehold.co/36x36?text=?'} alt={item.name}
//                   className="w-9 h-9 object-cover rounded-lg shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
//                   <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Status */}
//           <div className="px-4 pb-3">
//             {ret.status === 'refunded' && (
//               <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center">
//                 <p className="text-sm font-bold text-green-700">✅ Refund of ₹{ret.refundAmount?.toLocaleString()} completed</p>
//                 <p className="text-xs text-green-600 mt-0.5">Amount refunded to customer's original payment method</p>
//               </div>
//             )}
//             {ret.status === 'rejected' && (
//               <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
//                 <p className="text-xs font-bold text-red-700">Return Rejected by Admin</p>
//                 <p className="text-xs text-red-600 mt-0.5">{ret.rejectionReason}</p>
//               </div>
//             )}
//             {ret.status === 'requested' && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 text-center">
//                 <p className="text-xs font-semibold text-yellow-700">⏳ Pending Admin Review</p>
//               </div>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Package, ShoppingBag, TrendingUp, IndianRupee,
  Plus, Edit, Trash2, ChevronRight, Store, X, ImagePlus, Loader2, Link2, RefreshCw
} from 'lucide-react';
import { vendorAPI, productAPI, orderAPI, uploadAPI } from '../../api/services';
import api from '../../api/axios';
import { OrderStatusBadge, FullPageSpinner, EmptyState, Badge } from '../../components/common';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES = ['Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Toys','Automotive','Food & Grocery','Health','Jewellery','Other'];
const VENDOR_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'products',  label: 'My Products', icon: Package },
  { id: 'orders',    label: 'Orders', icon: ShoppingBag },
  { id: 'returns',   label: 'Returns',        icon: RefreshCw },
  { id: 'settings',  label: 'Shop Settings', icon: Store },
];

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
export default function VendorDashboard() {
  const { tab = 'dashboard' } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [products,  setProducts]  = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [vendor,    setVendor]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [vReturns,  setVReturns]  = useState([]);

  const reloadProducts = async (v) => {
    const id = v?._id || vendor?._id;
    if (!id) return;
    const r = await productAPI.getAll({ vendor: id, limit: 100 }).catch(() => null);
    setProducts(r?.data?.products || []);
  };

  useEffect(() => {
    setLoading(true);
    vendorAPI.getMyProfile().then(async (res) => {
      const v = res.data.vendor;
      setVendor(v);
      if (tab === 'dashboard') {
        const a = await vendorAPI.getAnalytics().catch(() => null);
        if (a) setAnalytics(a.data.analytics);
      }
      if (tab === 'products') await reloadProducts(v);
      if (tab === 'orders') {
        const o = await orderAPI.getVendorOrders().catch(() => null);
        setOrders(o?.data?.orders || []);
      }
      if (tab === 'returns') {
        const r = await api.get('/returns/vendor-returns').catch(() => null);
        setVReturns(r?.data?.returns || []);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  if (loading) return <FullPageSpinner />;

  if (!vendor) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Store className="w-8 h-8 text-indigo-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Vendor Profile</h2>
      <p className="text-gray-500 mb-4">Register as a vendor to access the dashboard.</p>
      <Link to="/vendor/register" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium">Register as Vendor</Link>
    </div>
  );

  if (!vendor.isApproved) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Store className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Approval</h2>
      <p className="text-gray-500">Login as Admin → Vendor Approvals → Approve your shop.</p>
    </div>
  );

  const chartData = analytics?.monthlySales?.map((m) => ({
    month: MONTHS[m._id.month - 1], revenue: Math.round(m.revenue), orders: m.orders,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.shopName}</h1>
          <p className="text-sm text-gray-500">{vendor.category}</p>
        </div>
        {tab === 'products' && (
          <button onClick={() => { setEditItem(null); setShowForm(true); window.scrollTo(0,0); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <nav className="p-2">
              {VENDOR_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => navigate(`/vendor/${id}`)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-0.5
                    ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="md:col-span-4">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && analytics && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Products',  value: analytics.totalProducts,   icon: Package,      color: 'bg-blue-50 text-blue-600' },
                  { label: 'Orders',    value: analytics.totalOrders,     icon: ShoppingBag,  color: 'bg-purple-50 text-purple-600' },
                  { label: 'Delivered', value: analytics.deliveredOrders, icon: TrendingUp,   color: 'bg-green-50 text-green-600' },
                  { label: 'Revenue',   value: `₹${(analytics.totalRevenue||0).toLocaleString()}`, icon: IndianRupee, color: 'bg-amber-50 text-amber-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-4 h-4" /></div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {chartData.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {analytics.topProducts?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <h2 className="font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                  <div className="space-y-3">
                    {(analytics.topProducts || []).filter(p => p && p._id).map((p, i) => (
                      <div key={p._id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400 w-5">#{i+1}</span>
                        <img src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=?'} alt={p.name} className="w-10 h-10 object-cover rounded-xl bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sold} sold · ₹{p.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div>
              {showForm && (
                <ProductForm
                  existing={editItem}
                  onClose={() => { setShowForm(false); setEditItem(null); }}
                  onSave={() => { setShowForm(false); setEditItem(null); reloadProducts(); }}
                />
              )}
              {products.length === 0 && !showForm ? (
                <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling"
                  action={<button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Add Product</button>} />
              ) : (
                <div className="space-y-3">
                  {(products || []).filter(p => p && p._id).map((p) => (
                    <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/56x56?text=?'} alt={p.name}
                        className="w-16 h-16 object-cover rounded-xl bg-gray-50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.category} · Stock: {p.stock} · Sold: {p.sold}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.specifications?.length || 0} specs · {p.images?.length || 0} images</p>
                        <p className="text-sm font-bold text-indigo-600 mt-0.5">₹{p.price.toLocaleString()}</p>
                      </div>
                      <Badge color={p.isActive ? 'green' : 'red'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                      <button onClick={() => { setEditItem(p); setShowForm(true); window.scrollTo(0,0); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={async () => {
                        if (!window.confirm('Delete this product?')) return;
                        await productAPI.delete(p._id);
                        setProducts((ps) => ps.filter((x) => x._id !== p._id));
                        toast.success('Deleted');
                      }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0
                ? <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders from customers will appear here" />
                : (orders || []).filter(o => o && o._id).map((order) => <OrderCard key={order._id} order={order} onUpdate={setOrders} />)
              }
            </div>
          )}

          {/* ── SETTINGS ── */}
          {/* ── RETURNS TAB ── */}
          {tab === 'returns' && <VendorReturnsTab returns={vReturns} />}

          {tab === 'settings' && vendor && <VendorSettings vendor={vendor} onUpdate={setVendor} />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT FORM — with Specs + Image URL
══════════════════════════════════════════════ */
function ProductForm({ existing, onClose, onSave }) {
  const [form, setForm] = useState({
    name:          existing?.name          || '',
    description:   existing?.description   || '',
    price:         existing?.price         || '',
    discountPrice: existing?.discountPrice || '',
    category:      existing?.category      || '',
    brand:         existing?.brand         || '',
    stock:         existing?.stock         || '',
    tags:          existing?.tags?.join(', ') || '',
  });

  // Images: [{url, public_id}]
  const [images,    setImages]    = useState(existing?.images || []);
  const [imageUrl,  setImageUrl]  = useState('');   // for URL input
  const [uploading, setUploading] = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Specifications: [{key, value}]
  const [specs,   setSpecs]   = useState(existing?.specifications || []);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  /* ── Image handlers ── */
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 5) { toast.error('Max 5 images'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await uploadAPI.uploadImages(fd);
      setImages((p) => [...p, ...res.data.images]);
      toast.success(`${files.length} image(s) uploaded!`);
    } catch { toast.error('Upload failed — check Cloudinary .env'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleAddUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (images.length >= 5) { toast.error('Max 5 images'); return; }
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) && !url.startsWith('https://')) {
      toast.error('Enter a valid image URL (starts with https://)'); return;
    }
    setImages((p) => [...p, { url, public_id: '' }]);
    setImageUrl('');
    toast.success('Image URL added!');
  };

  const removeImage = async (idx) => {
    const img = images[idx];
    if (img.public_id) { try { await uploadAPI.deleteImage(img.public_id); } catch {} }
    setImages((p) => p.filter((_, i) => i !== idx));
  };

  /* ── Spec handlers ── */
  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) { toast.error('Enter both spec name and value'); return; }
    setSpecs((p) => [...p, { key: specKey.trim(), value: specVal.trim() }]);
    setSpecKey(''); setSpecVal('');
  };

  const removeSpec = (idx) => setSpecs((p) => p.filter((_, i) => i !== idx));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Fill all required fields'); return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        price:          Number(form.price),
        discountPrice:  Number(form.discountPrice) || 0,
        stock:          Number(form.stock),
        tags:           form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images,
        specifications: specs,
      };
      if (existing) await productAPI.update(existing._id, data);
      else          await productAPI.create(data);
      toast.success(existing ? 'Product updated!' : 'Product created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-lg">{existing ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
      </div>

      {/* ── IMAGES SECTION ── */}
      <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Images <span className="text-gray-400 font-normal">(max 5)</span></h4>

        {/* Thumbnails */}
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-white">
              <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=ERR'; }} />
              <button type="button" onClick={() => removeImage(idx)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <X className="w-5 h-5 text-white" />
              </button>
              {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[9px] text-center py-0.5">Main</span>}
            </div>
          ))}
          {images.length < 5 && (
            <label className={`w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition
              ${uploading ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
              {uploading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /> : (
                <><ImagePlus className="w-6 h-6 text-gray-400" /><span className="text-[10px] text-gray-400 mt-1">Upload</span></>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">First image = main photo. Hover to remove.</p>

        {/* URL Input */}
        {images.length < 5 && (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                placeholder="Or paste image URL: https://example.com/photo.jpg"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button type="button" onClick={handleAddUrl}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition font-medium whitespace-nowrap">
              Add URL
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── BASIC INFO ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-400">*</span></label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
              placeholder="e.g. Sony, Samsung, Nike"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-400">*</span></label>
            <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="1999" min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹) <span className="text-gray-400 font-normal">optional</span></label>
            <input type="number" value={form.discountPrice} onChange={(e) => setForm((p) => ({ ...p, discountPrice: e.target.value }))}
              placeholder="1499 (leave 0 for no discount)" min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-400">*</span></label>
            <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
              placeholder="50" min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">comma separated</span></label>
            <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="wireless, bluetooth, noise-cancelling"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4} placeholder="Describe your product — features, materials, what's in the box..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>

        {/* ── SPECIFICATIONS ── */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Specifications
            <span className="text-gray-400 font-normal ml-1">(shown in product detail specs tab)</span>
          </h4>

          {/* Existing specs */}
          {specs.length > 0 && (
            <div className="mb-3 border border-gray-200 rounded-xl overflow-hidden bg-white">
              {specs.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                  <span className="text-sm font-medium text-gray-700 w-1/3 truncate">{s.key}</span>
                  <span className="text-sm text-gray-600 flex-1 truncate">{s.value}</span>
                  <button type="button" onClick={() => removeSpec(i)}
                    className="text-gray-300 hover:text-red-500 transition shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new spec */}
          <div className="flex gap-2">
            <input
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="Spec name (e.g. Battery Life)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <input
              value={specVal}
              onChange={(e) => setSpecVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
              placeholder="Value (e.g. 30 hours)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button type="button" onClick={addSpec}
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition font-medium whitespace-nowrap">
              + Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Press Enter or click Add. Examples: Connectivity → Bluetooth 5.3 | Weight → 250g | Warranty → 1 Year</p>
        </div>

        {/* ── SUBMIT ── */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading || uploading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-60 transition font-medium">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : existing ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={onClose}
            className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ORDER CARD
══════════════════════════════════════════════ */
const ALL_ORDER_STATUSES = [
  { value: 'placed',     label: 'Placed',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'confirmed',  label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'processing', label: 'Processing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'shipped',    label: 'Shipped',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'delivered',  label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200' },
];

function OrderCard({ order, onUpdate }) {
  const [updating,   setUpdating]   = useState(false);
  const [showItems,  setShowItems]  = useState(false);
  const isFinal = ['delivered','cancelled','refunded'].includes(order.orderStatus);
  const currentStatus = ALL_ORDER_STATUSES.find((s) => s.value === order.orderStatus);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.orderStatus) return;
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdating(true);
    try {
      const res = await orderAPI.updateStatus(order._id, { status: newStatus });
      onUpdate((prev) => prev.map((o) => o._id === order._id ? res.data.order : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div>
          <p className="text-xs text-gray-400 font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${currentStatus?.color}`}>{currentStatus?.label}</span>
          <p className="text-base font-bold text-gray-900 mt-1">₹{order.totalPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
            {order.customer?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
            <p className="text-xs text-gray-500">{order.customer?.email}</p>
          </div>
        </div>
        <button onClick={() => setShowItems(!showItems)} className="text-xs text-indigo-600 hover:underline">
          {showItems ? 'Hide items' : `View ${order.items?.length} item(s)`}
        </button>
      </div>

      {showItems && (
        <div className="px-4 pb-3 space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
              <img src={item.image || 'https://placehold.co/40x40?text=?'} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-white" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
              </div>
              <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {!isFinal ? (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status:</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ORDER_STATUSES.filter((s) => s.value !== order.orderStatus).map((s) => (
              <button key={s.value} onClick={() => handleStatusChange(s.value)} disabled={updating}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition disabled:opacity-50
                  ${s.value === 'cancelled'
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
                {updating ? '...' : `→ ${s.label}`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <p className={`text-xs font-medium px-3 py-2 rounded-xl text-center ${order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {order.orderStatus === 'delivered' ? '✓ Completed' : '✗ Cancelled — no further updates'}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   VENDOR SETTINGS
══════════════════════════════════════════════ */
function VendorSettings({ vendor, onUpdate }) {
  const [form, setForm] = useState({
    shopName: vendor.shopName || '', shopDescription: vendor.shopDescription || '',
    category: vendor.category || '', gstNumber: vendor.gstNumber || '',
  });
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await vendorAPI.updateProfile(form);
      onUpdate(res.data.vendor);
      toast.success('Shop updated!');
    } catch { toast.error('Update failed'); }
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 mb-5">Shop Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        {[['shopName','Shop Name','Your Store Name'],['gstNumber','GST Number','29AAAAA0000A1Z5']].map(([field,label,placeholder]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
          <textarea value={form.shopDescription} onChange={(e) => setForm((p) => ({ ...p, shopDescription: e.target.value }))}
            rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition font-medium">Save Changes</button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VENDOR RETURNS TAB
══════════════════════════════════════════════════════════ */
function VendorReturnsTab({ returns }) {
  const STATUS_COLORS = {
    requested:        'bg-yellow-100 text-yellow-700',
    approved:         'bg-green-100 text-green-700',
    rejected:         'bg-red-100 text-red-600',
    refund_initiated: 'bg-blue-100 text-blue-700',
    refunded:         'bg-green-100 text-green-700',
  };

  const REASON_LABELS = {
    defective_damaged:      'Defective/Damaged',
    wrong_item_received:    'Wrong Item',
    not_as_described:       'Not As Described',
    missing_parts:          'Missing Parts',
    size_fit_issue:         'Size/Fit Issue',
    changed_mind:           'Changed Mind',
    better_price_elsewhere: 'Better Price Elsewhere',
    arrived_late:           'Arrived Late',
    other:                  'Other',
  };

  if (returns.length === 0) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <RefreshCw className="w-7 h-7 text-gray-400" />
      </div>
      <p className="font-semibold text-gray-900 mb-1">No Return Requests</p>
      <p className="text-sm text-gray-400">Return requests from customers on your products will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Returns',   value: returns.length,                                           color: 'bg-gray-50' },
          { label: 'Pending',          value: returns.filter((r) => r.status === 'requested').length,  color: 'bg-yellow-50' },
          { label: 'Refunded',         value: `₹${returns.filter((r) => r.status === 'refunded').reduce((s, r) => s + (r.refundAmount || 0), 0).toLocaleString('en-IN')}`, color: 'bg-green-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
        ℹ️ Return approvals and refunds are handled by the <strong>Admin</strong>. You will be notified when a return is requested on your product.
      </div>

      {/* List */}
      {(returns || []).filter(r => r && r._id).map((ret) => (
        <div key={ret._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-start justify-between p-4 border-b border-gray-50">
            <div>
              <p className="text-xs font-mono font-bold text-gray-400 mb-1">#{ret._id?.slice(-8).toUpperCase()}</p>
              <p className="text-sm font-semibold text-gray-900">{ret.customer?.name}</p>
              <p className="text-xs text-gray-500">{ret.customer?.email}</p>
              <p className="text-xs text-indigo-500 mt-0.5 font-medium">{REASON_LABELS[ret.reason] || ret.reason}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[ret.status] || 'bg-gray-100 text-gray-600'}`}>
                {ret.status?.replace(/_/g, ' ')}
              </span>
              <p className="text-lg font-black text-gray-900 mt-1">₹{ret.refundAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Items */}
          <div className="px-4 py-3 space-y-2">
            {ret.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                <img src={item.image || 'https://placehold.co/36x36?text=?'} alt={item.name}
                  className="w-9 h-9 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="px-4 pb-3">
            {ret.status === 'refunded' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center">
                <p className="text-sm font-bold text-green-700">✅ Refund of ₹{ret.refundAmount?.toLocaleString()} completed</p>
                <p className="text-xs text-green-600 mt-0.5">Amount refunded to customer's original payment method</p>
              </div>
            )}
            {ret.status === 'rejected' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
                <p className="text-xs font-bold text-red-700">Return Rejected by Admin</p>
                <p className="text-xs text-red-600 mt-0.5">{ret.rejectionReason}</p>
              </div>
            )}
            {ret.status === 'requested' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 text-center">
                <p className="text-xs font-semibold text-yellow-700">⏳ Pending Admin Review</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}