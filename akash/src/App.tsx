import { useState } from 'react';
import { StoreProvider } from './lib/store';
import { Announcement, Drawer, Nav, PolicyModal, Preloader, QuickView, SearchOverlay, Toasts } from './components/Chrome';
import { OrderModal } from './components/OrderModal';
import { Hero } from './components/Hero';
import { Arrivals, Collections, Marquee, Signatures } from './components/Sections1';
import { Bridal, Edits, Showcase, Story, Trends } from './components/Sections2';
import { Campaign, Footer, Info, Latest, Newsletter, Offers } from './components/Sections3';

export default function App() {
  const [ready, setReady] = useState(false);
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
