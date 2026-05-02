import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Landing from './pages/Landing';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ShopDashboard from './pages/shop/ShopDashboard';
import ManageProducts from './pages/shop/ManageProducts';
import ManageOrders from './pages/shop/ManageOrders';
import ManageShopProfile from './pages/shop/ManageShopProfile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseShops from './pages/customer/BrowseShops';
import ShopProducts from './pages/customer/ShopProducts';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Cart from './pages/customer/Cart';

function App() {
  const [page, setPage] = useState('landing');
  const [pageProps, setPageProps] = useState({});
  const [cart, setCart] = useState([]); // <-- Cart state
  const { user, isAuthenticated, logout } = useAuth();

  const onNavigate = (path, props = {}) => {
    setPage(path);
    setPageProps(props);
  };
  // Normalize an incoming product/item into the cart format and merge duplicates
  const addToCart = (item) => {
    if (!item) return;
    const id = item.id || item._id || item.productId || null;
    if (!id) return;

    const shopId = item.shopId || item.shop_id || item.shop?.id || item.shop?._id || null;
    const cartItem = {
      id,
      name: item.name || item.title || 'Product',
      price: Number(item.price ?? item.cost ?? 0),
      quantity: Number(item.quantity ?? 1),
      images: item.images || item.photos || [],
      shop_id: shopId,
      shopName: item.shopName || item.shop?.name || item.vendorName || '',
    };

    setCart((prev) => {
      // If same product exists, increment quantity
      const existing = prev.find((p) => p.id === cartItem.id);
      if (existing) {
        return prev.map((p) => (p.id === cartItem.id ? { ...p, quantity: Number(p.quantity || 1) + Number(cartItem.quantity || 1) } : p));
      }

      return [...prev, cartItem];
    });
  };

  const renderPage = () => {
    const userRole = user ? user.role : 'guest';
    const protectedPages = [
      'shop-dashboard',
      'manage-products',
      'manage-orders',
      'manage-shop-profile',
      'customer-dashboard',
      'browse-shops',
      'shop-products',
      'agent-dashboard',
      'admin-dashboard',
      'cart'
    ];

    const isProtected = protectedPages.includes(page);

    if (isProtected && !isAuthenticated) {
      return <SignIn onNavigate={onNavigate} />;
    }

    const roleAccess = {
      shop: ['shop-dashboard', 'manage-products', 'manage-orders', 'manage-shop-profile'],
      customer: ['customer-dashboard', 'browse-shops', 'shop-products', 'cart'],
      agent: ['agent-dashboard'],
      admin: ['admin-dashboard'],
    };

    if (isProtected && !roleAccess[userRole]?.includes(page)) {
      if (userRole === 'shop') return <ShopDashboard onNavigate={onNavigate} />;
      if (userRole === 'customer') return <CustomerDashboard onNavigate={onNavigate} />;
      if (userRole === 'agent') return <DeliveryDashboard onNavigate={onNavigate} />;
      if (userRole === 'admin') return <AdminDashboard onNavigate={onNavigate} />;
      return <Landing onNavigate={onNavigate} />;
    }

    switch (page) {
      case 'landing': return <Landing onNavigate={onNavigate} />;
      case 'about': return <About />;
      case 'how-it-works': return <HowItWorks />;
      case 'signin': return <SignIn onNavigate={onNavigate} />;
      case 'signup': return <SignUp onNavigate={onNavigate} />;
      case 'shop-dashboard': return <ShopDashboard onNavigate={onNavigate} />;
      case 'manage-products': return <ManageProducts onNavigate={onNavigate} />;
      case 'manage-orders': return <ManageOrders onNavigate={onNavigate} />;
      case 'manage-shop-profile': return <ManageShopProfile onNavigate={onNavigate} />;
      case 'customer-dashboard': return <CustomerDashboard onNavigate={onNavigate} />;
      case 'browse-shops': return <BrowseShops onNavigate={onNavigate} onAddToCart={addToCart} />;
      case 'shop-products': return <ShopProducts onNavigate={onNavigate} shopId={pageProps.shopId} onAddToCart={addToCart} />;
      case 'agent-dashboard': return <DeliveryDashboard onNavigate={onNavigate} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={onNavigate} />;
      case 'cart': return <Cart cart={cart} onUpdateCart={setCart} onNavigate={onNavigate} />;
      default: return <Landing onNavigate={onNavigate} />;
    }
  };

  return (
    <>
      <style>{`
        body { font-family: 'Inter', 'Poppins', sans-serif; background: #0f172a; }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Header onNavigate={onNavigate} user={user} onLogout={logout} />
        <main className="flex-grow bg-slate-950">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;