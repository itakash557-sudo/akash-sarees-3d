import { useState, useEffect } from 'react';
import { Product, COLLECTIONS, PRODUCTS } from '../data/catalog';
import { supabase, getLiveProducts, upsertProduct, deleteProduct, getLiveSettings, updateSetting } from '../lib/supabase';
import { inr } from '../lib/hooks';
import { site } from '../config/site';

const ADMIN_PIN = 'akash2026';

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem('akash_admin_auth') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [search, setSearch] = useState('');
  const [filterCol, setFilterCol] = useState('all');

  // Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [whatsapp, setWhatsapp] = useState(site.whatsappNumber);
  const [announcement, setAnnouncement] = useState(site.announcement[0] || '');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Load products from Supabase
  const loadData = async () => {
    setLoading(true);
    const live = await getLiveProducts();
    if (live && live.length > 0) {
      setProducts(live);
    }
    const liveSettings = await getLiveSettings();
    if (liveSettings['whatsapp_number']) setWhatsapp(liveSettings['whatsapp_number']);
    if (liveSettings['announcement_1']) setAnnouncement(liveSettings['announcement_1']);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) {
      loadData();
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      localStorage.setItem('akash_admin_auth', 'true');
      setAuthed(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('akash_admin_auth');
    setAuthed(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;
    setSaving(true);
    try {
      const pid = editingProduct.id || `P${String(products.length + 1).padStart(3, '0')}`;
      const payload = {
        id: pid,
        name: editingProduct.name,
        slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        fabric: editingProduct.fabric || 'Pure Silk',
        collection: editingProduct.collection || 'wedding',
        palette: editingProduct.palette || 'maroon',
        price: Number(editingProduct.price),
        mrp: editingProduct.mrp ? Number(editingProduct.mrp) : null,
        stock: Number(editingProduct.stock ?? 10),
        is_new: Boolean(editingProduct.isNew),
        is_best: Boolean(editingProduct.isBest),
        description: editingProduct.desc || '',
        image: editingProduct.image || 'photos/products/suhag-bridal-kanjivaram.jpg',
      };
      await upsertProduct(payload);
      showNotice('Saree saved to Supabase successfully!');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert('Error saving product: ' + (err.message || 'Check database connection'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showNotice(`"${name}" deleted.`);
      await loadData();
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await updateSetting('whatsapp_number', whatsapp);
      await updateSetting('announcement_1', announcement);
      showNotice('Settings updated successfully in Supabase!');
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Filtered products list
  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.fabric.toLowerCase().includes(search.toLowerCase());
    const matchesCol = filterCol === 'all' || p.collection === filterCol;
    return matchesSearch && matchesCol;
  });

  // PIN Login Screen
  if (!authed) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <h2>Akash Sarees</h2>
            <span>Admin Control Portal</span>
          </div>
          <form onSubmit={handleLogin}>
            <label>Enter Admin PIN / Password</label>
            <input
              type="password"
              placeholder="e.g. akash2026"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              autoFocus
            />
            {pinError && <p className="admin-err">Incorrect PIN. Try: akash2026</p>}
            <button type="submit" className="admin-btn-primary">
              Login to Admin Panel &rarr;
            </button>
          </form>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button className="admin-btn-link" onClick={onExit}>
              &larr; Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Akash Sarees — Management Panel</h1>
          <span className="admin-db-badge">
            <i /> Supabase Connected: <code>qsrgzahisovdzvumltnn</code>
          </span>
        </div>
        <div className="admin-header-right">
          <button className="admin-btn-secondary" onClick={onExit}>
            &larr; View Storefront
          </button>
          <button className="admin-btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {notice && <div className="admin-toast">{notice}</div>}

      {/* Main Tabs */}
      <div className="admin-container">
        <div className="admin-tabs">
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Saree Catalog ({products.length})
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Store Settings & WhatsApp
          </button>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <input
                  type="text"
                  placeholder="Search sarees by name or fabric..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={filterCol} onChange={(e) => setFilterCol(e.target.value)}>
                  <option value="all">All Collections</option>
                  {COLLECTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="admin-btn-primary"
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    name: '',
                    fabric: 'Kanchipuram Silk',
                    collection: 'wedding',
                    price: 15000,
                    stock: 5,
                    isNew: true,
                    isBest: false,
                    desc: 'Handwoven pure silk saree with authentic zari borders.',
                    image: 'photos/products/suhag-bridal-kanjivaram.jpg',
                  });
                  setModalOpen(true);
                }}
              >
                + Add New Saree
              </button>
            </div>

            {loading ? (
              <div className="admin-loading">Loading catalog from Supabase...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Saree Name</th>
                      <th>Collection</th>
                      <th>Fabric</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.name} className="admin-thumb" />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#cdb9ad' }}>ID: {p.id}</div>
                        </td>
                        <td>
                          <span className="admin-col-badge">{p.collection}</span>
                        </td>
                        <td>{p.fabric}</td>
                        <td>
                          <span className="admin-price">{inr(p.price)}</span>
                          {p.mrp && <del className="admin-mrp">{inr(p.mrp)}</del>}
                        </td>
                        <td>
                          <span className={p.stock > 0 ? 'stock-in' : 'stock-out'}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          {p.isNew && <span className="admin-tag tag-new">New</span>}
                          {p.isBest && <span className="admin-tag tag-best">Bestseller</span>}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-btn-edit"
                              onClick={() => {
                                setEditingProduct(p);
                                setModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-btn-del"
                              onClick={() => handleDelete(p.id, p.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <div className="admin-panel">
            <form onSubmit={handleSaveSettings} className="admin-settings-form">
              <h3>Store Contact & Live Configuration</h3>
              <div className="form-group">
                <label>Official WhatsApp Number (Orders receive here)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 82206 23649"
                />
                <small>Include country code e.g. +91 followed by 10-digit number</small>
              </div>

              <div className="form-group">
                <label>Top Announcement Banner Text</label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="✦ FESTIVE SALE ✦ UP TO 40% OFF ✦"
                />
                <small>Appears in the scrolling announcement bar across the top</small>
              </div>

              <button type="submit" className="admin-btn-primary" disabled={settingsSaving}>
                {settingsSaving ? 'Saving to Database...' : 'Save Settings to Supabase'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add / Edit Saree Modal */}
      {modalOpen && editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>{editingProduct.id ? `Edit Saree (${editingProduct.id})` : 'Add New Saree'}</h3>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Saree Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Maharani Pure Kanjivaram"
                  />
                </div>
                <div className="form-group">
                  <label>Fabric *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    placeholder="e.g. Kanchipuram Silk, Banarasi, Cotton"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Collection</label>
                  <select
                    value={editingProduct.collection || 'wedding'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                  >
                    {COLLECTIONS.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    placeholder="18500"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>MRP / Cut Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.mrp ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="21000"
                  />
                </div>
                <div className="form-group">
                  <label>Available Stock Count</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Saree Photo Image URL / Path *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="photos/products/suhag-bridal-kanjivaram.jpg or https://..."
                />
                <small>You can use existing saree paths or external image URLs</small>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.desc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                  placeholder="Describe the weave, borders, zari, and occasion details..."
                />
              </div>

              <div className="form-row-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isNew)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                  />
                  Mark as New Arrival
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isBest)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBest: e.target.checked })}
                  />
                  Mark as Bestseller
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
