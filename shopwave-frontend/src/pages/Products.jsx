import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, fetchCategories, setFilters } from '../store/slices/productsSlice';
import ProductCard from '../components/common/ProductCard';
import { Pagination, FullPageSpinner, EmptyState } from '../components/common';
import { ShoppingBag } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, loading, total, pages, page, filters } = useSelector((s) => s.products);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({ minPrice: '', maxPrice: '' });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') || 1,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    };
    dispatch(setFilters(params));
    dispatch(fetchProducts(params));
  }, [searchParams, dispatch]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const applyPriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (localFilters.minPrice) p.set('minPrice', localFilters.minPrice); else p.delete('minPrice');
    if (localFilters.maxPrice) p.set('maxPrice', localFilters.maxPrice); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
    setShowFilters(false);
  };

  const clearAll = () => { setSearchParams({}); setLocalFilters({ minPrice: '', maxPrice: '' }); };

  const activeFilters = ['keyword', 'category', 'minPrice', 'maxPrice'].filter((k) => searchParams.get(k));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={searchParams.get('sort') || 'newest'}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeFilters.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchParams.get('keyword') && (
            <FilterChip label={`"${searchParams.get('keyword')}"`} onRemove={() => updateParam('keyword', '')} />
          )}
          {searchParams.get('category') && (
            <FilterChip label={searchParams.get('category')} onRemove={() => updateParam('category', '')} />
          )}
          {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
            <FilterChip
              label={`₹${searchParams.get('minPrice') || '0'} - ₹${searchParams.get('maxPrice') || '∞'}`}
              onRemove={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }}
            />
          )}
          <button onClick={clearAll} className="text-xs text-red-500 hover:underline px-2">Clear all</button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { updateParam('category', cat); setShowFilters(false); }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${searchParams.get('category') === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range (₹)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, minPrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button onClick={applyPriceFilter} className="mt-3 w-full text-sm bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition">
                Apply
              </button>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Min. Rating</h3>
              <div className="flex gap-2">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => { updateParam('rating', r); setShowFilters(false); }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${searchParams.get('rating') == r ? 'bg-amber-400 text-white border-amber-400' : 'border-gray-200 hover:border-amber-300'}`}
                  >
                    {r}★ & up
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <FullPageSpinner />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
          <Pagination page={page} pages={pages} onPageChange={(p) => updateParam('page', p)} />
        </>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No products found"
          description="Try adjusting your filters or search terms"
          action={<button onClick={clearAll} className="text-sm bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition">Clear Filters</button>}
        />
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  );
}
