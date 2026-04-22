import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

import Layout           from './components/layout/Layout';
import ProtectedRoute   from './components/common/ProtectedRoute';

import Home             from './pages/Home';
import Products         from './pages/Products';
import ProductDetail    from './pages/ProductDetail';
import Cart             from './pages/Cart';
import Checkout         from './pages/Checkout';

import { Login, Register } from './pages/auth/Auth';

import Account          from './pages/customer/Account';
import OrderDetail      from './pages/customer/OrderDetail';
import ReturnRequest    from './pages/customer/ReturnRequest';

import VendorDashboard  from './pages/vendor/VendorDashboard';
import VendorRegister   from './pages/vendor/VendorRegister';

import AdminDashboard   from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          <Route element={<Layout />}>

            {/* Public */}
            <Route path="/"          element={<Home />} />
            <Route path="/products"  element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart"      element={<Cart />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/vendor/register" element={<VendorRegister />} />

            {/* Customer — authenticated */}
            <Route element={<ProtectedRoute roles={['customer', 'vendor', 'admin']} />}>
              <Route path="/checkout" element={<Checkout />} />

              {/*
                IMPORTANT: specific paths before dynamic :tab
                ReturnRequest uses :orderId (not :id) — must match useParams in that component
              */}
              <Route path="/account/orders/:orderId/return" element={<ReturnRequest />} />
              <Route path="/account/orders/:id"             element={<OrderDetail />} />

              {/*
                All account sub-pages use a single :tab param so useParams()
                correctly returns the tab name (wishlist, profile, security, etc.)
              */}
              <Route path="/account/:tab" element={<Account />} />
              <Route path="/account"      element={<Navigate to="/account/orders" replace />} />
            </Route>

            {/* Vendor */}
            <Route element={<ProtectedRoute roles={['vendor', 'admin']} />}>
              <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="/vendor/:tab" element={<VendorDashboard />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/:tab" element={<AdminDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <p className="text-9xl font-black text-gray-100 select-none">404</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 -mt-4">Page Not Found</h1>
                <p className="text-gray-500 mb-8">This page doesn't exist or has been moved.</p>
                <a href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition font-semibold text-sm">
                  Back to Home
                </a>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}