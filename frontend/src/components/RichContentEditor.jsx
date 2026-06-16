import { useState, useEffect, useRef } from 'react';
import {
  FiType, FiImage, FiYoutube, FiList, FiAlignLeft,
  FiTrash2, FiChevronUp, FiChevronDown, FiPlus, FiMinus,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const MAX_IMG_MB = 2;
const MAX_IMG_BYTES = MAX_IMG_MB * 1024 * 1024;

function readFileBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function createBlock(type) {
  switch (type) {
    case 'paragraph': return { type: 'paragraph', content: '' };
    case 'heading':   return { type: 'heading', level: 2, content: '' };
    case 'image':     return { type: 'image', src: '', caption: '' };
    case 'youtube':   return { type: 'youtube', url: '' };
    case 'list':      return { type: 'list', style: 'unordered', items: [''] };
    case 'quote':     return { type: 'quote', content: '' };
    case 'divider':   return { type: 'divider' };
    default:          return { type: 'paragraph', content: '' };
  }
}

function parseBlocks(value) {
  if (!value) return [createBlock('paragraph')];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) return parsed;
  } catch { /* not JSON */ }
  // Legacy plain text → single paragraph
  return [{ type: 'paragraph', content: value }];
}

/* ─────────────────────────────────────────────
   Styles (CSS-in-JS using admin CSS variables)
───────────────────────────────────────────── */
const S = {
  wrap: {
    border: '1px solid var(--ad-border)',
    borderRadius: 16,
    background: 'var(--ad-input)',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px',
    borderBottom: '1px solid var(--ad-border)',
    background: 'var(--ad-surface, var(--ad-input))',
  },
  tbtn: (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
    color: active ? '#6C63FF' : 'var(--ad-text-muted)',
  }),
  blocks: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 },
  block: {
    position: 'relative', borderRadius: 12, padding: '12px 14px',
    border: '1px solid var(--ad-border)',
    background: 'var(--ad-card)',
    transition: 'box-shadow 0.15s',
  },
  blockFocus: { boxShadow: '0 0 0 2px rgba(108,99,255,0.25)' },
  actions: {
    position: 'absolute', top: 6, right: 6,
    display: 'flex', gap: 2,
  },
  abtn: {
    width: 24, height: 24, borderRadius: 6, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', background: 'var(--ad-input)',
    color: 'var(--ad-text-muted)', transition: 'all 0.15s',
    fontSize: 12,
  },
  label: {
    fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#6C63FF',
    marginBottom: 6, display: 'block',
  },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--ad-input)', border: '1px solid var(--ad-border)',
    color: 'var(--ad-text)', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border 0.2s',
  },
  textarea: {
    width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--ad-input)', border: '1px solid var(--ad-border)',
    color: 'var(--ad-text)', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', resize: 'vertical', minHeight: 60,
    transition: 'border 0.2s',
  },
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function RichContentEditor({ value, onChange }) {
  const [blocks, setBlocks] = useState(() => parseBlocks(value));
  const isInitRef = useRef(true);

  // Sync outward
  useEffect(() => {
    if (isInitRef.current) { isInitRef.current = false; return; }
    onChange(JSON.stringify(blocks));
  }, [blocks]);

  // Sync inward when value changes externally (e.g. form reset)
  useEffect(() => {
    const parsed = parseBlocks(value);
    setBlocks(parsed);
    isInitRef.current = true;
  }, [value === '' || value === '[]' ? value : null]);

  const update = (i, patch) => setBlocks(b => b.map((bl, idx) => idx === i ? { ...bl, ...patch } : bl));
  const remove = (i) => setBlocks(b => b.length <= 1 ? b : b.filter((_, idx) => idx !== i));
  const moveUp = (i) => { if (i === 0) return; setBlocks(b => { const n = [...b]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; }); };
  const moveDown = (i) => setBlocks(b => { if (i >= b.length - 1) return b; const n = [...b]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; });
  const addBlock = (type) => setBlocks(b => [...b, createBlock(type)]);

  const handleImageUpload = async (i, file) => {
    if (!file) return;
    if (file.size > MAX_IMG_BYTES) {
      alert(`Gambar terlalu besar! Max ${MAX_IMG_MB}MB, file: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }
    const src = await readFileBase64(file);
    update(i, { src });
  };

  const TOOLS = [
    { type: 'paragraph', icon: FiAlignLeft, label: 'Teks' },
    { type: 'heading',   icon: FiType,      label: 'Heading' },
    { type: 'image',     icon: FiImage,     label: 'Gambar' },
    { type: 'youtube',   icon: FiYoutube,   label: 'YouTube' },
    { type: 'list',      icon: FiList,      label: 'List' },
    { type: 'quote',     icon: FiAlignLeft, label: 'Kutipan' },
    { type: 'divider',   icon: FiMinus,     label: 'Garis' },
  ];

  return (
    <div style={S.wrap}>
      {/* Toolbar */}
      <div style={S.toolbar}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ad-text-muted)', alignSelf: 'center', marginRight: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          + Tambah:
        </span>
        {TOOLS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.type} type="button" style={S.tbtn(false)} onClick={() => addBlock(t.type)}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.12)'; e.currentTarget.style.color = '#6C63FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ad-text-muted)'; }}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Blocks */}
      <div style={S.blocks}>
        {blocks.map((block, i) => (
          <div key={i} style={S.block}>
            {/* Actions */}
            <div style={S.actions}>
              <button type="button" style={S.abtn} onClick={() => moveUp(i)} title="Pindah Atas"><FiChevronUp size={12} /></button>
              <button type="button" style={S.abtn} onClick={() => moveDown(i)} title="Pindah Bawah"><FiChevronDown size={12} /></button>
              <button type="button" style={{ ...S.abtn, color: '#FF5252' }} onClick={() => remove(i)} title="Hapus"><FiTrash2 size={11} /></button>
            </div>

            <span style={S.label}>{block.type === 'heading' ? `Heading H${block.level}` : block.type}</span>

            {/* ── PARAGRAPH ── */}
            {block.type === 'paragraph' && (
              <textarea style={S.textarea} value={block.content} rows={3}
                placeholder="Tulis paragraf di sini..."
                onChange={e => update(i, { content: e.target.value })}
                onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--ad-border)'; }}
              />
            )}

            {/* ── HEADING ── */}
            {block.type === 'heading' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <select style={{ ...S.input, width: 70, padding: '8px 6px', flexShrink: 0 }}
                  value={block.level} onChange={e => update(i, { level: Number(e.target.value) })}>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
                <input style={S.input} value={block.content} placeholder="Judul heading..."
                  onChange={e => update(i, { content: e.target.value })}
                  onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--ad-border)'; }}
                />
              </div>
            )}

            {/* ── IMAGE ── */}
            {block.type === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {block.src ? (
                  <div style={{ position: 'relative' }}>
                    <img src={block.src} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, background: '#000' }} />
                    <button type="button" onClick={() => update(i, { src: '' })}
                      style={{ position: 'absolute', top: 6, right: 6, ...S.abtn, background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: 20, borderRadius: 10, border: '2px dashed var(--ad-border)',
                    cursor: 'pointer', background: 'var(--ad-input)',
                  }}>
                    <FiImage size={24} style={{ color: '#6C63FF', opacity: 0.6 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ad-text-muted)' }}>
                      Klik untuk upload gambar (max {MAX_IMG_MB}MB)
                    </span>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { handleImageUpload(i, e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                )}
                <input style={S.input} value={block.caption || ''} placeholder="Keterangan gambar (opsional)"
                  onChange={e => update(i, { caption: e.target.value })} />
              </div>
            )}

            {/* ── YOUTUBE ── */}
            {block.type === 'youtube' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input style={S.input} value={block.url} placeholder="Tempel link YouTube, misal: https://youtube.com/watch?v=..."
                  onChange={e => update(i, { url: e.target.value })}
                  onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--ad-border)'; }}
                />
                {extractYouTubeId(block.url) && (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(block.url)}`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title="YouTube preview"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── LIST ── */}
            {block.type === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select style={{ ...S.input, width: 150, padding: '6px 8px', fontSize: 11 }}
                  value={block.style} onChange={e => update(i, { style: e.target.value })}>
                  <option value="unordered">● Bullet List</option>
                  <option value="ordered">1. Numbered List</option>
                </select>
                {(block.items || ['']).map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ad-text-muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>
                      {block.style === 'ordered' ? `${j + 1}.` : '•'}
                    </span>
                    <input style={{ ...S.input, flex: 1 }} value={item} placeholder={`Item ${j + 1}`}
                      onChange={e => {
                        const items = [...(block.items || [''])];
                        items[j] = e.target.value;
                        update(i, { items });
                      }} />
                    <button type="button" style={{ ...S.abtn, color: '#FF5252' }}
                      onClick={() => {
                        const items = (block.items || ['']).filter((_, idx) => idx !== j);
                        update(i, { items: items.length ? items : [''] });
                      }}><FiTrash2 size={10} /></button>
                  </div>
                ))}
                <button type="button"
                  style={{ ...S.tbtn(false), alignSelf: 'flex-start', fontSize: 10, padding: '4px 10px' }}
                  onClick={() => update(i, { items: [...(block.items || ['']), ''] })}>
                  <FiPlus size={10} /> Tambah Item
                </button>
              </div>
            )}

            {/* ── QUOTE ── */}
            {block.type === 'quote' && (
              <textarea style={{ ...S.textarea, borderLeft: '3px solid #6C63FF', borderRadius: '0 8px 8px 0', fontStyle: 'italic' }}
                value={block.content} rows={2} placeholder="Tulis kutipan..."
                onChange={e => update(i, { content: e.target.value })} />
            )}

            {/* ── DIVIDER ── */}
            {block.type === 'divider' && (
              <hr style={{ border: 'none', borderTop: '2px dashed var(--ad-border)', margin: '4px 0' }} />
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--ad-text-muted)', fontSize: 13 }}>
            Klik tombol di atas untuk menambahkan konten
          </div>
        )}
      </div>
    </div>
  );
}
