export type HeroScene = { kind: 'shop' | 'photo' | 'cloth'; image?: string; video?: string; palette?: string; caption: string };

/**
 * ============================================================================
 * SHOP WHATSAPP NUMBER CONFIGURATION
 * ============================================================================
 * Enter your shop's official WhatsApp phone number below (including country code).
 * Examples:
 *   '+91 98765 43210' or '+919876543210' or '919876543210'
 *
 * This phone number is used for:
 * 1. The WhatsApp Saree Ordering System ("Order Now" -> "Continue to WhatsApp")
 * 2. Customer chat and order enquiries directly to your WhatsApp
 * 3. Support and contact links across the Akash Sarees website
 * ============================================================================
 */
export const SHOP_WHATSAPP_NUMBER = '+91 82206 23649';

export const site = {
  name: 'Akash Sarees Shop',
  wordmark: 'Akash',
  wordmarkSub: 'SAREES SHOP',
  tagline: 'Elegance woven in every thread',
  demoMode: false,
  locale: 'en-IN',
  currency: 'INR',
  whatsappNumber: SHOP_WHATSAPP_NUMBER,

  announcement: [
    '✦ NEW DROP ✦ UP TO 40% OFF ✦ FREE SHIPPING ALL OVER INDIA ✦',
    'Pure zari, tested and certified · Handwoven silk',
    'Made-to-drape blouse stitching · Easy 7-day returns',
  ],
  promoPill: 'NEW FESTIVE EDIT',

  contact: { phone: '+91 82206 23649', whatsapp: SHOP_WHATSAPP_NUMBER, email: 'care@akashsarees.com', address: 'Flagship Showroom, Chennai & Kanchipuram', hours: '10:00 AM - 9:00 PM' },
  social: { instagram: 'akashsarees', facebook: 'akashsarees', youtube: 'akashsarees', pinterest: 'akashsarees' },

  shipping: { flat: null as number | null, freeAbove: 2999 as number | null },

  hero: {
    eyebrow: 'SAREES FOR EVERY OCCASION',
    headline: 'Elegance Woven in Every Thread',
    body: 'Discover beautiful sarees that celebrate tradition, craftsmanship and timeless elegance.',
    walkCaptions: [
      'Step inside — authentic silk showroom with real master weaves.',
      'Pure zari and heritage silk, folded with love and care.',
      'Find the saree you will treasure for generations.',
    ],
    primaryCta: 'EXPLORE COLLECTION',
    secondaryCta: 'VIEW COLLECTIONS',
    scenes: [
      { kind: 'shop', image: 'photos/hero/shop.jpg', caption: 'Step inside — our flagship saree showroom with real handcrafted silks.' },
      { kind: 'photo', image: 'photos/hero/model-1.jpg', caption: 'Crimson Kanchipuram — pure gold zari catches every ray of light.' },
      { kind: 'photo', image: 'photos/hero/model-2.jpg', caption: 'Emerald Green Silk — woven with patience, draped with grace.' },
      { kind: 'photo', image: 'photos/hero/model-3.jpg', caption: 'Mustard Banarasi — antique gold zari brocade for festive radiance.' },
      { kind: 'photo', image: 'photos/hero/model-4.jpg', caption: 'Maroon Zardozi — royal bridal silk crafted for timeless memories.' },
      { kind: 'photo', image: 'photos/hero/model-5.jpg', caption: 'The Wedding Edit — South Indian bridal heritage in pure silk.' },
    ] as HeroScene[],
  },
  trust: ['100% Authentic Weaves', 'Free Shipping Across India', 'Easy Returns Within 7 Days'],
  ribbon: [
    'Pure zari, tested and certified',
    'New festive edit',
    'Made-to-drape blouse stitching',
    'Easy 7-day returns',
    'Handwoven silk',
    'Free shipping',
  ],
  marquee: ['Kanchipuram Silk', 'Banarasi Brocade', 'Pure Zari Certified', 'Handwoven Silks', 'Bridal Heritage', 'Designer Georgette', 'Festive Edit', 'Traditional Weaves'],

  story: {
    kicker: 'Our Heritage & Craft',
    title: 'A saree for every story you wear',
    body: [
      'Akash Sarees brings authentic weaves together under one roof — from everyday breathable cottons to opulent bridal Kanchipurams and Banarasi heirlooms.',
      'Photographed in our grand showroom, every piece is handwoven by master artisans, tested for pure zari purity, and draped to perfection for real women on their most unforgettable occasions.',
    ],
    cta: 'Explore All Sarees',
  },

  campaign: {
    kicker: 'The Wedding Season 2026',
    title: 'The Ceremony Study',
    body: 'South Indian bridal silks, festive tissue and pure gold zari — crafted for the auspicious hour.',
    collection: 'wedding',
  },

  promos: [
    { kicker: 'Festive Special', title: 'Royal Bridal Silks', body: 'Handcrafted Kanchipuram and Banarasi wedding heirlooms.', cta: 'Shop wedding', collection: 'wedding', palette: 'crimson' },
    { kicker: 'Pure Weave', title: 'Everyday Fine Cotton', body: 'Lightweight, breathable weaves for everyday comfort.', cta: 'Shop cotton', collection: 'cotton', palette: 'indigo' },
    { kicker: 'Temple Classics', title: 'Kanchipuram Heritage', body: 'Authentic korvai borders and rich heavy zari pallu.', cta: 'Shop Kanchipuram', collection: 'kanchipuram', palette: 'mustard' },
    { kicker: 'Twilight Glamour', title: 'Evening & Reception', body: 'Shimmer georgette, organza and modern cuts.', cta: 'Shop party wear', collection: 'party', palette: 'purple' },
    { kicker: 'Contemporary Drape', title: 'Designer Collection', body: 'Featherlight organza, delicate embroidery and ruffles.', cta: 'Shop designer', collection: 'designer', palette: 'rose' },
    { kicker: 'Heirloom Brocade', title: 'Banarasi Kadhua', body: 'Centuries of Varanasi craftsmanship woven into gold.', cta: 'Shop Banarasi', collection: 'banarasi', palette: 'emerald' },
  ],

  info: [
    { title: 'Free Express Shipping', body: 'Complimentary insured door-step delivery all across India on orders above ₹2,999.' },
    { title: '100% Certified Pure Zari', body: 'Every silk saree comes with certified silk mark and pure silver/gold zari authentication.' },
    { title: 'Made-to-Measure Blouse', body: 'Custom blouse stitching and bespoke tailoring options available for every drape.' },
    { title: 'Easy 7-Day Returns', body: 'Hassle-free 7-day doorstep return and exchange policy if you are not delighted.' },
  ],

  policies: {
    shipping: 'Orders are processed within 24 hours and delivered within 2-4 business days across India.',
    returns: 'Unused sarees with original tags and folds intact can be returned within 7 days for full refund.',
    privacy: 'Your personal data is encrypted and never shared with third parties.',
    terms: 'All sarees are handcrafted; subtle variations in weave are the hallmark of authentic handloom.',
  },

  api: { baseUrl: '' },
};
export type Site = typeof site;
