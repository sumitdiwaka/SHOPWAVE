import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, Store, Package, ShoppingBag, TrendingUp, IndianRupee,
  ChevronRight, CheckCircle2, XCircle, ToggleLeft, Star, Search, Filter, RefreshCw,
} from 'lucide-react';
import { adminAPI } from '../../api/services';
import api from '../../api/axios';
import { OrderStatusBadge, FullPageSpinner, Badge } from '../../components/common';
import toast from 'react-hot-toast';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'vendors', label: 'Vendor Approvals', icon: Store },
  { id: 'orders', label: 'All Orders', icon: ShoppingBag },
  { id: 'returns',  label: 'Returns / Refunds', icon: RefreshCw },
  { id: 'razorpay', label: 'Test Payment Info', icon: IndianRupee },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const { tab = 'dashboard' } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    let fetch;
    if (tab === 'dashboard') fetch = adminAPI.getDashboard().then((r) => setData(r.data.stats));
    else if (tab === 'users') fetch = adminAPI.getUsers().then((r) => setUsers(r.data.users));
    else if (tab === 'vendors') fetch = adminAPI.getPendingVendors().then((r) => setVendors(r.data.vendors));
    else if (tab === 'orders')  fetch = adminAPI.getAllOrders().then((r) => setOrders(r.data.orders));
    else if (tab === 'returns') fetch = api.get('/returns').then((r) => setReturns(r.data.returns || []));
    else fetch = Promise.resolve();

    fetch?.catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  // ── Filtered Users ──
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchSearch = userSearch === '' ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // ── Filtered Orders ──
  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter
  );

  const handleToggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers((u) => u.map((x) => x._id === id ? { ...x, isActive: !x.isActive } : x));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user'); }
  };

  const handleApproveVendor = async (id, approved) => {
    try {
      await adminAPI.approveVendor(id, approved);
      setVendors((v) => v.filter((x) => x._id !== id));
      toast.success(approved ? '✅ Vendor approved!' : '❌ Vendor rejected');
    } catch { toast.error('Failed to update vendor'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage your ShopWave platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* ── Sidebar ── */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <nav className="p-2">
              {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => navigate(`/admin/${id}`)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-0.5
                    ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="md:col-span-4">
          {loading && tab !== 'razorpay' ? <FullPageSpinner /> : (
            <>

              {/* ════ DASHBOARD TAB ════ */}
              {tab === 'dashboard' && data && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Customers', value: data.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
                      { label: 'Vendors', value: data.totalVendors, icon: Store, color: 'bg-purple-50 text-purple-600' },
                      { label: 'Products', value: data.totalProducts, icon: Package, color: 'bg-green-50 text-green-600' },
                      { label: 'Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-amber-50 text-amber-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.monthlySales?.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={data.monthlySales.map((m) => ({ month: MONTHS[m._id.month - 1], revenue: Math.round(m.revenue) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {data.ordersByStatus?.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={data.ordersByStatus.map((s) => ({ name: s._id, value: s.count }))}
                              cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                              {data.ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Legend iconType="circle" iconSize={8} />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {data.recentOrders?.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                      <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-50">
                              {['Order ID','Customer','Amount','Status','Date'].map((h) => (
                                <th key={h} className="text-left py-2 px-2 font-medium text-gray-500 text-xs">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.recentOrders.map((o) => (
                              <tr key={o._id} className="border-b border-gray-50 last:border-0">
                                <td className="py-2.5 px-2 font-mono text-xs text-gray-400">#{o._id.slice(-6).toUpperCase()}</td>
                                <td className="py-2.5 px-2 text-gray-700">{o.customer?.name}</td>
                                <td className="py-2.5 px-2 font-semibold text-gray-900">₹{o.totalPrice.toLocaleString()}</td>
                                <td className="py-2.5 px-2"><OrderStatusBadge status={o.orderStatus} /></td>
                                <td className="py-2.5 px-2 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════ USERS TAB ════ */}
              {tab === 'users' && (
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 mr-1">Filter by role:</span>
                      {['all', 'customer', 'vendor', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setUserRoleFilter(role)}
                          className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition
                            ${userRoleFilter === role
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {role}
                        </button>
                      ))}
                      <span className="ml-auto text-xs text-gray-400">{filteredUsers.length} user(s)</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-50 bg-gray-50">
                            {['Name','Email','Role','Joined','Status','Action'].map((h) => (
                              <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-xs">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No users found</td>
                            </tr>
                          ) : filteredUsers.map((u) => (
                            <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                                    {u.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-gray-900">{u.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{u.email}</td>
                              <td className="py-3 px-4 capitalize">
                                <Badge color={u.role === 'admin' ? 'indigo' : u.role === 'vendor' ? 'blue' : 'gray'}>
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-xs">
                                {new Date(u.createdAt).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-3 px-4">
                                <Badge color={u.isActive ? 'green' : 'red'}>
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleToggleUser(u._id)}
                                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition
                                      ${u.isActive
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                  >
                                    <ToggleLeft className="w-3 h-3" />
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ VENDOR APPROVALS TAB ════ */}
              {tab === 'vendors' && (
                <div className="space-y-4">
                  <h2 className="font-semibold text-gray-900">Pending Vendor Approvals ({vendors.length})</h2>
                  {vendors.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400">
                      <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No pending vendor approvals</p>
                      <p className="text-xs mt-1">All vendor applications have been reviewed</p>
                    </div>
                  ) : vendors.map((v) => (
                    <div key={v._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{v.shopName}</p>
                        <p className="text-sm text-indigo-500 font-medium">{v.category}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: <span className="font-medium">{v.user?.name}</span> · {v.user?.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Applied: {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {v.shopDescription && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{v.shopDescription}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveVendor(v._id, true)}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleApproveVendor(v._id, false)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm hover:bg-red-100 transition font-medium"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ════ ALL ORDERS TAB ════ */}
              {tab === 'orders' && (
                <div className="space-y-4">
                  {/* Status filter */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">Filter by status:</span>
                      {['all','placed','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setOrderStatusFilter(s)}
                          className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition
                            ${orderStatusFilter === s
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {s}
                        </button>
                      ))}
                      <span className="ml-auto text-xs text-gray-400">{filteredOrders.length} order(s)</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-50 bg-gray-50">
                            {['Order ID','Customer','Items','Total','Payment','Status','Date'].map((h) => (
                              <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-xs">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No orders found</td></tr>
                          ) : filteredOrders.map((o) => (
                            <tr key={o._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td className="py-3 px-4 font-mono text-xs text-gray-400">#{o._id.slice(-6).toUpperCase()}</td>
                              <td className="py-3 px-4 text-gray-700">{o.customer?.name}</td>
                              <td className="py-3 px-4 text-gray-500">{o.items?.length}</td>
                              <td className="py-3 px-4 font-semibold text-gray-900">₹{o.totalPrice.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <Badge color={o.paymentInfo?.status === 'paid' ? 'green' : 'yellow'}>
                                  {o.paymentInfo?.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4"><OrderStatusBadge status={o.orderStatus} /></td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ RETURNS TAB ════ */}
              {tab === 'returns' && (
                <AdminReturnsTab returns={returns} onUpdate={setReturns} />
              )}

                            {/* ════ RAZORPAY TEST INFO TAB ════ */}
              {tab === 'razorpay' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Razorpay Test Payment Info</h2>
                    <p className="text-sm text-gray-500 mb-6">Use these credentials to test payments. No real money is charged.</p>

                    {/* Test Cards */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                        Test Credit / Debit Cards
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              {['Card Type','Card Number','Expiry','CVV','OTP'].map((h) => (
                                <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { type: 'Visa (Success)', number: '4111 1111 1111 1111', expiry: '12/26', cvv: '123', otp: '1234' },
                              { type: 'Mastercard', number: '5267 3181 8797 5449', expiry: '12/26', cvv: '123', otp: '1234' },
                              { type: 'Visa (Failure)', number: '4000 0000 0000 0002', expiry: '12/26', cvv: '123', otp: '1234' },
                            ].map((card, i) => (
                              <tr key={i} className="border-t border-gray-50">
                                <td className="py-3 px-4">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.type.includes('Failure') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                    {card.type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-sm text-gray-800 tracking-wider">{card.number}</td>
                                <td className="py-3 px-4 font-mono text-gray-600">{card.expiry}</td>
                                <td className="py-3 px-4 font-mono text-gray-600">{card.cvv}</td>
                                <td className="py-3 px-4 font-mono text-gray-600">{card.otp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* UPI */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                        Test UPI IDs
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'success@razorpay', result: '✅ Payment Success' },
                          { id: 'failure@razorpay', result: '❌ Payment Failure' },
                        ].map(({ id, result }) => (
                          <div key={id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                            <code className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{id}</code>
                            <span className="text-xs text-gray-500">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Net Banking */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                        Test Net Banking
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                        <p>Select any bank in the Razorpay popup → use these credentials:</p>
                        <div className="mt-2 space-y-1 font-mono text-xs">
                          <p>User ID: <span className="text-indigo-600">success</span></p>
                          <p>Password: <span className="text-indigo-600">success</span></p>
                          <p>OTP: <span className="text-indigo-600">1234</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Test Phone number */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">4</span>
                        Test Phone Number (for OTP)
                      </h3>
                      <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                        <code className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">+91 9000000000</code>
                        <span className="text-xs text-gray-500">OTP: <strong>1234</strong></span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      <strong>Important:</strong> These are Razorpay TEST mode credentials only. Your backend <code>.env</code> must have <code>RAZORPAY_KEY_ID=rzp_test_...</code> (test key, not live key). No real money is ever charged in test mode.
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADMIN RETURNS TAB — full return/refund management
══════════════════════════════════════════════════════════ */
function AdminReturnsTab({ returns, onUpdate }) {
  const [statusFilter,    setStatusFilter]    = useState('all');
  const [actionLoading,   setActionLoading]   = useState(null);
  const [rejectId,        setRejectId]        = useState(null);
  const [rejectReason,    setRejectReason]    = useState('');
  const [expandedId,      setExpandedId]      = useState(null);

  const RETURN_STATUSES = ['all','requested','approved','rejected','pickup_scheduled','item_received','refund_initiated','refunded'];

  const STATUS_COLORS = {
    requested:        'bg-yellow-100 text-yellow-700',
    approved:         'bg-blue-100 text-blue-700',
    rejected:         'bg-red-100 text-red-600',
    pickup_scheduled: 'bg-purple-100 text-purple-700',
    item_received:    'bg-indigo-100 text-indigo-700',
    refund_initiated: 'bg-cyan-100 text-cyan-700',
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

  const filtered = statusFilter === 'all' ? returns : returns.filter((r) => r.status === statusFilter);

  const handleUpdateStatus = async (returnId, status) => {
    const labels = {
      pickup_scheduled: 'Mark pickup as scheduled?',
      item_received:    'Mark item as received at warehouse?',
      replacement_sent: 'Mark replacement as dispatched to customer?',
    };
    if (!window.confirm(labels[status] || `Update status to "${status}"?`)) return;
    setActionLoading(returnId + '_' + status);
    try {
      const res = await api.put(`/returns/${returnId}/status`, { status });
      onUpdate((prev) => prev.map((r) => r._id === returnId ? res.data.return : r));
      toast.success(res.data.message || 'Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setActionLoading(null); }
  };

  const handleApprove = async (returnId) => {
    const returnType = returns.find((r) => r._id === returnId)?.returnType || 'refund';
    const confirmMsg = returnType === 'replacement'
      ? 'Approve this replacement request? A new item will be dispatched. No refund will be issued.'
      : returnType === 'exchange'
        ? 'Approve this exchange request? Our team will contact the customer. No refund will be issued.'
        : 'Approve this return and initiate refund automatically?';
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(returnId + '_approve');
    try {
      const res = await api.put(`/returns/${returnId}/approve`, { adminNote: '' });
      onUpdate((prev) => prev.map((r) => r._id === returnId ? res.data.return : r));
      toast.success(res.data.message || 'Return approved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve return');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (returnId) => {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return; }
    setActionLoading(returnId + '_reject');
    try {
      const res = await api.put(`/returns/${returnId}/reject`, { rejectionReason: rejectReason });
      onUpdate((prev) => prev.map((r) => r._id === returnId ? res.data.return : r));
      toast.success('Return rejected');
      setRejectId(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject return');
    } finally { setActionLoading(null); }
  };

  // Summary counts
  const pendingCount  = returns.filter((r) => r.status === 'requested').length;
  const refundedTotal = returns.filter((r) => r.status === 'refunded').reduce((s, r) => s + (r.refundAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Returns',    value: returns.length,          color: 'bg-gray-50 text-gray-900'   },
          { label: 'Pending Review',   value: pendingCount,            color: 'bg-yellow-50 text-yellow-700', urgent: pendingCount > 0 },
          { label: 'Total Refunded',   value: `₹${refundedTotal.toLocaleString('en-IN')}`, color: 'bg-green-50 text-green-700' },
          { label: 'Refunded Orders',  value: returns.filter((r) => r.status === 'refunded').length, color: 'bg-indigo-50 text-indigo-700' },
        ].map(({ label, value, color, urgent }) => (
          <div key={label} className={`rounded-2xl p-4 border ${urgent ? 'border-yellow-200 animate-pulse' : 'border-gray-100'} ${color}`}>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          {RETURN_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition
                ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
              {s === 'requested' && pendingCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] px-1 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} request(s)</span>
        </div>
      </div>

      {/* Return List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400">
          <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No return requests found</p>
        </div>
      ) : filtered.map((ret) => (
        <div key={ret._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-50">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-xs font-mono font-bold text-gray-500">#{ret._id.slice(-8).toUpperCase()}</p>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[ret.status] || 'bg-gray-100 text-gray-600'}`}>
                  {ret.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{ret.customer?.name}</p>
              <p className="text-xs text-gray-500">{ret.customer?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gray-900">₹{ret.refundAmount?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 mt-0.5">Refund amount</p>
              <p className="text-xs text-indigo-500 mt-1 font-medium">{REASON_LABELS[ret.reason] || ret.reason}</p>
              {ret.returnType && (
                <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${ret.returnType === 'refund' ? 'bg-green-100 text-green-700' :
                    ret.returnType === 'replacement' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'}`}>
                  {ret.returnType === 'refund' ? '💰 Refund' : ret.returnType === 'replacement' ? '🔄 Replacement' : '🔃 Exchange'}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              {ret.items?.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 flex-1 min-w-0">
                  <img src={item.image || 'https://placehold.co/36x36?text=?'} alt={item.name}
                    className="w-9 h-9 object-cover rounded-lg shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">×{item.quantity} · ₹{item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {ret.reasonText && (
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-xl p-2 italic">
                "{ret.reasonText}"
              </p>
            )}
          </div>

          {/* Expandable details */}
          <button onClick={() => setExpandedId(expandedId === ret._id ? null : ret._id)}
            className="w-full text-xs text-gray-400 hover:text-indigo-600 py-1.5 border-t border-gray-50 transition font-medium">
            {expandedId === ret._id ? '▲ Hide History' : '▼ View Status History'}
          </button>

          {expandedId === ret._id && ret.statusHistory?.length > 0 && (
            <div className="px-4 pb-3 space-y-2 border-t border-gray-50 pt-3 bg-gray-50/50">
              {[...ret.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 capitalize">{h.status?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{h.message}</p>
                    <p className="text-[10px] text-gray-400">{new Date(h.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions — only for pending requests */}
          {ret.status === 'requested' && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              {rejectId === ret._id ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason (required)..."
                    rows={2}
                    className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-red-50"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(ret._id)}
                      disabled={actionLoading === ret._id + '_reject'}
                      className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-700 disabled:opacity-60 transition">
                      {actionLoading === ret._id + '_reject' ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                    <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                      className="px-4 border border-gray-200 text-xs rounded-xl hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(ret._id)}
                    disabled={actionLoading === ret._id + '_approve'}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60 transition">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {actionLoading === ret._id + '_approve'
                      ? 'Processing...'
                      : ret.returnType === 'replacement'
                        ? '🔄 Approve Replacement'
                        : ret.returnType === 'exchange'
                          ? '🔃 Approve Exchange'
                          : `💰 Approve & Refund ₹${ret.refundAmount?.toLocaleString('en-IN')}`
                    }
                  </button>
                  <button onClick={() => setRejectId(ret._id)}
                    className="px-4 flex items-center gap-1.5 border-2 border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50 transition">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Approving will automatically initiate a Razorpay refund to the customer's original payment method.
              </p>
            </div>
          )}

          {/* ── Replacement / Exchange workflow buttons (after approval) ── */}
          {(ret.returnType === 'replacement' || ret.returnType === 'exchange') &&
           ret.status !== 'requested' && ret.status !== 'rejected' && ret.status !== 'replacement_sent' && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              <p className="text-xs font-bold text-gray-600 mb-2">
                {ret.returnType === 'replacement' ? '🔄 Replacement Progress' : '🔃 Exchange Progress'} — Update Status:
              </p>
              <div className="flex flex-wrap gap-2">
                {ret.status === 'approved' && (
                  <button onClick={() => handleUpdateStatus(ret._id, 'pickup_scheduled')}
                    disabled={!!actionLoading}
                    className="text-xs bg-purple-600 text-white px-3 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-60 transition font-semibold">
                    {actionLoading === ret._id + '_pickup_scheduled' ? 'Updating...' : '📦 Schedule Pickup'}
                  </button>
                )}
                {ret.status === 'pickup_scheduled' && (
                  <button onClick={() => handleUpdateStatus(ret._id, 'item_received')}
                    disabled={!!actionLoading}
                    className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition font-semibold">
                    {actionLoading === ret._id + '_item_received' ? 'Updating...' : '✅ Mark Item Received'}
                  </button>
                )}
                {ret.status === 'item_received' && (
                  <button onClick={() => handleUpdateStatus(ret._id, 'replacement_sent')}
                    disabled={!!actionLoading}
                    className="text-xs bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60 transition font-semibold">
                    {actionLoading === ret._id + '_replacement_sent' ? 'Updating...' : '🚀 Mark Replacement Dispatched'}
                  </button>
                )}
              </div>
              {/* Mini status timeline */}
              <div className="flex items-center gap-1 mt-3">
                {['approved','pickup_scheduled','item_received','replacement_sent'].map((s, i, arr) => {
                  const currentIdx = arr.indexOf(ret.status);
                  const done = i <= currentIdx;
                  const labels = { approved: 'Approved', pickup_scheduled: 'Pickup', item_received: 'Received', replacement_sent: 'Dispatched' };
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {i < currentIdx ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] mt-0.5 font-medium ${done ? 'text-indigo-600' : 'text-gray-400'}`}>{labels[s]}</span>
                      </div>
                      {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-0.5 mb-3 ${i < currentIdx ? 'bg-indigo-400' : 'bg-gray-100'}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Refunded status */}
          {ret.status === 'refunded' && (
            <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-700">✅ Refund Completed</p>
                {ret.refundId && <p className="text-xs text-green-600 font-mono mt-0.5">ID: {ret.refundId}</p>}
              </div>
              <p className="text-lg font-black text-green-700">₹{ret.refundAmount?.toLocaleString('en-IN')}</p>
            </div>
          )}

          {/* Replacement sent status */}
          {ret.status === 'replacement_sent' && (
            <div className="mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700">🔄 Replacement Dispatched</p>
                <p className="text-xs text-blue-600 mt-0.5">New item sent to customer. No refund issued.</p>
              </div>
            </div>
          )}

          {/* Rejected status */}
          {ret.status === 'rejected' && (
            <div className="mx-4 mb-4 bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-bold text-red-700">Rejection Reason:</p>
              <p className="text-xs text-red-600 mt-0.5">{ret.rejectionReason}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}