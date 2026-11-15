import { useState, useEffect } from 'react';
import { Product, COLLECTIONS, PRODUCTS } from '../data/catalog';
import {
  checkSupabaseTableReady,
  getLiveProducts,
  upsertProduct,
  deleteProduct,
  getLiveSettings,
  updateSetting,
} from '../lib/supabase';
import { inr } from '../lib/hooks';
import { site } from '../config/site';

const DEFAULT_USERS = ['admin', 'akash'];
const DEFAULT_PASSWORDS = ['akash2026', 'akash@2026'];

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem('akash_admin_auth') === 'true');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [search, setSearch] = useState('');
  const [filterCol, setFilterCol] = useState('all');

  // Database status
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [whatsapp, setWhatsapp] = useState(site.whatsappNumber);
  const [announcement, setAnnouncement] = useState(site.announcement[0] || '');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passNotice, setPassNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Load products & check table status
  const loadData = async () => {
    setLoading(true);
    const ready = await checkSupabaseTableReady();
    setDbReady(ready);

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
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Check custom saved credentials or defaults
    const customUser = localStorage.getItem('akash_custom_admin_user');
    const customPass = localStorage.getItem('akash_custom_admin_pass');

    const isValidUser = customUser ? u === customUser.toLowerCase() : DEFAULT_USERS.includes(u);
    const isValidPass = customPass ? p === customPass : DEFAULT_PASSWORDS.includes(p);

    if (isValidUser && isValidPass) {
      localStorage.setItem('akash_admin_auth', 'true');
      localStorage.setItem('akash_admin_username', u || 'admin');
      setAuthed(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect username or password. Default: admin / akash2026');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('akash_admin_auth');
    setAuthed(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassNotice('Password must be at least 6 characters!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassNotice('Passwords do not match!');
      return;
    }
    localStorage.setItem('akash_custom_admin_pass', newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPassNotice('✓ Password changed successfully!');
    setTimeout(() => setPassNotice(null), 3000);
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

      const result = await upsertProduct(payload);
      if (result.cloud) {
        showNotice(`✓ "${payload.name}" saved to Supabase cloud!`);
      } else {
        showNotice(`✓ "${payload.name}" saved locally! (Supabase table setup needed)`);
        setShowSqlGuide(true);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert('Error saving product: ' + (err.message || 'Check database connection'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" (${id})?`)) return;
    try {
      const res = await deleteProduct(id);
      if (res.cloud) {
        showNotice(`Deleted "${name}" from Supabase cloud`);
      } else {
        showNotice(`Deleted "${name}" locally`);
      }
      await loadData();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      site.whatsappNumber = whatsapp;
      site.contact.whatsapp = whatsapp;
      site.announcement[0] = announcement;

      const r1 = await updateSetting('whatsapp_number', whatsapp);
      const r2 = await updateSetting('announcement_1', announcement);

      if (r1.cloud && r2.cloud) {
        showNotice('✓ Settings saved to Supabase cloud!');
      } else {
        showNotice('✓ Settings saved locally! (Supabase table setup needed)');
      }
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const sqlSetupScript = `-- 1. Create Products Table
create table if not exists products (
  id text primary key,
  slug text,
  name text not null,
  fabric text not null,
  collection text not null,
  palette text default 'maroon',
  price numeric not null,
  mrp numeric,
  stock integer default 10,
  is_new boolean default false,
  is_best boolean default false,
  description text,
  image text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS & Policies
alter table products enable row level security;
drop policy if exists "Public view products" on products;
create policy "Public view products" on products for select using (true);
drop policy if exists "Allow all write products" on products;
create policy "Allow all write products" on products for all using (true) with check (true);

-- 2. Create Site Settings Table
create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table site_settings enable row level security;
drop policy if exists "Public view settings" on site_settings;
create policy "Public view settings" on site_settings for select using (true);
drop policy if exists "Allow all write settings" on site_settings;
create policy "Allow all write settings" on site_settings for all using (true) with check (true);

-- 3. Initial Settings
insert into site_settings (key, value) values
  ('whatsapp_number', '+91 82206 23649'),
  ('announcement_1', '✦ NEW DROP ✦ UP TO 40% OFF ✦ FREE SHIPPING ALL OVER INDIA ✦')
on conflict (key) do nothing;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filtered products list
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fabric.toLowerCase().includes(search.toLowerCase());
    const matchesCol = filterCol === 'all' || p.collection === filterCol;
    return matchesSearch && matchesCol;
  });

  // Username + Password Login Screen
  if (!authed) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <h2>Akash Sarees</h2>
            <span>Admin Control Portal</span>
          </div>

          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. admin or akash"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setAuthError(null);
              }}
              autoFocus
              required
            />

            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="e.g. akash2026"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(null);
                }}
                required
                style={{ paddingRight: 45 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#cdb9ad',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 4,
                }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>

            {authError && <p className="admin-err">{authError}</p>}

            <button type="submit" className="admin-btn-primary" style={{ marginTop: 8 }}>
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
            {dbReady === true ? (
              <span className="admin-db-badge" style={{ color: '#51cf66' }}>
                <i style={{ background: '#51cf66' }} /> Supabase Cloud Active (qsrgzahisovdzvumltnn)
              </span>
            ) : (
              <button
                onClick={() => setShowSqlGuide(true)}
                className="admin-db-badge"
                style={{
                  color: '#ffd43b',
                  background: 'rgba(255, 212, 59, 0.12)',
                  border: '1px solid rgba(255, 212, 59, 0.4)',
                  cursor: 'pointer',
                }}
              >
                <i style={{ background: '#ffd43b' }} /> Setup Supabase Cloud Table ⚠️ (Click Here)
              </button>
            )}
          </div>
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

      {/* Database Setup Warning Banner if not ready */}
      {dbReady === false && (
        <div
          style={{
            background: 'rgba(245, 159, 0, 0.15)',
            borderBottom: '1px solid rgba(245, 159, 0, 0.4)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffd43b',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <strong>⚠️ Supabase Setup Notice:</strong> Table <code>public.products</code> has not been created in your Supabase project yet.
            Your edits are currently safely saved in browser storage.
          </div>
          <button
            onClick={() => setShowSqlGuide(true)}
            style={{
              background: '#ffd43b',
              color: '#0a0506',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Run SQL Setup &rarr;
          </button>
        </div>
      )}

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
            Store Settings & Password
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <input
                  type="text"
                  placeholder="Search by saree name or fabric..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={filterCol} onChange={(e) => setFilterCol(e.target.value)}>
                  <option value="all">All Collections ({products.length})</option>
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
                    collection: 'kanchipuram',
                    price: 15000,
                    stock: 10,
                    isNew: true,
                    isBest: false,
                    image: 'photos/products/suhag-bridal-kanjivaram.jpg',
                    desc: '',
                  });
                  setModalOpen(true);
                }}
              >
                + Add New Saree
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#cdb9ad' }}>
                Loading sarees from catalog...
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>ID</th>
                      <th>Name & Fabric</th>
                      <th>Collection</th>
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
                          <code>{p.id}</code>
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ color: '#cdb9ad', fontSize: '0.8rem' }}>{p.fabric}</div>
                        </td>
                        <td>
                          <span className="admin-col-badge">{p.collection}</span>
                        </td>
                        <td>
                          <span className="admin-price">{inr(p.price)}</span>
                          {p.mrp && <span className="admin-mrp">{inr(p.mrp)}</span>}
                        </td>
                        <td>
                          <span
                            style={{
                              color: p.stock && p.stock > 0 ? '#51cf66' : '#ff6b6b',
                              fontWeight: 600,
                            }}
                          >
                            {p.stock && p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {p.isNew && <span className="admin-tag new">NEW</span>}
                            {p.isBest && <span className="admin-tag best">BESTSELLER</span>}
                          </div>
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
          <div className="admin-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Store Contact Form */}
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
                {settingsSaving ? 'Saving...' : 'Save Store Settings'}
              </button>
            </form>

            {/* Change Admin Password */}
            <form onSubmit={handleChangePassword} className="admin-settings-form">
              <h3>Change Admin Password</h3>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              {passNotice && (
                <p style={{ color: passNotice.startsWith('✓') ? '#51cf66' : '#ff6b6b', fontSize: '0.85rem', marginBottom: 12 }}>
                  {passNotice}
                </p>
              )}

              <button type="submit" className="admin-btn-secondary">
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* SQL Guide Modal */}
      {showSqlGuide && (
        <div className="admin-modal-overlay" onClick={() => setShowSqlGuide(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>⚡ 1-Step Supabase Database Setup</h3>
              <button className="admin-modal-close" onClick={() => setShowSqlGuide(false)}>
                &times;
              </button>
            </div>
            <div style={{ padding: 24, color: '#f6ece4', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p>
                Follow these 2 quick steps to create the tables in your Supabase project:
              </p>
              <ol style={{ paddingLeft: 20, margin: '16px 0' }}>
                <li style={{ marginBottom: 12 }}>
                  Open your project's SQL Editor in Supabase:{' '}
                  <a
                    href="https://supabase.com/dashboard/project/qsrgzahisovdzvumltnn/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#e0b25a', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Open Supabase SQL Editor &rarr;
                  </a>
                </li>
                <li style={{ marginBottom: 12 }}>
                  Click the button below to copy the SQL script, then paste it in Supabase and click the green <strong>"RUN"</strong> button!
                </li>
              </ol>

              <button
                onClick={copySql}
                className="admin-btn-primary"
                style={{ width: '100%', marginBottom: 16 }}
              >
                {copiedSql ? '✓ Copied to Clipboard!' : '📋 Copy Supabase Setup SQL Script'}
              </button>

              <details style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6 }}>
                <summary style={{ cursor: 'pointer', color: '#e0b25a', fontWeight: 600 }}>
                  View SQL Code
                </summary>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: '#cdb9ad',
                    marginTop: 8,
                  }}
                >
                  {sqlSetupScript}
                </pre>
              </details>
            </div>
            <div className="admin-modal-actions" style={{ padding: '16px 24px' }}>
              <button
                className="admin-btn-secondary"
                onClick={() => {
                  setShowSqlGuide(false);
                  loadData();
                }}
              >
                Close & Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Saree Modal */}
      {modalOpen && editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct.id ? `Edit Saree (${editingProduct.id})` : 'Add New Saree'}</h3>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-group">
                <label>Saree Title / Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Kumkum Temple Border Kanjivaram"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fabric Type *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    placeholder="Kanchipuram Silk / Banarasi / Cotton"
                  />
                </div>
                <div className="form-group">
                  <label>Color Palette</label>
                  <input
                    type="text"
                    value={editingProduct.palette || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, palette: e.target.value })}
                    placeholder="crimson / maroon / peacock / gold"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Store Collection Category *</label>
                  <select
                    value={editingProduct.collection || 'kanchipuram'}
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
                  {saving ? 'Saving...' : 'Save Saree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
