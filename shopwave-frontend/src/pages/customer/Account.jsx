// import { useState, useEffect } from 'react';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Package, Heart, User, MapPin, Lock, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
// import MyReturns from './MyReturns';
// import { orderAPI, authAPI } from '../../api/services';
// import { updateProfile, fetchProfile, selectWishlistCount } from '../../store/slices/authSlice';
// import { OrderStatusBadge, FullPageSpinner, EmptyState } from '../../components/common';
// import toast from 'react-hot-toast';

// const TABS = [
//   { id: 'orders',    label: 'My Orders', icon: Package },
//   { id: 'wishlist',  label: 'Wishlist',  icon: Heart },
//   { id: 'returns',   label: 'Returns',   icon: RefreshCw },
//   { id: 'profile',   label: 'Profile',   icon: User },
//   { id: 'addresses', label: 'Addresses', icon: MapPin },
//   { id: 'security',  label: 'Security',  icon: Lock },
// ];

// const ORDER_STATUSES = ['all','placed','confirmed','processing','shipped','delivered','cancelled'];
// const CATEGORIES = ['All','Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Toys','Automotive','Food & Grocery','Health','Jewellery','Other'];

// export default function Account() {
//   const { tab = 'orders' } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector((s) => s.auth);

//   // Read wishlist directly from Redux state (populated objects after fetchProfile)
//   const reduxWishlist = useSelector((s) => s.auth.wishlist || []);
//   const wishlistCount = useSelector(selectWishlistCount);

//   const [orders,  setOrders]  = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [orderSearch,       setOrderSearch]       = useState('');
//   const [orderStatusFilter, setOrderStatusFilter] = useState('all');
//   const [wishlistCategory,  setWishlistCategory]  = useState('All');
//   const [wishlistSearch,    setWishlistSearch]    = useState('');

//   const [profileData,  setProfileData]  = useState({ name: user?.name || '', phone: user?.phone || '' });
//   const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

//   useEffect(() => {
//     if (tab === 'orders') {
//       setLoading(true);
//       orderAPI.getMyOrders()
//         .then((r) => setOrders(r.data.orders))
//         .catch(() => {})
//         .finally(() => setLoading(false));
//     }
//     if (tab === 'wishlist') {
//       // fetchProfile returns wishlist populated with category, price, images etc
//       setLoading(true);
//       dispatch(fetchProfile()).finally(() => setLoading(false));
//     }
//   }, [tab, dispatch]);

//   // Only use populated wishlist objects (filter out plain string IDs)
//   const wishlistItems = reduxWishlist.filter((item) => typeof item === 'object' && item !== null && item._id);

//   // Filtered orders
//   const filteredOrders = orders.filter((o) => {
//     const matchStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
//     const matchSearch = orderSearch === '' ||
//       o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
//       o.items?.some((i) => i.name?.toLowerCase().includes(orderSearch.toLowerCase()));
//     return matchStatus && matchSearch;
//   });

//   // Filtered wishlist — now category works because we have full product objects
//   const filteredWishlist = wishlistItems.filter((p) => {
//     const matchCategory = wishlistCategory === 'All' || p.category === wishlistCategory;
//     const matchSearch   = wishlistSearch === '' || p.name?.toLowerCase().includes(wishlistSearch.toLowerCase());
//     return matchCategory && matchSearch;
//   });

//   const handleProfileUpdate = (e) => {
//     e.preventDefault();
//     dispatch(updateProfile(profileData));
//   };

//   const handlePasswordUpdate = async (e) => {
//     e.preventDefault();
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast.error('Passwords do not match'); return;
//     }
//     try {
//       await authAPI.updatePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
//       toast.success('Password updated!');
//       setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update password');
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

//         {/* Sidebar */}
//         <div className="md:col-span-1">
//           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
//             <div className="p-4 border-b border-gray-50 bg-indigo-50">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                   {user?.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
//                   <p className="text-xs text-gray-500 truncate">{user?.email}</p>
//                 </div>
//               </div>
//             </div>
//             <nav className="p-2">
//               {TABS.map(({ id, label, icon: Icon }) => (
//                 <button key={id} onClick={() => navigate(`/account/${id}`)}
//                   className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-0.5
//                     ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
//                   <span className="flex items-center gap-2">
//                     <Icon className="w-4 h-4" />{label}
//                     {id === 'wishlist' && wishlistCount > 0 && (
//                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
//                         {wishlistCount}
//                       </span>
//                     )}
//                   </span>
//                   <ChevronRight className="w-3 h-3 opacity-50" />
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Main */}
//         <div className="md:col-span-3">

//           {/* ORDERS TAB */}
//           {tab === 'orders' && (
//             <div className="space-y-4">
//               <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
//               <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input type="text" placeholder="Search by order ID or product name..." value={orderSearch}
//                     onChange={(e) => setOrderSearch(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div className="flex items-center gap-2 overflow-x-auto pb-1">
//                   <Filter className="w-4 h-4 text-gray-400 shrink-0" />
//                   {ORDER_STATUSES.map((s) => (
//                     <button key={s} onClick={() => setOrderStatusFilter(s)}
//                       className={`shrink-0 text-xs px-3 py-1.5 rounded-full capitalize font-medium transition
//                         ${orderStatusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {loading ? <FullPageSpinner /> : filteredOrders.length === 0 ? (
//                 <EmptyState icon={Package}
//                   title={orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
//                   description={orders.length === 0 ? 'Place your first order and it will appear here' : 'Try a different filter'}
//                   action={orders.length === 0
//                     ? <Link to="/products" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Start Shopping</Link>
//                     : <button onClick={() => { setOrderStatusFilter('all'); setOrderSearch(''); }} className="text-sm text-indigo-600 hover:underline">Clear filters</button>
//                   }
//                 />
//               ) : filteredOrders.map((order) => (
//                 <Link key={order._id} to={`/account/orders/${order._id}`}
//                   className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition">
//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
//                       <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">{order.items?.length} item(s)</p>
//                     </div>
//                     <div className="text-right">
//                       <OrderStatusBadge status={order.orderStatus} />
//                       <p className="text-base font-bold text-gray-900 mt-1">₹{order.totalPrice.toLocaleString()}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {order.items?.slice(0,3).map((item,i) => (
//                       <img key={i} src={item.image||'https://placehold.co/48x48?text=?'} alt={item.name}
//                         className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
//                     ))}
//                     {order.items?.length > 3 && <span className="text-xs text-gray-400">+{order.items.length-3} more</span>}
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}

//           {/* WISHLIST TAB */}
//           {tab === 'wishlist' && (
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-bold text-gray-900">
//                   My Wishlist
//                   {wishlistCount > 0 && (
//                     <span className="ml-2 text-sm font-normal text-gray-400">({wishlistCount} items)</span>
//                   )}
//                 </h2>
//               </div>

//               {/* Filters */}
//               <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input type="text" placeholder="Search wishlist..." value={wishlistSearch}
//                     onChange={(e) => setWishlistSearch(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div className="flex items-center gap-2 overflow-x-auto pb-1">
//                   <Filter className="w-4 h-4 text-gray-400 shrink-0" />
//                   {CATEGORIES.map((cat) => (
//                     <button key={cat} onClick={() => setWishlistCategory(cat)}
//                       className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition
//                         ${wishlistCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
//                       {cat}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {loading ? <FullPageSpinner /> : filteredWishlist.length === 0 ? (
//                 <EmptyState icon={Heart}
//                   title={wishlistItems.length === 0 ? 'No items in wishlist' : 'No items match your filter'}
//                   description={wishlistItems.length === 0
//                     ? 'Click the heart icon on any product to save it here'
//                     : `No items in "${wishlistCategory}" — try All or another category`}
//                   action={<Link to="/products" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Browse Products</Link>}
//                 />
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                   {filteredWishlist.map((product) => (
//                     <Link key={product._id} to={`/products/${product._id}`}
//                       className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition group">
//                       <div className="aspect-square overflow-hidden bg-gray-50">
//                         <img src={product.images?.[0]?.url||'https://placehold.co/200x200?text=?'} alt={product.name}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//                       </div>
//                       <div className="p-3">
//                         {product.category && (
//                           <p className="text-xs text-indigo-500 font-semibold mb-0.5">{product.category}</p>
//                         )}
//                         <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
//                         <p className="text-base font-bold text-indigo-600 mt-1">
//                           ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toLocaleString()}
//                         </p>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* PROFILE TAB */}
//           {tab === 'profile' && (
//             <div className="bg-white border border-gray-100 rounded-2xl p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-5">Edit Profile</h2>
//               <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                   <input value={profileData.name} onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
//                     className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input value={user?.email} disabled
//                     className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
//                   <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input value={profileData.phone} onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
//                     placeholder="+91 98765 43210"
//                     className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
//                   Save Changes
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* SECURITY TAB */}
//           {tab === 'security' && (
//             <div className="bg-white border border-gray-100 rounded-2xl p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
//               <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
//                 {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([field,label]) => (
//                   <div key={field}>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                     <input type="password" value={passwordData[field]}
//                       onChange={(e) => setPasswordData((p) => ({ ...p, [field]: e.target.value }))}
//                       className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                   </div>
//                 ))}
//                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
//                   Update Password
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* RETURNS TAB */}
//           {tab === 'returns' && <MyReturns />}

//           {/* ADDRESSES TAB */}
//           {tab === 'addresses' && <AddressesTab user={user} />}
//         </div>
//       </div>
//     </div>
//   );
// }

// function AddressesTab({ user }) {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });

//   const handleAdd = async (e) => {
//     e.preventDefault();
//     try {
//       await authAPI.addAddress(form);
//       toast.success('Address added!');
//       setShowForm(false);
//       setForm({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });
//     } catch { toast.error('Failed to add address'); }
//   };

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
//         <button onClick={() => setShowForm(!showForm)}
//           className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
//           + Add Address
//         </button>
//       </div>
//       {showForm && (
//         <form onSubmit={handleAdd} className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
//               <select value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
//                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
//                 <option>Home</option><option>Work</option><option>Other</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
//               <input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
//                 placeholder="400001" maxLength={6}
//                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//             </div>
//           </div>
//           <input value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
//             placeholder="Street address" required
//             className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           <div className="grid grid-cols-2 gap-3">
//             <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
//               placeholder="City" required
//               className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//             <input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
//               placeholder="State" required
//               className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//           </div>
//           <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
//             <input type="checkbox" checked={form.isDefault}
//               onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
//               className="rounded text-indigo-600" />
//             Set as default address
//           </label>
//           <div className="flex gap-3">
//             <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Save</button>
//             <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
//           </div>
//         </form>
//       )}
//       <div className="space-y-3">
//         {user?.addresses?.length > 0 ? user.addresses.map((addr, i) => (
//           <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{addr.label}</span>
//               {addr.isDefault && <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
//             </div>
//             <p className="text-sm text-gray-700">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
//           </div>
//         )) : (
//           <EmptyState icon={MapPin} title="No addresses saved" description="Add your delivery addresses here" />
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Heart, User, MapPin, Lock, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
import MyReturns from './MyReturns';
import { orderAPI, authAPI } from '../../api/services';
import { updateProfile, fetchProfile, selectWishlistCount } from '../../store/slices/authSlice';
import { OrderStatusBadge, FullPageSpinner, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'orders',    label: 'My Orders', icon: Package },
  { id: 'wishlist',  label: 'Wishlist',  icon: Heart },
  { id: 'returns',   label: 'Returns',   icon: RefreshCw },
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security',  label: 'Security',  icon: Lock },
];

const ORDER_STATUSES = ['all','placed','confirmed','processing','shipped','delivered','cancelled'];
const CATEGORIES = ['All','Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Toys','Automotive','Food & Grocery','Health','Jewellery','Other'];

export default function Account() {
  const { tab = 'orders' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  // Read wishlist directly from Redux state (populated objects after fetchProfile)
  const reduxWishlist = useSelector((s) => s.auth.wishlist || []);
  const wishlistCount = useSelector(selectWishlistCount);

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(false);

  const [orderSearch,       setOrderSearch]       = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [wishlistCategory,  setWishlistCategory]  = useState('All');
  const [wishlistSearch,    setWishlistSearch]    = useState('');

  const [profileData,  setProfileData]  = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (tab === 'orders') {
      setLoading(true);
      orderAPI.getMyOrders()
        .then((r) => setOrders(r.data.orders))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (tab === 'wishlist') {
      // fetchProfile returns wishlist populated with category, price, images etc
      setLoading(true);
      dispatch(fetchProfile()).finally(() => setLoading(false));
    }
  }, [tab, dispatch]);

  // Only use populated wishlist objects (filter out plain string IDs)
  const wishlistItems = reduxWishlist.filter((item) => typeof item === 'object' && item !== null && item._id);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchSearch = orderSearch === '' ||
      o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.items?.some((i) => i.name?.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Filtered wishlist — now category works because we have full product objects
  const filteredWishlist = wishlistItems.filter((p) => {
    const matchCategory = wishlistCategory === 'All' || p.category === wishlistCategory;
    const matchSearch   = wishlistSearch === '' || p.name?.toLowerCase().includes(wishlistSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileData));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    try {
      await authAPI.updatePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success('Password updated!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => navigate(`/account/${id}`)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-0.5
                    ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />{label}
                    {id === 'wishlist' && wishlistCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="md:col-span-3">

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search by order ID or product name..." value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  {ORDER_STATUSES.map((s) => (
                    <button key={s} onClick={() => setOrderStatusFilter(s)}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-full capitalize font-medium transition
                        ${orderStatusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? <FullPageSpinner /> : filteredOrders.length === 0 ? (
                <EmptyState icon={Package}
                  title={orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
                  description={orders.length === 0 ? 'Place your first order and it will appear here' : 'Try a different filter'}
                  action={orders.length === 0
                    ? <Link to="/products" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Start Shopping</Link>
                    : <button onClick={() => { setOrderStatusFilter('all'); setOrderSearch(''); }} className="text-sm text-indigo-600 hover:underline">Clear filters</button>
                  }
                />
              ) : (filteredOrders || []).filter(o => o && o._id).map((order) => (
                <Link key={order._id} to={`/account/orders/${order._id}`}
                  className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.items?.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={order.orderStatus} />
                      <p className="text-base font-bold text-gray-900 mt-1">₹{order.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(order.items || []).slice(0,3).filter(i => i).map((item,i) => (
                      <img key={i} src={item.image||'https://placehold.co/48x48?text=?'} alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
                    ))}
                    {order.items?.length > 3 && <span className="text-xs text-gray-400">+{order.items.length-3} more</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* WISHLIST TAB */}
          {tab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  My Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({wishlistCount} items)</span>
                  )}
                </h2>
              </div>

              {/* Filters */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search wishlist..." value={wishlistSearch}
                    onChange={(e) => setWishlistSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setWishlistCategory(cat)}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition
                        ${wishlistCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? <FullPageSpinner /> : filteredWishlist.length === 0 ? (
                <EmptyState icon={Heart}
                  title={wishlistItems.length === 0 ? 'No items in wishlist' : 'No items match your filter'}
                  description={wishlistItems.length === 0
                    ? 'Click the heart icon on any product to save it here'
                    : `No items in "${wishlistCategory}" — try All or another category`}
                  action={<Link to="/products" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Browse Products</Link>}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(filteredWishlist || []).filter(p => p && p._id).map((product) => (
                    <Link key={product._id} to={`/products/${product._id}`}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition group">
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img src={product.images?.[0]?.url||'https://placehold.co/200x200?text=?'} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3">
                        {product.category && (
                          <p className="text-xs text-indigo-500 font-semibold mb-0.5">{product.category}</p>
                        )}
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                        <p className="text-base font-bold text-indigo-600 mt-1">
                          ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input value={profileData.name} onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={user?.email} disabled
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={profileData.phone} onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {tab === 'security' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([field,label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="password" value={passwordData[field]}
                      onChange={(e) => setPasswordData((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* RETURNS TAB */}
          {tab === 'returns' && <MyReturns />}

          {/* ADDRESSES TAB */}
          {tab === 'addresses' && <AddressesTab user={user} />}
        </div>
      </div>
    </div>
  );
}

function AddressesTab({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAPI.addAddress(form);
      toast.success('Address added!');
      setShowForm(false);
      setForm({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });
    } catch { toast.error('Failed to add address'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
          + Add Address
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                placeholder="400001" maxLength={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <input value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
            placeholder="Street address" required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="City" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="State" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.isDefault}
              onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
              className="rounded text-indigo-600" />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {user?.addresses?.length > 0 ? (user.addresses || []).filter(a => a).map((addr, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{addr.label}</span>
              {addr.isDefault && <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
            </div>
            <p className="text-sm text-gray-700">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
          </div>
        )) : (
          <EmptyState icon={MapPin} title="No addresses saved" description="Add your delivery addresses here" />
        )}
      </div>
    </div>
  );
}