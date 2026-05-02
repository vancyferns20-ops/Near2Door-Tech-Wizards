import React from 'react';

const Landing = ({ onNavigate }) => {
  const quickCategories = [
    'Fresh Produce',
    'Builder Tools',
    'Daily Staples',
    'Hardware Picks',
    'Dairy Express',
    'Paint & Fix',
    'Snacks Now',
    'Plumbing Kits',
  ];

  const produceItems = [
    { emoji: '🥭', title: 'Mango Burst', note: 'Sweet, sun-ripened, ready now', tone: 'from-amber-400 to-orange-500' },
    { emoji: '🍅', title: 'Tomato Pop', note: 'Vibrant vine-fresh energy', tone: 'from-rose-500 to-red-500' },
    { emoji: '🥦', title: 'Green Crunch', note: 'Crisp, bright, nutrient-packed', tone: 'from-lime-400 to-emerald-500' },
    { emoji: '🫐', title: 'Berry Rush', note: 'Cold, juicy, and colorful', tone: 'from-sky-400 to-blue-600' },
  ];

  const toolItems = [
    { icon: '🔨', title: 'Hammer', detail: 'Heavy-duty fixes' },
    { icon: '📏', title: 'Tape', detail: 'Measure with precision' },
    { icon: '🪛', title: 'Driver', detail: 'Fast assembly' },
    { icon: '🧰', title: 'Kit', detail: 'Grab and go' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-300">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400" />
            Hyperlocal Speed for groceries and materials
          </div>

          <h1 className="mb-6 text-5xl font-black tracking-tight text-lime-400 sm:text-6xl lg:text-7xl" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            Groceries and tools.
            <br className="hidden sm:inline" />
            <span className="mt-2 block text-white">Delivered in 15 mins.</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-gray-300">
            Near2Door connects you with trusted local shops. No middlemen, no delays.
            Just your community's goods, delivered fast.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <button
              onClick={() => onNavigate('signup')}
              className="rounded-full bg-[linear-gradient(135deg,#3b82f6,#a3e635)] px-8 py-4 text-lg font-bold text-white shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition hover:-translate-y-1"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="rounded-full border-2 border-lime-400 bg-transparent px-8 py-4 text-lg font-bold text-lime-400 transition hover:-translate-y-1 hover:bg-lime-400/10"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-lime-400">Why Near2Door</div>
              <div className="space-y-4">
                {[
                  { title: '15-min delivery', desc: 'From your trusted local shops' },
                  { title: 'Community first', desc: 'Local shopkeepers and neighborhood agents' },
                  { title: 'Simple ordering', desc: 'Groceries and tools in one app' },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 border-lime-400 pl-4">
                    <h3 className="text-lg font-bold text-lime-300">{item.title}</h3>
                    <p className="mt-1 text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-lime-400">Quick Categories</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {quickCategories.map((category) => (
                  <button
                    key={category}
                    className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-lime-400 hover:text-slate-900"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-slate-700 bg-slate-800 p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-black text-lime-400">Fresh Produce</h3>
                <span className="rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {produceItems.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-700 p-4 text-center">
                    <div className="text-4xl">{item.emoji}</div>
                    <div className="mt-3 text-sm font-bold text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-700 bg-slate-800 p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-black text-sky-400">Hardware Tools</h3>
                <span className="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-bold text-sky-300">Electric Blue</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {toolItems.map((tool) => (
                  <div key={tool.title} className="rounded-2xl bg-slate-700 p-4 text-center">
                    <div className="text-4xl">{tool.icon}</div>
                    <div className="mt-3 text-sm font-bold text-white">{tool.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{tool.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="rounded-[2rem] border border-lime-400/20 bg-slate-800 p-8 text-center shadow-lg sm:p-12">
          <h2 className="text-4xl font-black text-lime-400 sm:text-5xl">Ready to join the movement?</h2>
          <p className="mt-4 text-lg text-gray-300">Support local. Order smart. Deliver together.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <button
              onClick={() => onNavigate('signup')}
              className="rounded-full bg-lime-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-2xl transition hover:-translate-y-1 hover:bg-lime-300"
            >
              Start Now
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="rounded-full border-2 border-lime-400 bg-transparent px-8 py-4 text-lg font-bold text-lime-400 transition hover:-translate-y-1 hover:bg-lime-400/10"
            >
              Our Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
