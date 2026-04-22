import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Package, AlertCircle, CheckCircle2, Clock, RefreshCw, RotateCcw, Repeat } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FullPageSpinner } from '../../components/common';

const RETURN_REASONS = [
  { value: 'defective_damaged',      label: '🔧 Product is defective or damaged' },
  { value: 'wrong_item_received',    label: '📦 Wrong item received' },
  { value: 'not_as_described',       label: '🔍 Product not as described' },
  { value: 'missing_parts',          label: '🧩 Parts or accessories missing' },
  { value: 'size_fit_issue',         label: "👕 Wrong size or doesn't fit" },
  { value: 'changed_mind',           label: '💭 Changed my mind' },
  { value: 'better_price_elsewhere', label: '💰 Found better price elsewhere' },
  { value: 'arrived_late',           label: '⏰ Arrived too late' },
  { value: 'other',                  label: '❓ Other reason' },
];

const RETURN_TYPES = [
  {
    value: 'refund',
    icon:  RefreshCw,
    label: 'Refund',
    desc:  'Get your money back to original payment method within 5-7 business days',
    color: 'border-green-500 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  {
    value: 'replacement',
    icon:  RotateCcw,
    label: 'Replacement',
    desc:  'Receive the same product again — free of charge',
    color: 'border-blue-500 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'exchange',
    icon:  Repeat,
    label: 'Exchange',
    desc:  'Swap for a different size, color or variant of the same product',
    color: 'border-purple-500 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
];

export default function ReturnRequest() {
  // Route is: /account/orders/:orderId/return
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useSelector((s) => s.auth);

  const [order,       setOrder]       = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [submitted,   setSubmitted]   = useState(null); // the created return

  const [form, setForm] = useState({
    reason:     '',
    reasonText: '',
    returnType: 'refund',
    items:      [],
  });

  useEffect(() => {
    if (!orderId || orderId === 'undefined') {
      toast.error('Invalid order. Please go back to your orders.');
      navigate('/account/orders');
      return;
    }

    const fetchData = async () => {
      try {
        const [orderRes, eligRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/returns/eligibility/${orderId}`),
        ]);
        const o = orderRes.data.order;
        setOrder(o);
        setEligibility(eligRes.data);
        setForm((p) => ({
          ...p,
          items: o.items.map((i) => ({
            productId: i.product?._id || i.product,
            quantity:  i.quantity,
            selected:  true,
          })),
        }));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load order details');
        navigate('/account/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId, navigate]);

  const toggleItem = (idx) =>
    setForm((p) => ({
      ...p,
      items: p.items.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason)  { toast.error('Please select a reason for return'); return; }
    const selected = form.items.filter((i) => i.selected);
    if (selected.length === 0) { toast.error('Select at least one item to return'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/returns', {
        orderId,
        reason:     form.reason,
        reasonText: form.reasonText,
        returnType: form.returnType,
        items:      selected.map(({ productId, quantity }) => ({ productId, quantity })),
      });
      setSubmitted(res.data.returnRequest);
      setSuccess(true);
      toast.success('Return request submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Calculate estimated refund ──
  const estimatedRefund = (() => {
    if (!order) return 0;
    const selected = form.items.filter((i) => i.selected);
    let amount = 0;
    for (const si of selected) {
      const oi = order.items.find((i) => (i.product?._id || i.product).toString() === si.productId.toString());
      if (oi) amount += oi.price * si.quantity;
    }
    const ratio     = order.itemsPrice > 0 ? amount / order.itemsPrice : 0;
    const taxRefund = Math.round((order.taxPrice || 0) * ratio);
    const shipRef   = selected.length === order.items.length ? (order.shippingPrice || 0) : 0;
    return amount + taxRefund + shipRef;
  })();

  if (loading) return <FullPageSpinner />;

  // ── Success screen ──
  if (success) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Request Submitted!</h1>
      <p className="text-gray-500 mb-1">Our team reviews within <strong>24-48 hours</strong>.</p>
      <p className="text-gray-500 mb-6">A confirmation has been sent to <strong>{user?.email}</strong>.</p>

      {/* Return type badge */}
      <div className="inline-flex items-center gap-2 mb-8 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-full text-sm">
        {form.returnType === 'refund'       && <><RefreshCw className="w-4 h-4" /> Refund of ₹{estimatedRefund.toLocaleString('en-IN')} requested</>}
        {form.returnType === 'replacement'  && <><RotateCcw className="w-4 h-4" /> Replacement requested</>}
        {form.returnType === 'exchange'     && <><Repeat className="w-4 h-4" /> Exchange requested</>}
      </div>

      {/* What happens next */}
      <div className="bg-indigo-50 rounded-2xl p-5 mb-8 text-left space-y-3">
        <p className="text-sm font-bold text-indigo-900">What happens next:</p>
        {[
          ['1', 'Admin reviews your request (24-48 hrs)'],
          ['2', 'Pickup scheduled at your delivery address'],
          ['3', form.returnType === 'refund' ? 'Refund credited in 5-7 business days' : form.returnType === 'replacement' ? 'Replacement dispatched after item pickup' : 'Exchange processed after item receipt'],
        ].map(([step, text]) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
            <p className="text-sm text-gray-700">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/account/returns" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm">
          Track Return →
        </Link>
        <Link to="/account/orders" className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
          My Orders
        </Link>
      </div>
    </div>
  );

  // ── Not eligible screen ──
  if (eligibility && !eligibility.eligible) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-10 h-10 text-amber-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        {eligibility.existingReturn ? 'Return Already Requested' : 'Not Eligible for Return'}
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{eligibility.reason}</p>
      {eligibility.existingReturn ? (
        <Link to="/account/returns" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm inline-block">
          Track Existing Return →
        </Link>
      ) : (
        <Link to="/account/orders" className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm inline-block">
          Back to Orders
        </Link>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <Link to={`/account/orders/${orderId}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Order
      </Link>

      <h1 className="text-2xl font-black text-gray-900 mb-1">Request a Return</h1>
      {eligibility && (
        <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          Order #{orderId?.slice(-8).toUpperCase()}
          <span className="ml-2 text-green-600 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {eligibility.daysLeft} day{eligibility.daysLeft !== 1 ? 's' : ''} left in return window
          </span>
        </p>
      )}

      {/* Policy banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900 mb-0.5">ShopWave 7-Day Return Policy</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Returns accepted within 7 days of delivery. Choose refund, replacement or exchange below.
            Refunds are credited to your original payment within 5-7 business days after inspection.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── STEP 1: What do you want? ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-1">What would you like? *</h2>
          <p className="text-xs text-gray-400 mb-4">Choose how you'd like us to resolve this for you</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RETURN_TYPES.map(({ value, icon: Icon, label, desc, color, badge }) => (
              <label key={value}
                className={`flex flex-col gap-2 p-4 border-2 rounded-2xl cursor-pointer transition
                  ${form.returnType === value ? color + ' border-2' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                <input type="radio" name="returnType" value={value}
                  checked={form.returnType === value}
                  onChange={(e) => setForm((p) => ({ ...p, returnType: e.target.value }))}
                  className="hidden" />
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-900 text-sm">{label}</span>
                  {form.returnType === value && (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge}`}>Selected</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* ── STEP 2: Select items ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> Select Items *
          </h2>
          <p className="text-xs text-gray-400 mb-4">Choose which items to include in your return</p>
          <div className="space-y-3">
            {order?.items.map((item, idx) => {
              const fItem = form.items[idx];
              return (
                <label key={idx}
                  className={`flex items-center gap-4 p-3 border-2 rounded-xl cursor-pointer transition
                    ${fItem?.selected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="checkbox"
                    checked={fItem?.selected || false}
                    onChange={() => toggleItem(idx)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                  <img src={item.image || 'https://placehold.co/48x48?text=?'} alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: Reason ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">Reason for Return *</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RETURN_REASONS.map((r) => (
              <label key={r.value}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition text-sm
                  ${form.reason === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-gray-100 text-gray-700 hover:border-gray-200'}`}>
                <input type="radio" name="reason" value={r.value}
                  checked={form.reason === r.value}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                  className="text-indigo-600 shrink-0" />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* ── STEP 4: Details ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-1">
            Additional Details <span className="text-gray-400 font-normal text-sm">(optional)</span>
          </h2>
          <textarea
            value={form.reasonText}
            onChange={(e) => setForm((p) => ({ ...p, reasonText: e.target.value }))}
            rows={3}
            placeholder="Describe the issue in more detail to help us process your request faster..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mt-2"
          />
        </div>

        {/* ── Summary ── */}
        <div className={`rounded-2xl p-5 border ${form.returnType === 'refund' ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}>
          <h2 className="font-bold text-gray-900 mb-3">
            {form.returnType === 'refund' ? '💰 Estimated Refund' : form.returnType === 'replacement' ? '🔄 Replacement Summary' : '🔃 Exchange Summary'}
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items selected</span>
              <span>{form.items.filter((i) => i.selected).length} of {order?.items.length}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Resolution</span>
              <span className="font-semibold capitalize">{form.returnType}</span>
            </div>
            {form.returnType === 'refund' && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Refund method</span>
                  <span>Original Payment</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Processing time</span>
                  <span>5-7 business days</span>
                </div>
                <div className="border-t border-green-200 pt-2 mt-2 flex justify-between font-black text-gray-900 text-lg">
                  <span>Total Refund</span>
                  <span className="text-green-700">₹{estimatedRefund.toLocaleString()}</span>
                </div>
              </>
            )}
            {form.returnType !== 'refund' && (
              <p className="text-xs text-indigo-600 font-medium pt-1">
                {form.returnType === 'replacement' ? 'A new unit will be dispatched after we receive your item.' : 'Our team will contact you to arrange the exchange.'}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button type="submit"
          disabled={submitting || form.items.filter((i) => i.selected).length === 0 || !form.reason}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-base">
          {submitting
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            : <><RefreshCw className="w-5 h-5" /> Submit Return Request</>
          }
        </button>

        <p className="text-center text-xs text-gray-400">
          By submitting, you agree to our return policy. A pickup will be scheduled at your delivery address.
        </p>
      </form>
    </div>
  );
}