import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiTrash2, FiEdit3, FiX, FiSave, FiSearch, FiExternalLink, FiCheckSquare, FiSquare, FiAlertTriangle, FiBriefcase, FiBookOpen, FiActivity, FiDollarSign, FiFilter, FiRefreshCw, FiChevronDown, FiPaperclip, FiFile, FiFileText } from 'react-icons/fi';
import RichContentEditor from '../../components/RichContentEditor';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import citiesData from '../../utils/cities.json';

const ALL_LOCATIONS = [
  'Nasional',
  'Remote',
  ...citiesData.map(c => c.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()))
];

const KATEGORI_TABS = [
  { key: 'lowongan', label: 'Lowongan',       icon: FiBriefcase,  path: '/admin/lowongan' },
  { key: 'tutorial', label: 'Tips Wawancara', icon: FiBookOpen,   path: '/admin/tutorial' },
  { key: 'usaha',    label: 'Tips Usaha',     icon: FiActivity,   path: '/admin/usaha'    },
  { key: 'keuangan', label: 'Tips Keuangan',  icon: FiDollarSign, path: '/admin/keuangan' },
];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Max image size: 2MB (base64 inflates ~33%, so 2MB → ~2.7MB payload, safe under 10MB backend limit)
const MAX_IMAGE_MB = 2;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

async function validateAndReadImage(file) {
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error(
      `Ukuran gambar terlalu besar! Maksimal ${MAX_IMAGE_MB}MB, file kamu ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      { duration: 5000 }
    );
    return null;
  }
  return readFileAsDataUrl(file);
}

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

async function validateAndReadFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    toast.error(
      `Ukuran file terlalu besar! Maksimal ${MAX_FILE_MB}MB, file kamu ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      { duration: 5000 }
    );
    return null;
  }
  return {
    name: file.name,
    type: file.type,
    data: await readFileAsDataUrl(file)
  };
}

function confirmToast(message, onConfirm) {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-white">{message}</p>
      <div className="flex gap-2">
        <button onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors border-none cursor-pointer">
          Hapus
        </button>
        <button onClick={() => toast.dismiss(t.id)}
          className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border-none cursor-pointer">
          Batal
        </button>
      </div>
    </div>
  ), {
    duration: 8000,
    style: { background: '#1C1F3A', border: '1px solid rgba(255,82,82,0.3)',         borderRadius: '16px', padding: '16px' },
  });
}

export default function ManageContentPage({ kategoriProp }) {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori: kategoriProp, link_eksternal: '', gambar: '', perusahaan: '', lokasi: '', detail_lokasi: '', tipe_pekerjaan: 'Full-Time', is_magang: false, isi_konten: '', file_tambahan: '[]' });
  const [search, setSearch] = useState('');

  // Per-category filters
  // Lowongan
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [filterPerusahaan, setFilterPerusahaan] = useState('');
  // Tutorial / Usaha / Keuangan
  const [filterMedia, setFilterMedia] = useState(''); // 'dengan_gambar' | 'tanpa_gambar' | ''
  const [filterLink, setFilterLink] = useState('');   // 'dengan_link' | 'tanpa_link' | ''

  // Batch delete state
  const [selected, setSelected] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);

  const load = () => {
    api.getContents(kategoriProp).then(d => Array.isArray(d) && setContents(d)).catch(() => {});
  };

  useEffect(() => {
    load();
    setForm(prev => ({ ...prev, kategori: kategoriProp }));
    setSelected(new Set());
    setBatchMode(false);
    // Reset all filters on category change
    setSearch('');
    setFilterLokasi(''); setFilterTipe(''); setFilterPerusahaan('');
    setFilterMedia(''); setFilterLink('');
  }, [kategoriProp]);

  // Load templates for admin manage (only used for 'usaha')
  const loadTemplates = async () => {
    try {
      const t = await api.getTemplates();
      if (Array.isArray(t)) setTemplates(t);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (kategoriProp === 'usaha') loadTemplates();
  }, [kategoriProp]);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  // ── Derive unique filter options from data ──
  const lokasiOptions = useMemo(() => [...new Set(contents.map(c => c.lokasi).filter(Boolean))].sort(), [contents]);
  const tipeOptions   = useMemo(() => [...new Set(contents.map(c => c.tipe_pekerjaan).filter(Boolean))].sort(), [contents]);
  const perusahaanOptions = useMemo(() => [...new Set(contents.map(c => c.perusahaan).filter(Boolean))].sort(), [contents]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return contents.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.judul.toLowerCase().includes(q) ||
        (c.deskripsi || '').toLowerCase().includes(q) ||
        (c.perusahaan || '').toLowerCase().includes(q);

      if (kategoriProp === 'lowongan') {
        const matchLokasi     = filterLokasi     ? c.lokasi         === filterLokasi     : true;
        const matchTipe       = filterTipe       ? c.tipe_pekerjaan === filterTipe       : true;
        const matchPerusahaan = filterPerusahaan ? c.perusahaan     === filterPerusahaan : true;
        return matchSearch && matchLokasi && matchTipe && matchPerusahaan;
      } else {
        const matchMedia = filterMedia === 'dengan_gambar' ? !!c.gambar
                         : filterMedia === 'tanpa_gambar'  ? !c.gambar
                         : true;
        const matchLink  = filterLink  === 'dengan_link'   ? !!c.link_eksternal
                         : filterLink  === 'tanpa_link'    ? !c.link_eksternal
                         : true;
        return matchSearch && matchMedia && matchLink;
      }
    });
  }, [contents, search, filterLokasi, filterTipe, filterPerusahaan, filterMedia, filterLink, kategoriProp]);

  const hasActiveFilters = search || filterLokasi || filterTipe || filterPerusahaan || filterMedia || filterLink;

  const resetFilters = () => {
    setSearch('');
    setFilterLokasi(''); setFilterTipe(''); setFilterPerusahaan('');
    setFilterMedia(''); setFilterLink('');
  };

  // ── Selection helpers ──
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelected(new Set());
  };

  // ── Batch delete ──
  const handleBatchDelete = () => {
    if (selected.size === 0) return;
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FiAlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm font-semibold text-white">
            Hapus <span className="text-red-400">{selected.size} item</span> sekaligus?
          </p>
        </div>
        <p className="text-xs text-white/50">Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const ids = [...selected];
              const toastId = toast.loading(`Menghapus ${ids.length} item...`);
              try {
                await Promise.all(ids.map(id => api.deleteContent(id, kategoriProp)));
                toast.success(`${ids.length} item berhasil dihapus!`, { id: toastId });
                exitBatchMode();
                load();
              } catch {
                toast.error('Sebagian item gagal dihapus.', { id: toastId });
                load();
              }
            }}
            className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors border-none cursor-pointer"
          >
            Hapus Semua
          </button>
          <button onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border-none cursor-pointer">
            Batal
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: { background: '#1C1F3A', border: '1px solid rgba(255,82,82,0.4)', borderRadius: '16px', padding: '16px' },
    });
  };

  // ── Single CRUD ──
  const openAdd = () => {
    setEditItem(null);
    setForm({ judul: '', deskripsi: '', kategori: kategoriProp, link_eksternal: '', gambar: '', perusahaan: '', lokasi: '', detail_lokasi: '', tipe_pekerjaan: 'Full-Time', is_magang: false, isi_konten: '', file_tambahan: '[]' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ judul: item.judul, deskripsi: item.deskripsi || '', kategori: kategoriProp, link_eksternal: item.link_eksternal || '', gambar: item.gambar || '', perusahaan: item.perusahaan || '', lokasi: item.lokasi || '', detail_lokasi: item.detail_lokasi || '', tipe_pekerjaan: item.tipe_pekerjaan || 'Full-Time', is_magang: item.is_magang || false, isi_konten: item.isi_konten || '', file_tambahan: item.file_tambahan || '[]' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.judul?.trim()) { toast.error('Judul tidak boleh kosong!'); return; }
    if (kategoriProp === 'lowongan') {
      if (!form.perusahaan?.trim()) { toast.error('Nama perusahaan tidak boleh kosong!'); return; }
      if (!form.lokasi?.trim()) { toast.error('Lokasi tidak boleh kosong!'); return; }
    } else {
      if (!form.isi_konten?.trim()) { toast.error('Isi konten tidak boleh kosong!'); return; }
    }
    const savePromise = editItem ? api.updateContent(editItem.id, form) : api.createContent(form);
    await toast.promise(savePromise, {
      loading: editItem ? 'Menyimpan perubahan...' : 'Menambahkan data...',
      success: editItem ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!',
      error: 'Gagal menyimpan data.',
    });
    setShowModal(false);
    load();
  };

  const handleDelete = (id) => {
    confirmToast('Hapus konten ini? Tindakan tidak bisa dibatalkan.', async () => {
      await toast.promise(api.deleteContent(id, kategoriProp), {
        loading: 'Menghapus...', success: 'Konten berhasil dihapus!', error: 'Gagal menghapus konten.',
      });
      load();
    });
  };

  const handleUploadTemplate = async (key, fileData, title = '', description = '') => {
    if (!fileData) return;
    const payload = {
      key,
      title: title || key,
      description: description || '',
      file_name: fileData.name,
      mime_type: fileData.type,
      data: fileData.data
    };
    const toastId = toast.loading('Mengunggah template...');
    try {
      await api.uploadTemplate(payload);
      toast.success('Template berhasil diunggah', { id: toastId });
      await loadTemplates();
    } catch (err) {
      toast.error('Gagal mengunggah template', { id: toastId });
    }
  };

  const getTitle = () => {
    switch (kategoriProp) {
      case 'lowongan': return 'Kelola Lowongan';
      case 'tutorial': return 'Tips Wawancara';
      case 'usaha': return 'Tips Memulai Usaha';
      case 'keuangan': return 'Tips Keuangan';
      default: return 'Kelola Konten';
    }
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div className="space-y-6 text-text-primary">
      {/* Category Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-bg-card rounded-2xl border border-border overflow-x-auto">
        {KATEGORI_TABS.map(tab => {
          const Icon = tab.icon;
          const active = tab.key === kategoriProp;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-none cursor-pointer flex-1 justify-center
                ${active
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1 uppercase tracking-tight">{getTitle()}</h1>
          <p className="text-text-secondary text-sm">Manajemen data untuk kategori <span className="font-bold text-primary">{kategoriProp}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {batchMode ? (
            <>
              <button
                onClick={exitBatchMode}
                className="text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-all bg-transparent cursor-pointer"
              >
                <FiX size={14} /> Batal
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selected.size === 0}
                className="admin-danger-soft text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <FiTrash2 size={14} />
                Hapus {selected.size > 0 ? `(${selected.size})` : 'Terpilih'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setBatchMode(true)}
                className="text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-all bg-transparent cursor-pointer"
              >
                <FiCheckSquare size={14} /> Pilih
              </button>
              <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-primary/20">
                <FiPlus /> Tambah Data
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder={`Cari di ${getTitle()}...`} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-all shadow-sm" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-bg-card/50 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mr-1">
          <FiFilter size={12} /> Filter:
        </div>

        {kategoriProp === 'lowongan' ? (
          <>
            {/* Tipe Pekerjaan */}
            <div className="relative">
              <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none
                  ${filterTipe ? 'bg-primary text-white border-primary' : 'bg-bg-input text-text-secondary border-border hover:border-primary/50'}`}>
                <option value="">Semua Tipe</option>
                {tipeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <FiChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filterTipe ? 'text-white' : 'text-text-muted'}`} />
            </div>

            {/* Lokasi */}
            <div className="relative">
              <select value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none
                  ${filterLokasi ? 'bg-primary text-white border-primary' : 'bg-bg-input text-text-secondary border-border hover:border-primary/50'}`}>
                <option value="">Semua Lokasi</option>
                {lokasiOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <FiChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filterLokasi ? 'text-white' : 'text-text-muted'}`} />
            </div>

            {/* Perusahaan */}
            <div className="relative">
              <select value={filterPerusahaan} onChange={e => setFilterPerusahaan(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none
                  ${filterPerusahaan ? 'bg-primary text-white border-primary' : 'bg-bg-input text-text-secondary border-border hover:border-primary/50'}`}>
                <option value="">Semua Perusahaan</option>
                {perusahaanOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <FiChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filterPerusahaan ? 'text-white' : 'text-text-muted'}`} />
            </div>
          </>
        ) : (
          <>
            {/* Gambar */}
            <div className="relative">
              <select value={filterMedia} onChange={e => setFilterMedia(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none
                  ${filterMedia ? 'bg-primary text-white border-primary' : 'bg-bg-input text-text-secondary border-border hover:border-primary/50'}`}>
                <option value="">Semua Gambar</option>
                <option value="dengan_gambar">Ada Gambar</option>
                <option value="tanpa_gambar">Tanpa Gambar</option>
              </select>
              <FiChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filterMedia ? 'text-white' : 'text-text-muted'}`} />
            </div>

            {/* Link Eksternal */}
            <div className="relative">
              <select value={filterLink} onChange={e => setFilterLink(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none
                  ${filterLink ? 'bg-primary text-white border-primary' : 'bg-bg-input text-text-secondary border-border hover:border-primary/50'}`}>
                <option value="">Semua Link</option>
                <option value="dengan_link">Ada Link</option>
                <option value="tanpa_link">Tanpa Link</option>
              </select>
              <FiChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filterLink ? 'text-white' : 'text-text-muted'}`} />
            </div>
          </>
        )}

        {/* Active chips */}
        {filterTipe && (
          <button onClick={() => setFilterTipe('')} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors border-none cursor-pointer">
            {filterTipe} <FiX size={10} />
          </button>
        )}
        {filterLokasi && (
          <button onClick={() => setFilterLokasi('')} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors border-none cursor-pointer">
            {filterLokasi} <FiX size={10} />
          </button>
        )}
        {filterPerusahaan && (
          <button onClick={() => setFilterPerusahaan('')} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors border-none cursor-pointer">
            {filterPerusahaan} <FiX size={10} />
          </button>
        )}
        {filterMedia && (
          <button onClick={() => setFilterMedia('')} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors border-none cursor-pointer">
            {filterMedia === 'dengan_gambar' ? 'Ada Gambar' : 'Tanpa Gambar'} <FiX size={10} />
          </button>
        )}
        {filterLink && (
          <button onClick={() => setFilterLink('')} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors border-none cursor-pointer">
            {filterLink === 'dengan_link' ? 'Ada Link' : 'Tanpa Link'} <FiX size={10} />
          </button>
        )}

        {/* Result count + reset */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted bg-bg-surface px-2.5 py-1.5 rounded-lg border border-border">
            {filtered.length} / {contents.length}
          </span>
          {hasActiveFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-danger hover:text-red-400 bg-danger/10 border border-danger/20 px-2.5 py-1.5 rounded-lg transition-colors border-none cursor-pointer">
              <FiRefreshCw size={10} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Batch info bar */}
      {batchMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">
            {allSelected
              ? <FiCheckSquare size={16} className="text-primary" />
              : someSelected
                ? <FiCheckSquare size={16} className="text-primary/50" />
                : <FiSquare size={16} />
            }
            <span className="font-medium">Pilih Semua</span>
          </button>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted">{selected.size} dari {filtered.length} dipilih</span>
        </div>
      )}

      {/* Admin: Templates untuk Usaha */}
      {kategoriProp === 'usaha' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Template Dokumen Usaha (Admin)</h3>
              <p className="text-xs text-text-muted">Unggah atau ganti template Business Plan, Invoice, dan Laporan Bulanan di sini.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { key: 'business_plan', title: 'Template Business Plan' },
              { key: 'invoice', title: 'Template Invoice' },
              { key: 'monthly_report', title: 'Laporan Bulanan' }
            ].map(t => {
              const existing = templates.find(x => x.key === t.key) || {};
              return (
                <div key={t.key} className="rounded-2xl border border-border bg-bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm mb-1">{t.title}</h4>
                      <p className="text-xs text-text-muted mb-3">{existing.description || 'Belum ada deskripsi'}</p>
                      <div className="flex items-center gap-2">
                        {existing.file_name ? (
                          <>
                            <span className="text-[12px] font-semibold">{existing.file_name}</span>
                            <button onClick={() => {
                              if (existing.data) {
                                const a = document.createElement('a');
                                a.href = existing.data;
                                a.download = existing.file_name || 'template';
                                document.body.appendChild(a); a.click(); a.remove();
                              } else {
                                toast('Tidak ada data file pada template');
                              }
                            }} className="ml-2 px-3 py-1 text-xs rounded-full bg-primary text-white">Download</button>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted">Belum diunggah</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-xs">
                        Unggah
                        <input type="file" accept="*/*" style={{ display: 'none' }} onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const fileData = await validateAndReadFile(file);
                            if (fileData) await handleUploadTemplate(t.key, fileData, t.title, '');
                            e.target.value = '';
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-card/50 border-b border-border">
                {batchMode && <th className="p-4 w-10" />}
                <th className="p-4 text-xs text-text-primary font-bold uppercase tracking-wider">Judul / Detail</th>
                <th className="p-4 text-xs text-text-primary font-bold uppercase tracking-wider hidden md:table-cell">Deskripsi</th>
                <th className="p-4 text-xs text-text-primary font-bold uppercase tracking-wider hidden sm:table-cell">Link / Media</th>
                <th className="p-4 text-xs text-text-primary font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={batchMode ? 5 : 4} className="p-12 text-center text-text-muted text-sm italic">
                    Belum ada data tersedia di kategori ini.
                  </td>
                </tr>
              ) : filtered.map(item => {
                const isSelected = selected.has(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={batchMode ? () => toggleSelect(item.id) : undefined}
                    className={`transition-colors group ${batchMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-primary/5' : 'hover:bg-bg-card/30'}`}
                  >
                    {batchMode && (
                      <td className="p-4 w-10">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                          {isSelected && <FiCheckSquare size={12} className="text-white" />}
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.gambar && <img src={item.gambar} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="" />}
                        <div>
                          <p className="text-sm text-text-primary font-bold group-hover:text-primary transition-colors">{item.judul}</p>
                          {item.perusahaan && <p className="text-[10px] text-text-muted font-medium uppercase mt-0.5">{item.perusahaan} · {item.lokasi}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary max-w-[250px] truncate hidden md:table-cell">{item.deskripsi}</td>
                    <td className="p-4 text-sm text-text-muted hidden sm:table-cell">
                      {item.link_eksternal ? (
                        <a href={item.link_eksternal} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-primary/80 hover:text-primary hover:underline">
                          <FiExternalLink size={12} /> Buka Link
                        </a>
                      ) : (
                        <span className="text-[10px] bg-bg-surface px-2 py-1 rounded-md">Internal Content</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!batchMode && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all bg-transparent border-none cursor-pointer"><FiEdit3 size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all bg-transparent border-none cursor-pointer"><FiTrash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* ══════════════════════════════════════════
          MODAL — Tambah / Edit Data
          Semua styling pakai CSS variables admin
          agar otomatis benar di dark & light mode
      ══════════════════════════════════════════ */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 680,
              maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--ad-card)',
              border: '1px solid var(--ad-border)',
              borderRadius: 28,
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.1)',
              padding: '28px 28px 24px',
            }}
          >
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 4, height: 22, borderRadius: 4,
                    background: 'linear-gradient(180deg,#6C63FF,#FF6B9D)',
                    flexShrink: 0,
                  }} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ad-text)', lineHeight: 1 }}>
                    {editItem ? 'Edit Data' : 'Tambah Data Baru'}
                  </h2>
                </div>
                <span style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#6C63FF',
                  background: 'rgba(108,99,255,0.12)',
                  border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: 20, padding: '3px 12px',
                }}>
                  {kategoriProp}
                </span>
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--ad-input)',
                  border: '1px solid var(--ad-border)',
                  color: 'var(--ad-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,82,82,0.12)';
                  e.currentTarget.style.color = '#FF5252';
                  e.currentTarget.style.borderColor = 'rgba(255,82,82,0.3)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--ad-input)';
                  e.currentTarget.style.color = 'var(--ad-text-muted)';
                  e.currentTarget.style.borderColor = 'var(--ad-border)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <FiX size={17} />
              </button>
            </div>

            {/* ── Form Grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}>

              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Judul */}
                <MField label="Judul">
                  <MInput value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Masukkan judul..." />
                </MField>

                {/* Deskripsi */}
                <MField label="Deskripsi Singkat">
                  <MTextarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Tampilkan sebagai snippet di card..." rows={3} />
                </MField>

                {/* Link */}
                <MField label="Link Eksternal (Opsional)">
                  <MInput value={form.link_eksternal} onChange={e => setForm({ ...form, link_eksternal: e.target.value })} placeholder="https://..." />
                </MField>

                {/* Gambar */}
                <MField label="Gambar Cover">
                  <label
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      padding: form.gambar ? 8 : 24,
                      borderRadius: 14,
                      background: 'var(--ad-input)',
                      border: '2px dashed var(--ad-border)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)';
                      e.currentTarget.style.background = 'rgba(108,99,255,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--ad-border)';
                      e.currentTarget.style.background = 'var(--ad-input)';
                    }}
                  >
                    {form.gambar ? (
                      <img src={form.gambar} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10 }} alt="" />
                    ) : (
                      <>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: 'rgba(108,99,255,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#6C63FF',
                        }}>
                          <FiPlus size={20} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ad-text-muted)' }}>
                          Pilih File Gambar
                        </span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await validateAndReadImage(file);
                        if (base64) setForm({ ...form, gambar: base64 });
                        e.target.value = '';
                      }
                    }} />
                  </label>
                  {form.gambar && (
                    <button
                      onClick={() => setForm({ ...form, gambar: '' })}
                      style={{
                        marginTop: 6, fontSize: 10, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        color: '#FF5252', background: 'none', border: 'none', cursor: 'pointer',
                      }}
                    >
                      Hapus Gambar
                    </button>
                  )}
                </MField>

                {/* File lampiran dihapus — fitur tidak digunakan */}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {kategoriProp === 'lowongan' ? (
                  <div style={{
                    background: 'rgba(108,99,255,0.06)',
                    border: '1px solid rgba(108,99,255,0.18)',
                    borderRadius: 16, padding: 18,
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C63FF' }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Detail Pekerjaan
                      </span>
                    </div>
                    <MField label="Nama Perusahaan">
                      <MInput value={form.perusahaan} onChange={e => setForm({ ...form, perusahaan: e.target.value })} placeholder="Misal: Google Inc" />
                    </MField>
                    <MField label="Lokasi Utama">
                      <MSearchableSelect
                        value={form.lokasi}
                        onChange={val => setForm({ ...form, lokasi: val })}
                        options={ALL_LOCATIONS}
                        placeholder="Cari Kota/Kabupaten..."
                      />
                    </MField>
                    <MField label="Detail Lokasi">
                      <MInput value={form.detail_lokasi} onChange={e => setForm({ ...form, detail_lokasi: e.target.value })} placeholder="Kecamatan, Jalan, Gedung, dll" />
                    </MField>
                    <MField label="Tipe Pekerjaan">
                      <MSelect
                        value={form.tipe_pekerjaan}
                        onChange={e => setForm({ ...form, tipe_pekerjaan: e.target.value })}
                        options={['Full-Time', 'Part-Time', 'Contract', 'Freelance']}
                      />
                    </MField>
                    <MField label="Kategori Job">
                      <MSelect
                        value={form.is_magang ? 'true' : 'false'}
                        onChange={e => setForm({ ...form, is_magang: e.target.value === 'true' })}
                        options={[{label: 'Bukan Magang (Profesional)', value: 'false'}, {label: 'Magang (Internship)', value: 'true'}]}
                      />
                    </MField>
                  </div>
                ) : (
                  <MField label="Isi Konten / Artikel Lengkap" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <RichContentEditor
                      value={form.isi_konten}
                      onChange={val => setForm(prev => ({ ...prev, isi_konten: val }))}
                    />
                  </MField>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{
              marginTop: 24, paddingTop: 18,
              borderTop: '1px solid var(--ad-border)',
              display: 'flex', justifyContent: 'flex-end', gap: 10,
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  background: 'var(--ad-input)',
                  border: '1px solid var(--ad-border)',
                  color: 'var(--ad-text-sec)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ad-card-hover)'; e.currentTarget.style.color = 'var(--ad-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--ad-input)'; e.currentTarget.style.color = 'var(--ad-text-sec)'; }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg,#6C63FF,#9B59FF)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(108,99,255,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,99,255,0.4)'; }}
              >
                <FiSave size={16} /> Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Helper sub-components untuk form modal
   Semua pakai CSS variables admin
══════════════════════════════════════════ */
function MField({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--ad-text-muted)',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function MInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 14px',
        borderRadius: 12, fontSize: 13,
        background: 'var(--ad-input)',
        border: '1px solid var(--ad-border)',
        color: 'var(--ad-text)',
        outline: 'none', transition: 'border 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(108,99,255,0.6)';
        e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--ad-border)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

function MTextarea({ value, onChange, placeholder, rows = 4, style }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '10px 14px',
        borderRadius: 12, fontSize: 13,
        background: 'var(--ad-input)',
        border: '1px solid var(--ad-border)',
        color: 'var(--ad-text)',
        outline: 'none', resize: 'vertical',
        transition: 'border 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(108,99,255,0.6)';
        e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--ad-border)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

function MSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '10px 14px',
        borderRadius: 12, fontSize: 13,
        background: 'var(--ad-input)',
        border: '1px solid var(--ad-border)',
        color: 'var(--ad-text)',
        outline: 'none', cursor: 'pointer',
        transition: 'border 0.2s',
        boxSizing: 'border-box',
        appearance: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; }}
      onBlur={e  => { e.target.style.borderColor = 'var(--ad-border)'; }}
    >
      {options.map(o => {
        const isObj = typeof o === 'object';
        const val = isObj ? o.value : o;
        const lbl = isObj ? o.label : o;
        return (
          <option key={val} value={val} style={{ background: 'var(--ad-surface)', color: 'var(--ad-text)' }}>
            {lbl}
          </option>
        );
      })}
    </select>
  );
}

function MSearchableSelect({ value, onChange, options, placeholder = 'Pilih atau cari...' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '10px 14px',
          borderRadius: 12, fontSize: 13,
          background: 'var(--ad-input)',
          border: `1px solid ${open ? 'rgba(108,99,255,0.6)' : 'var(--ad-border)'}`,
          color: value ? 'var(--ad-text)' : 'var(--ad-text-muted)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || placeholder}
        </span>
        <FiChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'var(--ad-card)', border: '1px solid var(--ad-border)',
          borderRadius: 12, zIndex: 50,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <div style={{ padding: 8, borderBottom: '1px solid var(--ad-border)' }}>
            <input
              type="text"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ketik untuk mencari..."
              style={{
                width: '100%', padding: '8px 12px',
                borderRadius: 8, fontSize: 12,
                background: 'var(--ad-input)',
                border: '1px solid var(--ad-border)',
                color: 'var(--ad-text)', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: 4 }}>
            {filtered.length > 0 ? filtered.map(o => (
              <div
                key={o}
                onClick={() => { onChange(o); setOpen(false); setSearch(''); }}
                style={{
                  padding: '8px 12px', fontSize: 12, borderRadius: 8,
                  cursor: 'pointer', color: value === o ? '#6C63FF' : 'var(--ad-text)',
                  background: value === o ? 'rgba(108,99,255,0.1)' : 'transparent',
                  fontWeight: value === o ? 700 : 500,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (value !== o) e.currentTarget.style.background = 'var(--ad-input)'; }}
                onMouseLeave={e => { if (value !== o) e.currentTarget.style.background = 'transparent'; }}
              >
                {o}
              </div>
            )) : (
              <div style={{ padding: '12px', fontSize: 12, color: 'var(--ad-text-muted)', textAlign: 'center' }}>
                Tidak ada hasil
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
