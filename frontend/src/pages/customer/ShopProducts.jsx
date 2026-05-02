import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Button from '../../components/UI/Button';
import SearchBar from '../../components/UI/SearchBar';

// ProductCard component
const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-gray-700">
      <div className="relative w-full h-36 bg-slate-700">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-base mb-1 text-white truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        <p className="text-sm font-bold text-lime-400 mb-3">₹ {product.price}</p>
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-lime-600 hover:bg-lime-500 text-white py-1.5 rounded-md font-medium text-sm transition"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

const ShopProducts = ({ onNavigate, shopId, onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return [product.name, product.description, product.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts(shopId);
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setError('Unexpected API response format.');
          console.error('API response is not an array:', data);
        }
      } catch (e) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [shopId]);

  const handleAdd = (product) => {
    if (onAddToCart) onAddToCart(product, shopId);

    setToastMessage(`✅ "${product.name}" added to cart`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-10 bg-gray-900 rounded-2xl shadow-2xl mt-8 text-center text-gray-300">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-gray-900 rounded-2xl shadow-2xl mt-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 rounded-2xl shadow-2xl mt-8 relative">
      <h2 className="text-3xl font-extrabold text-white mb-4">Products</h2>
      <p className="text-gray-400 mb-6">
        Browse the available products from your selected shop.
      </p>

      <div className="mb-6 max-w-xl">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search products in this shop"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => handleAdd(product)} 
            />
          ))
        ) : (
          <p className="text-gray-400 col-span-full">
            {searchQuery
              ? `No products matched “${searchQuery}”. Try another keyword.`
              : 'No products available at this time.'}
          </p>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-lime-600 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShopProducts;
