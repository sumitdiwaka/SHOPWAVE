import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
import { selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { orderAPI, paymentAPI } from '../api/services';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review Order', 'Payment'];

export default function Checkout() {
  const [step,            setStep]            = useState(0);
  const [loading,         setLoading]         = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user }  = useSelector((s) => s.auth);
  const subtotal  = useSelector(selectCartTotal);
  const shipping  = subtotal > 999 ? 0 : 49;
  const tax       = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      street:  user?.addresses?.find((a) => a.isDefault)?.street  || '',
      city:    user?.addresses?.find((a) => a.isDefault)?.city    || '',
      state:   user?.addresses?.find((a) => a.isDefault)?.state   || '',
      pincode: user?.addresses?.find((a) => a.isDefault)?.pincode || '',
    },
  });

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items, navigate]);

  // ── Step 0: Save address, move to review — NO order created yet ──
  const onAddressSubmit = (address) => {
    setShippingAddress(address);
    setStep(1);
  };

  // ── Step 2: Create order THEN open Razorpay ──
  const handleRazorpayPayment = async () => {
    if (!shippingAddress) {
      toast.error('Shipping address is missing. Please go back to step 1.');
      setStep(0);
      return;
    }

    setLoading(true);
    let createdOrderId = null;

    try {
      // 1. Create the ShopWave order
      const orderItems = items.map((i) => ({ product: i._id, quantity: i.quantity }));
      const orderRes   = await orderAPI.create({
        items:           orderItems,
        shippingAddress,
        paymentMethod:   'razorpay',
      });

      const createdOrder = orderRes?.data?.order;
      if (!createdOrder?._id) {
        throw new Error('Order creation failed — no order ID returned');
      }
      createdOrderId = createdOrder._id;

      // 2. Create Razorpay payment order
      const payRes = await paymentAPI.createOrder({
        amount:  grandTotal,
        orderId: createdOrderId,
      });
      const payData = payRes?.data;

      if (!payData?.razorpayOrderId) {
        throw new Error('Payment gateway error — could not create payment session');
      }

      // 3. Open Razorpay checkout
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key:         payData.keyId,
        amount:      payData.amount,
        currency:    payData.currency || 'INR',
        name:        'ShopWave',
        description: `Order #${createdOrderId.slice(-8).toUpperCase()}`,
        order_id:    payData.razorpayOrderId,

        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           createdOrderId,
            });
            dispatch(clearCart());
            toast.success('🎉 Payment successful! Order confirmed.');
            navigate('/account/orders/' + createdOrderId);
          } catch (verifyErr) {
            toast.error(verifyErr?.response?.data?.message || 'Payment verification failed. Contact support with Order ID: ' + createdOrderId);
          }
        },

        prefill: {
          name:    user?.name    || '',
          email:   user?.email   || '',
          contact: user?.phone   || '',
        },
        theme: { color: '#6366f1' },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment window closed. Your order was created — complete payment to confirm it.', { icon: 'ℹ️', duration: 5000 });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        toast.error('Payment failed: ' + (r?.error?.description || 'Unknown error'));
        setLoading(false);
      });
      rzp.open();
      setLoading(false);

    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
              ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center text-xs font-black">{i + 1}</span>}
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="md:col-span-2">

          {/* ── STEP 0: Address ── */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
              </div>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    {...register('street', { required: 'Street address is required' })}
                    placeholder="House no, Street name, Area..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      placeholder="Mumbai"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      placeholder="Maharashtra"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                  <input
                    {...register('pincode', { required: 'PIN code is required', pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit PIN code' } })}
                    placeholder="400001"
                    maxLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>

                <button type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition mt-2">
                  Continue to Review →
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 1: Review ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Order Items ({items.length})</h2>
                </div>
                <div className="space-y-3">
                  {items.map((item) => {
                    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                    return (
                      <div key={item._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <img src={item.images?.[0]?.url || 'https://placehold.co/56x56?text=?'}
                          alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">₹{(price * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery address summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Delivering to</p>
                    <p className="text-sm text-indigo-700">{shippingAddress?.street}, {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="ml-auto text-xs text-indigo-600 font-semibold hover:underline shrink-0">Edit</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button onClick={() => setStep(2)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition">
                  Proceed to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Payment</h2>
              </div>

              {/* Payment method */}
              <div className="border-2 border-indigo-500 bg-indigo-50 rounded-2xl p-4 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0">R</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Razorpay — Secure Payment</p>
                  <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto shrink-0" />
              </div>

              {/* Delivery info */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  {shipping === 0 ? 'Free delivery on this order!' : `Delivery charge: ₹${shipping}`} · Estimated 3-5 business days
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    : <>Pay ₹{grandTotal.toLocaleString()} →</>
                  }
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <span>🔒</span> Secured by Razorpay. Your card details are never stored.
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Order is created only when payment is successful.
              </p>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-black text-gray-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {shipping === 0 && (
              <div className="bg-green-50 rounded-xl p-2.5 text-xs text-green-700 font-medium text-center">
                🎉 You saved ₹49 on delivery!
              </div>
            )}

            {/* Mini cart preview */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-2">
                  <img src={item.images?.[0]?.url || 'https://placehold.co/32x32?text=?'}
                    alt={item.name} className="w-8 h-8 object-cover rounded-lg bg-gray-50 shrink-0" />
                  <p className="text-xs text-gray-600 line-clamp-1 flex-1">{item.name}</p>
                  <p className="text-xs font-semibold text-gray-900 shrink-0">×{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}