// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// Star Rating Display
export function StarRating({ rating, numReviews, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`${starSize} ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {numReviews !== undefined && (
        <span className="text-sm text-gray-500">{rating?.toFixed(1)} ({numReviews} reviews)</span>
      )}
    </div>
  );
}

// Badge
export function Badge({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

// Pagination
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Previous
      </button>
      {[...Array(pages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-9 h-9 text-sm rounded-xl transition ${page === i + 1 ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-gray-400" /></div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// Order Status Badge
export function OrderStatusBadge({ status }) {
  const map = {
    placed: ['yellow', 'Placed'],
    confirmed: ['blue', 'Confirmed'],
    processing: ['indigo', 'Processing'],
    shipped: ['blue', 'Shipped'],
    delivered: ['green', 'Delivered'],
    cancelled: ['red', 'Cancelled'],
    refunded: ['gray', 'Refunded'],
  };
  const [color, label] = map[status] || ['gray', status];
  return <Badge color={color}>{label}</Badge>;
}
