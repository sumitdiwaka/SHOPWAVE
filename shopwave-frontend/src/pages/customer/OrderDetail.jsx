import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle2, Circle, Copy, Check, Star } from 'lucide-react';
import { orderAPI } from '../../api/services';
import { OrderStatusBadge, FullPageSpinner } from '../../components/common';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then((r) => setOrder(r.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id).then(() => {
      setCopied(true);
      toast.success('Order ID copied! Paste it in the review form.');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  if (loading) return <FullPageSpinner />;
  if (!order)  return (
    <div className="text-center py-20 text-gray-400">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Order not found</p>
      <Link to="/account/orders" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">Back to Orders</Link>
    </div>
  );

  const currentStepIdx = order.orderStatus === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.orderStatus);
  const isDelivered    = order.orderStatus === 'delivered';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/account/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Order Details</h1>

          {/* ── FULL ORDER ID WITH COPY ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Order ID:</span>
            <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-lg select-all">
              {order._id}
            </code>
            <button
              onClick={copyOrderId}
              title="Copy full Order ID (needed for writing a review)"
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition font-medium
                ${copied
                  ? 'bg-green-100 text-green-600'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy ID</>}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      {/* Delivered: Review + Return CTAs */}
      {isDelivered && (
        <div className="space-y-3 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Order Delivered!</p>
                <p className="text-xs text-amber-700">Copy Order ID above to write a product review.</p>
              </div>
            </div>
            <button onClick={copyOrderId}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${copied ? 'bg-green-600 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
              {copied ? '✓ Copied!' : 'Copy Order ID'}
            </button>
          </div>
          {!order.returnRequest && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">↩️</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Not satisfied? Return it!</p>
                  <p className="text-xs text-blue-700">7-day hassle-free returns. Refund in 5-7 business days.</p>
                </div>
              </div>
              <Link to={"/account/orders/" + order._id + "/return"}
                className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
                Request Return →
              </Link>
            </div>
          )}
          {order.returnRequest && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900">Return Request Active</p>
                  <p className="text-xs text-purple-700">Your return is being processed.</p>
                </div>
              </div>
              <Link to="/account/returns"
                className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition">
                Track Return →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Progress Tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i <= currentStepIdx ? 'bg-indigo-600' : 'bg-gray-100'}`}>
                    {i < currentStepIdx
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : i === currentStepIdx
                        ? <div className="w-3 h-3 bg-white rounded-full" />
                        : <Circle className="w-4 h-4 text-gray-300" />
                    }
                  </div>
                  <span className={`text-xs mt-1.5 capitalize font-medium
                    ${i <= currentStepIdx ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5
                    ${i < currentStepIdx ? 'bg-indigo-600' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.orderStatus === 'cancelled' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-center">
          <p className="text-red-600 font-semibold text-sm">This order was cancelled</p>
          {order.cancellationReason && (
            <p className="text-red-500 text-xs mt-1">Reason: {order.cancellationReason}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Order Items */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <Link to={`/products/${item.product?._id || item.product}`}>
                  <img
                    src={item.image || 'https://placehold.co/56x56?text=?'}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-50 hover:opacity-80 transition"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?._id || item.product}`}
                    className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  {isDelivered && (
                    <Link
                      to={`/products/${item.product?._id || item.product}`}
                      state={{ openReview: true }}
                      className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1 font-medium hover:underline"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Rate this product
                    </Link>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST</span><span>₹{order.taxPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className={`mt-3 text-center text-xs font-semibold px-2 py-1.5 rounded-lg
              ${order.paymentInfo?.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
              Payment: {order.paymentInfo?.status?.toUpperCase()}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> Deliver To
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.shippingAddress.street},<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}<br />
              <span className="font-medium">{order.shippingAddress.pincode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0
                  ${i === 0 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{h.status}</p>
                  <p className="text-xs text-gray-500">{h.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(h.updatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}