import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import SearchBar from '../../components/UI/SearchBar';

const BrowseShops = ({ onNavigate, onAddToCart }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftQuery, setDraftQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [sortBy, setSortBy] = useState('best'); // 'best' | 'nearest' | 'cheapest'
  const [addedMap, setAddedMap] = useState({});
  const [qtyMap, setQtyMap] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocation(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const query = activeQuery.trim();
    if (!query) {
      setProductResults([]);
      setProductsError(null);
      setProductsLoading(false);
      return;
    }

    let cancelled = false;
    const runSearch = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const results = await api.searchProducts(query, {
          lat: location?.lat,
          lng: location?.lng,
          radius: radiusMeters,
        });
        if (!cancelled) {
          setProductResults(Array.isArray(results) ? results : []);
        }
      } catch (searchError) {
        if (!cancelled) {
          setProductsError('Failed to search products nearby.');
          setProductResults([]);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    const timer = setTimeout(runSearch, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeQuery, location, radiusMeters]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const data = await api.getShops();
        if (Array.isArray(data)) {
          setShops(data);
        } else {
          setError('Unexpected API response format.');
          console.error('API response is not an array:', data);
        }
      } catch (e) {
        setError('Failed to fetch shops. Please try again later.');
        console.error('Error fetching shops:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 text-white min-h-[calc(100vh-140px)] flex items-center justify-center py-16">
        <div className="p-10 bg-slate-800 rounded-3xl shadow-lg text-center">
          <p className="text-gray-300 text-lg animate-pulse">Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 text-white min-h-[calc(100vh-140px)] flex items-center justify-center py-16">
        <div className="p-10 bg-slate-800 rounded-3xl shadow-lg text-center text-red-400 font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-[calc(100vh-140px)] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-lime-400 drop-shadow-lg leading-tight mb-2">
            Explore Nearby Shops
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Search local stores and find products from the shops near you.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar
            value={draftQuery}
            onChange={setDraftQuery}
            onClear={() => {
              setDraftQuery('');
              setActiveQuery('');
              setProductResults([]);
            }}
            onSubmit={(value) => setActiveQuery(value)}
            placeholder="Search products across nearby shops"
            submitLabel="Search products"
          />
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300">
          <span className="font-semibold text-gray-400">Nearby filter:</span>
          {[
            { label: '1 km', value: 1000 },
            { label: '5 km', value: 5000 },
            { label: '10 km', value: 10000 },
            { label: 'All', value: null },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setRadiusMeters(option.value)}
              className={`rounded-full px-4 py-2 font-semibold transition ${radiusMeters === option.value
                ? 'bg-lime-400 text-slate-900'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
            >
              {option.label}
            </button>
          ))}
          <span className="text-xs text-gray-500">
            {location ? 'Using your current location for nearest results' : 'Location unavailable; showing general results'}
          </span>
        </div>

        {activeQuery ? (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-white">Product results</h3>
                <p className="text-gray-400 text-sm">
                  {productsLoading
                    ? 'Searching nearby products...'
                    : `${productResults.length} result${productResults.length === 1 ? '' : 's'} for “${activeQuery}”`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 mr-2">Sort:</span>
                <div className="rounded-full bg-slate-800 p-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSortBy('best')}
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${sortBy === 'best' ? 'bg-lime-400 text-slate-900' : 'text-gray-300 hover:bg-slate-700'}`}
                  >
                    Best
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('nearest')}
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${sortBy === 'nearest' ? 'bg-lime-400 text-slate-900' : 'text-gray-300 hover:bg-slate-700'}`}
                  >
                    Nearest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('cheapest')}
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${sortBy === 'cheapest' ? 'bg-lime-400 text-slate-900' : 'text-gray-300 hover:bg-slate-700'}`}
                  >
                    Cheapest
                  </button>
                </div>
              </div>
            </div>

            {productsError ? (
              <div className="rounded-3xl border border-red-500/30 bg-slate-800 p-6 text-red-300">
                {productsError}
              </div>
            ) : null}

            {!productsError && !productsLoading && productResults.length === 0 ? (
              <div className="rounded-3xl border border-slate-700 bg-slate-800 p-8 text-center text-gray-400">
                No products matched that search. Try a wider radius or a different keyword.
              </div>
            ) : null}

            {productResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {(() => {
                  const items = Array.isArray(productResults) ? [...productResults] : [];
                  if (sortBy === 'nearest') {
                    items.sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));
                  } else if (sortBy === 'cheapest') {
                    items.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
                  }
                  return items.map((product) => (
                    <div
                      key={product.id}
                      className="group rounded-3xl border border-slate-700 bg-slate-800 p-4 text-left shadow-xl transition hover:-translate-y-1 hover:border-lime-400"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-lime-400/15 px-3 py-1 text-xs font-bold text-lime-300">
                          {product.available ? 'Available' : 'Low stock'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {product.distanceMeters != null ? `${Math.round(product.distanceMeters)} m away` : 'Distance unavailable'}
                        </span>
                      </div>

                      <div className="mb-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-slate-700">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">No Image</span>
                        )}
                      </div>

                      <h4 className="text-xl font-bold text-white group-hover:text-lime-400">{product.name}</h4>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-400">{product.description || 'No description available.'}</p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-300">{product.shopName}</p>
                          <p className="text-sm text-gray-500">₹ {product.price}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={qtyMap[product.id] ?? 1}
                              onChange={(e) => setQtyMap((q) => ({ ...q, [product.id]: Math.max(1, parseInt(e.target.value || '1')) }))}
                              className="w-16 text-center rounded-lg bg-slate-900 border border-slate-700 text-white p-1"
                              aria-label="Quantity"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const qty = qtyMap[product.id] ?? 1;
                                  if (onAddToCart) onAddToCart({ ...product, quantity: qty });
                                  setAddedMap((m) => ({ ...m, [product.id]: true }));
                                  setTimeout(() => setAddedMap((m) => ({ ...m, [product.id]: false })), 2500);
                                } catch (e) {
                                  console.error('Add to cart failed', e);
                                }
                              }}
                              className="bg-lime-600 text-slate-900 font-bold px-4 py-2 rounded-full text-sm hover:bg-lime-500"
                            >
                              {addedMap[product.id] ? 'Added' : 'Add to Cart'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onNavigate('shop-products', { shopId: product.shopId, productId: product.id })}
                            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-gray-100"
                          >
                            View shop
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Shops Grid */}
        {!activeQuery ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => onNavigate('shop-products', { shopId: shop.id })}
                className="group bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl border border-slate-700 hover:border-lime-400 p-6 sm:p-8 text-left transform transition-all duration-300 hover:-translate-y-1"
              >
                {/* Shop image or placeholder */}
                <div className="w-full h-40 sm:h-48 rounded-2xl bg-slate-700 flex items-center justify-center mb-4 overflow-hidden">
                  {shop.profileImage ? (
                    <img
                      src={shop.profileImage}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-lime-400">
                  {shop.name}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base line-clamp-2">
                  {shop.type || 'No description available.'}
                </p>

                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin mr-1"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400">
                    {shop.location || 'Location not specified'}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 bg-slate-800 rounded-3xl shadow-lg text-center col-span-full">
              <p className="text-gray-400 text-lg font-medium">
                We couldn't find any shops right now. Please check back later!
              </p>
            </div>
          )}
        </div>
        ) : null}
      </div>
    </div>
  );
};

export default BrowseShops;
