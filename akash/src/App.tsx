import { useState, useEffect } from 'react';
import { StoreProvider } from './lib/store';
import { Announcement, Drawer, Nav, PolicyModal, Preloader, QuickView, SearchOverlay, Toasts } from './components/Chrome';
import { OrderModal } from './components/OrderModal';
import { Hero } from './components/Hero';
import { Arrivals, Collections, Marquee, Signatures } from './components/Sections1';
import { Bridal, Edits, Showcase, Story, Trends } from './components/Sections2';
import { Campaign, Footer, Info, Latest, Newsletter, Offers } from './components/Sections3';
import { AdminDashboard } from './components/Admin';
import { getLiveProducts, getLiveSettings } from './lib/supabase';
import { setLiveProducts } from './data/catalog';
import { site } from './config/site';

export default function App() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    return (
      window.location.hash === '#admin' ||
      window.location.pathname.endsWith('/admin') ||
      new URLSearchParams(window.location.search).has('admin')
    );
  });

  // Listen for #admin URL changes
  useEffect(() => {
    const checkRoute = () => {
      setIsAdmin(
        window.location.hash === '#admin' ||
        window.location.pathname.endsWith('/admin') ||
        new URLSearchParams(window.location.search).has('admin')
      );
    };
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Fetch live Supabase products & settings on mount
  useEffect(() => {
    getLiveProducts().then((live) => {
      if (live && live.length > 0) {
        setLiveProducts(live);
      }
    });
    getLiveSettings().then((settings) => {
      if (settings['whatsapp_number']) {
        site.whatsappNumber = settings['whatsapp_number'];
        site.contact.whatsapp = settings['whatsapp_number'];
      }
      if (settings['announcement_1']) {
        site.announcement[0] = settings['announcement_1'];
      }
    });
  }, []);

  if (isAdmin) {
    return (
      <StoreProvider>
        <AdminDashboard
          onExit={() => {
            window.location.hash = '';
            setIsAdmin(false);
          }}
        />
      </StoreProvider>
    );
  }
  return (
    <StoreProvider>
      <a className="skip" href="#arrivals">Skip to products</a>
      <Preloader onDone={() => setReady(true)} />
      <Announcement />
      <Nav />
      <main className={ready ? 'is-ready' : ''}>
        <Hero ready={ready} />
        <Marquee />
        <Collections />
        <Signatures />
        <Arrivals />
        <Story />
        <Bridal />
        <Trends />
        <Showcase />
        <Edits />
        <Offers />
        <Campaign />
        <Latest />
        <Info />
        <Newsletter />
      </main>
      <Footer />
      <Drawer />
      <QuickView />
      <OrderModal />
      <SearchOverlay />
      <PolicyModal />
      <Toasts />
    </StoreProvider>
  );
}
