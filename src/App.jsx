import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { ShopCatalog } from './components/ShopCatalog';
import { OrderTracker } from './components/OrderTracker';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { UserAuthModal } from './components/UserAuthModal';
import { Footer } from './components/Footer';

const MainAppContent = () => {
  const { activeTab, setActiveTab } = useStore();

  React.useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || path === '/admin/' || hash === '#admin') {
      setActiveTab('admin');
    }
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#171717] flex flex-col justify-between selection:bg-[#c99632] selection:text-white">
      <div>
        {activeTab !== 'admin' && <Header />}

        <main>
          {activeTab === 'home' && (
            <>
              <HeroSection />
              <CategoryGrid />
              <ShopCatalog />
            </>
          )}

          {activeTab === 'shop' && <ShopCatalog />}

          {activeTab === 'track' && <OrderTracker />}

          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <OrderConfirmationModal />
      <UserAuthModal />

      {activeTab !== 'admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
