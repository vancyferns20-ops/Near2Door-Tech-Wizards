import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const BrandMark = ({ size = 'md' }) => {
  const sizes = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';
  return (
    <span className={`flex ${sizes} items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#3b82f6_55%,#a3e635)] font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)]`}>
      N2D
    </span>
  );
};

const Avatar = ({ name, imageUrl }) => {
  const initials = useMemo(() => {
    const parts = (name || 'User').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
  }, [name]);

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-sm font-black text-white">
      {imageUrl ? (
        <img src={imageUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

const Header = ({ onNavigate, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, shopProfile } = useAuth();
  const role = user?.role || 'guest';

  const publicLinks = [
    { name: 'Home', path: 'landing' },
    { name: 'About', path: 'about' },
    { name: 'How It Works', path: 'how-it-works' },
  ];

  const privateLinks = (userRole) => {
    switch (userRole) {
      case 'shop':
        return [{ name: 'Dashboard', path: 'shop-dashboard' }];
      case 'customer':
        return [
          { name: 'Dashboard', path: 'customer-dashboard' },
          { name: 'Browse Shops', path: 'browse-shops' },
          { name: 'Cart', path: 'cart' },
        ];
      case 'admin':
        return [{ name: 'Admin Dashboard', path: 'admin-dashboard' }];
      case 'agent':
        return [{ name: 'Agent Dashboard', path: 'agent-dashboard' }];
      default:
        return [];
    }
  };

  const links = user ? [...publicLinks, ...privateLinks(role)] : publicLinks;

  const handleLinkClick = (path) => {
    onNavigate(path);
    setIsMenuOpen(false);
  };

  const profile = useMemo(() => {
    if (user?.role === 'shop') {
      return {
        name: shopProfile?.name || user?.name || 'Shop',
        imageUrl: shopProfile?.profileImage || null,
      };
    }

    return {
      name: user?.name || user?.email || 'Guest',
      imageUrl: null,
    };
  }, [shopProfile?.name, shopProfile?.profileImage, user?.email, user?.name, user?.role]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 text-white shadow-[0_16px_40px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-3 text-left">
          <BrandMark />
          <span className="hidden sm:block leading-tight">
            <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-slate-400">Hyperlocal Speed</span>
            <span className="block text-lg font-black tracking-tight text-white">Near2Door</span>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => handleLinkClick(link.path)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-white"
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-white/5 px-3 py-2">
                <Avatar name={profile.name} imageUrl={profile.imageUrl} />
                <div className="leading-tight">
                  <div className="max-w-40 truncate text-sm font-semibold text-white">{profile.name}</div>
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-400">{user.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleLinkClick('signin')}
                className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => handleLinkClick('signup')}
                className="rounded-full bg-[linear-gradient(135deg,#3b82f6,#a3e635)] px-4 py-2 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(59,130,246,0.2)] transition hover:brightness-110"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              onClick={onLogout}
              className="rounded-full border border-slate-700 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleLinkClick('signin')}
              className="rounded-full border border-slate-700 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-full border border-slate-700 bg-white/5 p-2 text-white"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-5 pt-4 lg:hidden">
          {user ? (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-white/5 px-4 py-3">
              <Avatar name={profile.name} imageUrl={profile.imageUrl} />
              <div>
                <div className="text-sm font-semibold text-white">{profile.name}</div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">{user.role}</div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className="rounded-2xl border border-slate-800 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {link.name}
              </button>
            ))}
          </div>

          {!user ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLinkClick('signin')}
                className="rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => handleLinkClick('signup')}
                className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#a3e635)] px-4 py-3 text-sm font-black text-slate-950"
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};

export default Header;
