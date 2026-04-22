import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartTotal, selectCartCount } from '../store/slices/cartSlice';
import { EmptyState } from '../components/common';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const shipping = total > 999 ? 0 : 49;
  const tax = Math.round(total * 0.18);
  const grandTotal = total + shipping + tax;

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Start shopping!"
        action={<Link to="/products" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium">Browse Products</Link>}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart <span className="text-gray-400 font-normal text-lg">({count} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const price = item.discountPrice > 0 ? item.discountPrice : item.price;
            return (
              <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <Link to={`/products/${item._id}`}>
                  <img
                    src={item.images?.[0]?.url || 'https://placehold.co/80x80?text=?'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item._id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-indigo-600 transition">{item.name}</h3>
                  </Link>
                  {item.vendor?.shopName && <p className="text-xs text-indigo-500 mt-0.5">{item.vendor.shopName}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1">
                      <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">₹{(price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => dispatch(removeFromCart(item._id))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add ₹{(999 - total).toLocaleString()} more for free shipping</p>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-indigo-600 mt-3 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
