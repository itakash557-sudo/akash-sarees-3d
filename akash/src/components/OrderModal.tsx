import { useEffect, useState, useId } from 'react';
import { site } from '../config/site';
import { Product } from '../data/catalog';
import { PALETTES } from '../lib/art';
import { inr } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconCheck, IconClose, IconDownload, IconLeft, IconPhone, IconWhatsApp } from './icons';

function useEsc(active: boolean, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fn(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, fn]);
}

function useLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

function buildDefaultMessage(p: Product, color?: string, size?: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHttp = origin.startsWith('http');
  const productUrl = isHttp ? `${origin}${pathname}#saree-${p.id}` : `https://akashsarees.com/#saree-${p.id}`;

  return `Hello Akash Sarees Shop!

I am interested in purchasing this saree.

Saree Name: ${p.name}
Price: ${inr(p.price)}
Product ID: ${p.id}${color ? `\nSelected Color: ${color}` : ''}${size ? `\nBlouse Size: ${size}` : ''}
Product Link: ${productUrl}

I would like to know more details about this saree.

Please share the availability, delivery details, and payment options.

Thank you!`;
}

export function OrderModal() {
  const { orderItem, closeOrder, setOrderStep } = useStore();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const msgInputId = useId();

  const p = orderItem?.product;
  const step = orderItem?.step || 'method';
  const selectedColor = orderItem?.color || (p ? PALETTES[p.palette]?.name || p.palette : '');
  const selectedSize = orderItem?.size || 'M';
  const sareeImage = orderItem?.image || p?.image || '';

  // Synchronize initial pre-filled message whenever a new product/color is opened
  useEffect(() => {
    if (p) {
      setMessage(buildDefaultMessage(p, selectedColor, selectedSize));
      setSent(false);
      setLastWaUrl('');
      setDownloaded(false);
    }
  }, [p?.id, selectedColor, selectedSize]);

  useEsc(!!orderItem, closeOrder);
  useLock(!!orderItem);

  if (!orderItem || !p) return null;

  const rawPhone = site.whatsappNumber || site.contact.whatsapp || '+91 82206 23649';
  const cleanNumber = rawPhone.replace(/\D/g, '');

  const handleDownloadPhoto = async () => {
    if (!sareeImage || downloading) return;
    setDownloading(true);
    try {
      const safeTitle = (p?.name || 'akash-saree').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `${safeTitle}-${p?.id || 'saree'}`;

      if (sareeImage.startsWith('data:image/svg+xml')) {
        // Render SVG to clean high-res canvas PNG for phone photo gallery
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 900;
            canvas.height = 1200;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${filename}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(url), 2000);
                  setDownloaded(true);
                  setDownloading(false);
                  setTimeout(() => setDownloaded(false), 4000);
                }
              }, 'image/png');
            }
          } catch {
            const a = document.createElement('a');
            a.href = sareeImage;
            a.download = `${filename}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setDownloaded(true);
            setDownloading(false);
            setTimeout(() => setDownloaded(false), 4000);
          }
        };
        img.onerror = () => setDownloading(false);
        img.src = sareeImage;
        return;
      }

      // Normal image file (jpg, webp, png)
      const resp = await fetch(sareeImage);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = sareeImage.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDownloaded(true);
      setDownloading(false);
      setTimeout(() => setDownloaded(false), 4000);
    } catch {
      const safeTitle = (p?.name || 'akash-saree').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const a = document.createElement('a');
      a.href = sareeImage;
      a.download = `${safeTitle}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setDownloading(false);
      setTimeout(() => setDownloaded(false), 4000);
    }
  };

  const handleContinueWhatsApp = () => {
    const encoded = encodeURIComponent(message.trim());
    const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;
    setLastWaUrl(waUrl);
    setSent(true);

    // Open WhatsApp in a new tab (desktop WhatsApp Web or mobile WhatsApp app)
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = waUrl;
    }
  };

  const resetMessage = () => {
    setMessage(buildDefaultMessage(p, selectedColor, selectedSize));
  };

  return (
    <div
      className="modal-wrap open order-modal-wrap"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeOrder();
      }}
    >
      <div
        className={`modal order-modal ${step === 'whatsapp' ? 'wa-view' : 'method-view'}`}
        role="dialog"
        aria-modal="true"
        aria-label={step === 'whatsapp' ? `WhatsApp Order for ${p.name}` : `Order options for ${p.name}`}
      >
        <button className="x order-close-btn" onClick={closeOrder} aria-label="Close modal">
          <IconClose />
        </button>

        {/* ================= STEP 1: ORDER METHOD SELECTION ================= */}
        {step === 'method' && (
          <div className="order-step-content method-step">
            <header className="order-modal-header">
              <span className="order-badge-pill">Akash Sarees Concierge</span>
              <h3 className="order-modal-title">Select Order Method</h3>
              <p className="order-modal-sub">
                Choose your preferred way to order or enquire about this handcrafted saree.
              </p>
            </header>

            {/* Selected Saree Mini Preview */}
            <div className="order-product-card">
              <img src={sareeImage} alt={p.name} className="order-product-thumb" />
              <div className="order-product-details">
                <div className="order-sku-tag">Product ID: {p.id}</div>
                <h4 className="order-product-name">{p.name}</h4>
                <p className="order-product-fabric">{p.fabric}</p>
                <div className="order-product-meta-row">
                  <span className="order-product-price">{inr(p.price)}</span>
                  {p.mrp && p.mrp > p.price && <s className="order-product-mrp">{inr(p.mrp)}</s>}
                  {selectedColor && <span className="order-color-pill">Color: {selectedColor}</span>}
                </div>
                <button
                  type="button"
                  className={`btn-download-saree-photo mini ${downloaded ? 'done' : ''}`}
                  onClick={handleDownloadPhoto}
                  disabled={downloading}
                  aria-label="Save or download saree photo"
                >
                  {downloaded ? <IconCheck size={13} /> : <IconDownload size={13} />}
                  <span>{downloading ? 'Saving…' : downloaded ? 'Photo Saved!' : 'Save / Download Photo'}</span>
                </button>
              </div>
            </div>

            {/* Method Options */}
            <div className="order-options-list" role="group" aria-label="Order methods">
              {/* Option: WhatsApp Order */}
              <button
                type="button"
                className="order-method-card wa-primary-card"
                onClick={() => setOrderStep('whatsapp')}
                aria-label="Order via WhatsApp"
              >
                <div className="order-method-icon wa-icon-bubble">
                  <IconWhatsApp size={28} />
                </div>
                <div className="order-method-body">
                  <div className="order-method-head-row">
                    <span className="order-method-name">WhatsApp Order</span>
                    <span className="order-chip-badge">Instant &amp; Popular</span>
                  </div>
                  <p className="order-method-desc">
                    Connect directly with our showroom team on WhatsApp. Receive high-res photos, video drapes, availability, and instant assistance.
                  </p>
                  <span className="order-method-highlight">
                    Fast response · 10:00 AM – 9:00 PM IST
                  </span>
                </div>
                <div className="order-method-arrow">
                  <IconArrow size={18} />
                </div>
              </button>

              {/* Option: Call Showroom */}
              {site.contact.phone && (
                <a
                  href={`tel:${site.contact.phone.replace(/\s+/g, '')}`}
                  className="order-method-card phone-secondary-card"
                  aria-label={`Call Showroom at ${site.contact.phone}`}
                >
                  <div className="order-method-icon phone-icon-bubble">
                    <IconPhone size={24} />
                  </div>
                  <div className="order-method-body">
                    <div className="order-method-head-row">
                      <span className="order-method-name">Call Showroom</span>
                      <span className="order-chip-badge muted">Direct Call</span>
                    </div>
                    <p className="order-method-desc">
                      Speak directly with our saree master craftsmen at {site.contact.phone}.
                    </p>
                  </div>
                  <div className="order-method-arrow">
                    <IconArrow size={18} />
                  </div>
                </a>
              )}
            </div>

            <footer className="order-modal-trust-footer">
              <span>✓ 100% Authentic Handloom</span>
              <span>✓ Pure Zari Certified</span>
              <span>✓ Safe Showroom Communication</span>
            </footer>
          </div>
        )}

        {/* ================= STEP 2: WHATSAPP ORDER FLOW ================= */}
        {step === 'whatsapp' && (
          <div className="order-step-content wa-step">
            {/* WhatsApp Styled Brand Header */}
            <div className="wa-brand-header">
              <button
                type="button"
                className="wa-back-btn"
                onClick={() => setOrderStep('method')}
                aria-label="Back to order options"
              >
                <IconLeft size={18} />
                <span>Back</span>
              </button>
              <div className="wa-avatar-box">
                <div className="wa-avatar-circle">
                  <span>{site.wordmark.slice(0, 1)}</span>
                  <span className="wa-online-dot" aria-label="Online status" />
                </div>
                <div className="wa-avatar-text">
                  <div className="wa-shop-name-row">
                    <h4>{site.name}</h4>
                    <span className="wa-verified-badge" title="Verified Showroom">✓</span>
                  </div>
                  <p className="wa-shop-status">WhatsApp Saree Order Desk · Typically replies in minutes</p>
                </div>
              </div>
            </div>

            <div className="wa-scroll-body">
              {/* Selected Saree Details Card */}
              <div className="wa-saree-summary">
                <div className="wa-summary-eyebrow">Selected Saree Details</div>
                <div className="wa-saree-card">
                  <div className="wa-saree-media">
                    <img src={sareeImage} alt={p.name} />
                  </div>
                  <div className="wa-saree-info">
                    <div className="wa-sku-row">
                      <span className="wa-sku-badge">SKU: {p.id}</span>
                      <span className="wa-stock-badge">{p.stock > 0 ? 'In Stock' : 'Pre-order enquiry'}</span>
                    </div>
                    <h3 className="wa-saree-title">{p.name}</h3>
                    <p className="wa-saree-fabric">{p.fabric} · Handcrafted</p>
                    <div className="wa-saree-pricing">
                      <span className="wa-current-price">{inr(p.price)}</span>
                      {p.mrp && p.mrp > p.price && <s className="wa-mrp">{inr(p.mrp)}</s>}
                    </div>
                    <div className="wa-saree-specs-chips">
                      {selectedColor && <span className="wa-spec-pill">Color: <b>{selectedColor}</b></span>}
                      {selectedSize && <span className="wa-spec-pill">Blouse: <b>{selectedSize}</b></span>}
                    </div>
                    <div className="wa-photo-download-bar">
                      <button
                        type="button"
                        className={`btn-download-saree-photo ${downloaded ? 'done' : ''}`}
                        onClick={handleDownloadPhoto}
                        disabled={downloading}
                        title="Save saree image to your device to attach in WhatsApp"
                        aria-label="Save or download saree photo"
                      >
                        {downloaded ? <IconCheck size={15} /> : <IconDownload size={15} />}
                        <span>{downloading ? 'Saving photo…' : downloaded ? 'Saree Photo Saved!' : 'Save / Download Saree Photo'}</span>
                      </button>
                      <span className="wa-photo-tip-text">
                        {downloaded ? '✓ Photo saved to your gallery! You can attach it in WhatsApp.' : 'Tap to save this photo to your phone/PC to attach in WhatsApp.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Message Box */}
              <div className="wa-message-box-container">
                <div className="wa-message-box-header">
                  <label htmlFor={msgInputId} className="wa-message-label">
                    <span>Customer Message Box (Editable)</span>
                    <small>You can edit this message before sending to WhatsApp</small>
                  </label>
                  <button
                    type="button"
                    className="wa-reset-btn"
                    onClick={resetMessage}
                    title="Restore default order enquiry message"
                  >
                    Reset Message
                  </button>
                </div>

                <div className="wa-textarea-wrapper">
                  <textarea
                    id={msgInputId}
                    className="wa-message-textarea"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message to Akash Sarees Shop..."
                    aria-label="Editable message for WhatsApp order"
                  />
                  <div className="wa-textarea-footer">
                    <span className="wa-hint-text">
                      Includes product name, price, product ID, and product link.
                    </span>
                    <span className="wa-char-count">{message.length} chars</span>
                  </div>
                </div>
              </div>

              {/* Status banner when user already clicked Continue to WhatsApp */}
              {sent && (
                <div className="wa-sent-feedback" role="alert">
                  <div className="wa-feedback-icon"><IconCheck size={18} /></div>
                  <div className="wa-feedback-body">
                    <strong>WhatsApp Chat Initiated!</strong>
                    <p>
                      If WhatsApp did not open automatically,{' '}
                      <a href={lastWaUrl} target="_blank" rel="noopener noreferrer">
                        click here to open WhatsApp directly
                      </a>.
                    </p>
                    <small className="wa-feedback-note">
                      Note: This sends your saree purchase enquiry to our showroom team. We will verify stock, share photos/videos, and guide you with payment and delivery.
                    </small>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="wa-actions-wrapper">
                <button
                  type="button"
                  className="btn-continue-whatsapp"
                  onClick={handleContinueWhatsApp}
                  aria-label="Continue to WhatsApp to place order enquiry"
                >
                  <IconWhatsApp size={22} className="wa-btn-icon" />
                  <span>Continue to WhatsApp</span>
                </button>

                <p className="wa-disclaimer-note">
                  No login required · Opens official WhatsApp click-to-chat ({rawPhone}) · Safe &amp; direct enquiry
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
