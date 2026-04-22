import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Search, Menu, X, Heart, User,
  Package, LogOut, ChevronDown, Store, LayoutDashboard
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { selectWishlistCount } from '../../store/slices/authSlice';
import NotificationBell from '../common/NotificationBell';

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userOpen,    setUserOpen]    = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector(selectWishlistCount);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?keyword=${searchQuery.trim()}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserOpen(false);
  };

  const dashboardLink = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'vendor'
      ? '/vendor'
      : '/account';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Shop<span className="text-indigo-600">Wave</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            <Link
              to="/products"
              className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
            >
              Products
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            {user && (
              <Link
                to="/account/wishlist"
                className="relative p-2 rounded-xl hover:bg-gray-100 transition hidden md:block"
              >
                <Heart className={`w-5 h-5 transition ${wishCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell — only for logged-in users */}
            {user && <NotificationBell userId={user._id} />}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      : <span className="text-xs font-bold text-indigo-600">{user.name?.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{user.role}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    </div>

                    <Link to={dashboardLink} onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>

                    <Link to="/account/orders" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>

                    <Link to="/account/wishlist" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <Heart className="w-4 h-4" /> Wishlist
                      {wishCount > 0 && (
                        <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold rounded-full px-1.5 py-0.5">
                          {wishCount}
                        </span>
                      )}
                    </Link>

                    <Link to="/account" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <User className="w-4 h-4" /> Profile
                    </Link>

                    <hr className="my-1 border-gray-100" />

                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition w-full">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                  Login
                </Link>
                <Link to="/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            <Link to="/products" onClick={() => setMenuOpen(false)}
              className="block px-2 py-2 text-sm text-gray-700 hover:text-indigo-600">
              All Products
            </Link>

            {user && (
              <Link to="/account/wishlist" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:text-indigo-600">
                <Heart className="w-4 h-4" />
                Wishlist
                {wishCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 rounded-full">{wishCount}</span>
                )}
              </Link>
            )}

            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-2 py-2 text-sm text-gray-700">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="block px-2 py-2 text-sm text-indigo-600 font-medium">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}