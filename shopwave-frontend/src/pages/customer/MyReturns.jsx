import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Clock, CheckCircle2, XCircle, Package, ArrowRight, IndianRupee } from 'lucide-react';
import api from '../../api/axios';
import { FullPageSpinner } from '../../components/common';

const STATUS_CONFIG = {
  requested:        { label: 'Under Review',     color: 'bg-yellow-100 text-yellow-700',  icon: Clock,         desc: 'Our team is reviewing your request. You will hear back in 24-48 hours.' },
  approved:         { label: 'Approved',          color: 'bg-blue-100 text-blue-700',      icon: CheckCircle2,  desc: 'Your return is approved. Pickup will be arranged shortly.' },
  rejected:         { label: 'Not Approved',      color: 'bg-red-100 text-red-600',        icon: XCircle,       desc: 'Your return request was not approved.' },
  pickup_scheduled: { label: 'Pickup Scheduled',  color: 'bg-purple-100 text-purple-700',  icon: RefreshCw,     desc: 'A pickup agent will collect your item.' },
  item_received:    { label: 'Item Received',     color: 'bg-indigo-100 text-indigo-700',  icon: Package,       desc: 'We have received your item and are inspecting it.' },
  refund_initiated: { label: 'Refund Processing', color: 'bg-cyan-100 text-cyan-700',      icon: IndianRupee,   desc: 'Refund is being processed. Credit in 5-7 business days.' },
  refunded:         { label: 'Refunded ✓',          color: 'bg-green-100 text-green-700',    icon: CheckCircle2,  desc: 'Money has been credited to your original payment method.' },
  replacement_sent: { label: 'Replacement Sent 🔄',  color: 'bg-blue-100 text-blue-700',      icon: RefreshCw,     desc: 'Your replacement item has been dispatched. No refund issued.' },
};

const REASON_LABELS = {
  defective_damaged:       'Product Defective/Damaged',
  wrong_item_received:     'Wrong Item Received',
  not_as_described:        'Not As Described',
  missing_parts:           'Missing Parts',
  size_fit_issue:          'Size/Fit Issue',
  changed_mind:            'Changed Mind',
  better_price_elsewhere:  'Better Price Elsewhere',
  arrived_late:            'Arrived Late',
  other:                   'Other',
};

// Steps differ by returnType
const REFUND_STEPS = [
  { key: 'requested',        label: 'Requested' },
  { key: 'approved',         label: 'Approved' },
  { key: 'pickup_scheduled', label: 'Pickup' },
  { key: 'item_received',    label: 'Received' },
  { key: 'refunded',         label: 'Refunded ✓' },
];

const REPLACEMENT_STEPS = [
  { key: 'requested',        label: 'Requested' },
  { key: 'approved',         label: 'Approved' },
  { key: 'pickup_scheduled', label: 'Pickup' },
  { key: 'item_received',    label: 'Inspected' },
  { key: 'replacement_sent', label: 'Dispatched 🚀' },
];

const EXCHANGE_STEPS = [
  { key: 'requested',        label: 'Requested' },
  { key: 'approved',         label: 'Approved' },
  { key: 'pickup_scheduled', label: 'Pickup' },
  { key: 'item_received',    label: 'Received' },
  { key: 'replacement_sent', label: 'Exchanged ✓' },
];

const getSteps = (returnType) => {
  if (returnType === 'replacement') return REPLACEMENT_STEPS;
  if (returnType === 'exchange')    return EXCHANGE_STEPS;
  return REFUND_STEPS;
};

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/returns/my-returns')
      .then((r) => setReturns(r.data.returns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  if (returns.length === 0) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <RefreshCw className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Returns Yet</h2>
      <p className="text-gray-500 mb-6 max-w-xs mx-auto">You haven't requested any returns. Returns can be requested within 7 days of delivery.</p>
      <Link to="/account/orders" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm inline-block">
        View My Orders
      </Link>
    </div>
  );

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-black text-gray-900">My Returns</h2>

      {returns.map((ret) => {
        const config    = STATUS_CONFIG[ret.status] || STATUS_CONFIG.requested;
        const StatusIcon = config.icon;
        const steps     = getSteps(ret.returnType);
        const stepIdx   = steps.findIndex((s) => s.key === ret.status);

        return (
          <div key={ret._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-mono font-bold mb-1">
                  Return #{ret._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${config.color}`}>
                <StatusIcon className="w-3.5 h-3.5" /> {config.label}
              </span>
            </div>

            {/* Progress tracker */}
            {ret.status !== 'rejected' && (
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center">
                  {steps.map((step, i) => (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                          ${i <= stepIdx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {i < stepIdx ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium ${i <= stepIdx ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIdx ? 'bg-indigo-500' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ret.status === 'rejected' && (
              <div className="mx-5 my-3 bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-red-700">Return Rejected</p>
                <p className="text-xs text-red-600 mt-0.5">{ret.rejectionReason}</p>
              </div>
            )}

            {/* Items */}
            <div className="px-5 py-3 space-y-2 border-t border-gray-50">
              {ret.items.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image || 'https://placehold.co/40x40?text=?'} alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              {ret.items.length > 2 && (
                <p className="text-xs text-gray-400">+{ret.items.length - 2} more item(s)</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Reason: {REASON_LABELS[ret.reason] || ret.reason}</p>
                {ret.returnType && (
                  <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${ret.returnType === 'refund' ? 'bg-green-100 text-green-700' :
                      ret.returnType === 'replacement' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'}`}>
                    {ret.returnType === 'refund' ? '💰 Refund Requested' : ret.returnType === 'replacement' ? '🔄 Replacement Requested' : '🔃 Exchange Requested'}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{config.desc}</p>
                <div className="flex items-center gap-1 mt-1">
                  {ret.returnType === 'refund' || !ret.returnType ? (
                    <>
                      <span className="text-xs text-gray-500">Refund:</span>
                      <span className={`text-sm font-black ${ret.status === 'refunded' ? 'text-green-600' : 'text-gray-900'}`}>
                        ₹{ret.refundAmount?.toLocaleString()}
                      </span>
                      {ret.status === 'refunded' && <span className="text-xs text-green-600 font-semibold">✓ Credited</span>}
                      {ret.status === 'refund_initiated' && <span className="text-xs text-cyan-600 font-semibold">• Processing</span>}
                    </>
                  ) : ret.returnType === 'replacement' ? (
                    <span className="text-xs text-blue-600 font-semibold">
                      {ret.status === 'replacement_sent' ? '🔄 Replacement dispatched' : '🔄 Replacement in progress — no refund'}
                    </span>
                  ) : (
                    <span className="text-xs text-purple-600 font-semibold">
                      🔃 Exchange in progress — our team will contact you
                    </span>
                  )}
                </div>
              </div>
              <Link to={`/account/returns/${ret._id}`}
                className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}