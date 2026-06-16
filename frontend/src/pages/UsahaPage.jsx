import React, { useState, useEffect, useMemo } from 'react';
import {
  FiExternalLink,
  FiArrowRight,
  FiDownload,
  FiFileText,
  FiX,
  FiBookOpen,
  FiFolder,
  FiTool,
  FiZap,
  FiClipboard,
  FiPrinter,
  FiBarChart2,
  FiEdit3,
  FiGrid,
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RichContentRenderer from '../components/RichContentRenderer';

// Business templates are fetched from server (admin-managed)

const RESOURCE_TOOLS = [
  {
    title: 'Canva',
    description: 'Buat poster, katalog, dan konten promosi untuk produkmu.',
    url: 'https://www.canva.com/',
    Icon: FiEdit3,
  },
  {
    title: 'Google Sheets',
    description: 'Catat modal, stok, penjualan, dan arus kas usaha kecil.',
    url: 'https://docs.google.com/spreadsheets/',
    Icon: FiBarChart2,
  },
  {
    title: 'Trello',
    description: 'Atur daftar tugas produksi, pemasaran, dan follow-up pelanggan.',
    url: 'https://trello.com/',
    Icon: FiGrid,
  },
];

const parseFiles = (value) => {
  if (!value) return [];
  try {
    const files = JSON.parse(value);
    return Array.isArray(files) ? files : [];
  } catch {
    return [];
  }
};

export default function UsahaPage() {
  const [usahaItems, setUsahaItems] = useState([]);
  const [businessTemplates, setBusinessTemplates] = useState([]);
  const [keuanganItems, setKeuanganItems] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [activeResourcePanel, setActiveResourcePanel] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromHash = (hash) => {
    const map = { '#memulai': 'memulai', '#resources': 'resources', '#keuangan': 'keuangan', '#kalkulator': 'kalkulator' };
    return map[hash] || 'memulai';
  };
  const [activeTab, setActiveTab] = useState(() => getTabFromHash(location.hash));

  useEffect(() => {
    setActiveTab(getTabFromHash(location.hash));
  }, [location.hash]);

  useEffect(() => {
    api.getContents('usaha').then((data) => { if (Array.isArray(data)) setUsahaItems(data); }).catch(console.error);
    api.getContents('keuangan').then((data) => { if (Array.isArray(data)) setKeuanganItems(data); }).catch(console.error);
    api.getTemplates().then((t) => { if (Array.isArray(t)) setBusinessTemplates(t); }).catch(() => setBusinessTemplates([]));
  }, []);

  // Scroll to top when an article is opened
  useEffect(() => {
    if (selectedContent) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedContent]);

  // Close article when navigating via sidebar
  useEffect(() => {
    setSelectedContent(null);
  }, [location.pathname, location.hash]);

  // templates fetched from server

  const openContentDetail = (item) => {
    setSelectedContent(item);
  };

  const closeContentModal = () => {
    setSelectedContent(null);
  };

  const downloadTemplateFile = (template) => {
    if (template.data) {
      // assume data is data URL
      const link = document.createElement('a');
      link.href = template.data;
      link.download = template.file_name || template.fileName || (template.title || 'template') + '.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${template.title || template.key} berhasil diunduh`);
      return;
    }
    // fallback: plain text content
    if (template.content) {
      const blob = new Blob([template.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = template.fileName || 'template.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`${template.title} berhasil diunduh`);
      return;
    }
    toast.error('Template tidak tersedia untuk diunduh');
  };

  // download handled by downloadTemplateFile for templates

  const openResourcePanel = (panel) => {
    setActiveResourcePanel(panel);
    window.setTimeout(() => {
      document.getElementById(`resource-${panel}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  const openExternalResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resourceCards = [
    {
      key: 'articles',
      title: 'Articles',
      description: 'Kumpulan artikel menarik tentang merintis bisnis skala kecil.',
      actionLabel: 'Buka Artikel',
      Icon: FiBookOpen,
      onClick: () => navigate('/usaha#memulai', { replace: true }),
    },
    {
      key: 'templates',
      title: 'Resources',
      description: 'Dokumen template bisnis plan, invoice, dan laporan bulanan.',
      actionLabel: 'Lihat Template',
      Icon: FiFolder,
      onClick: () => openResourcePanel('templates'),
    },
    {
      key: 'tools',
      title: 'Resource Tools',
      description: 'Rekomendasi alat bantu produktivitas dan operasional.',
      actionLabel: 'Lihat Tools',
      Icon: FiTool,
      onClick: () => openResourcePanel('tools'),
    },
  ];

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden bg-[#F8FAFC] dark:bg-black transition-colors duration-300">
      {/* Background Ornaments like Beranda */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-red-50/50 dark:bg-red-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

      {!selectedContent ? (
        <>
          {/* HEADER */}
          <section className="pt-32 pb-14 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-slate-100/50 dark:border-zinc-800 mb-5 hover:shadow-md transition-shadow">
          <FiZap className="text-blue-600" size={18} />
          <span className="text-[11px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-[0.25em]">Mulai Langkah Pertamamu</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-blue-950 dark:text-white tracking-tight uppercase mb-3 drop-shadow-sm transition-colors">
          Usaha
        </h1>
        <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-600 dark:from-red-400 dark:to-blue-500 tracking-[0.1em]">
          Entrepreneurship
        </p>
      </section>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 space-y-12 relative z-10">

        {/* Tab Sub Menu */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => navigate('/usaha#memulai', { replace: true })}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'memulai' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-blue-200/50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
          >
            Tips Memulai Usaha
          </button>
          <button
            onClick={() => navigate('/usaha#resources', { replace: true })}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'resources' ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-red-200/50 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            Resources
          </button>
          <button
            onClick={() => navigate('/usaha#keuangan', { replace: true })}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'keuangan' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-blue-200/50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
          >
            Tips Mengatur Keuangan
          </button>
          <button
            onClick={() => navigate('/usaha#kalkulator', { replace: true })}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'kalkulator' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-indigo-200/50 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
          >
            🧮 Kalkulator Usaha
          </button>
        </div>

        {/* Tips memulai usaha */}
        {activeTab === 'memulai' && (
        <section className="scroll-mt-32 animate-[slideUp_0.35s_ease-out]">
          <h2 className="text-xl font-black text-blue-950 dark:text-white mb-4 transition-colors">Tips Memulai Usaha</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {usahaItems.length > 0 ? usahaItems.map((item, index) => (
              <div key={item.id} onClick={() => openContentDetail(item)} className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 shadow-sm border border-slate-50 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="relative w-full h-36 mb-4 rounded-[16px] overflow-hidden">
                  <img src={item.gambar || `https://images.unsplash.com/photo-${1522071820081 + index}?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.judul} onError={(event) => { event.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" }} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <h4 className="font-bold text-blue-950 dark:text-slate-100 text-[15px] mb-2 leading-snug group-hover:text-blue-600 transition-colors">{item.judul}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-2">{item.deskripsi || 'Klik untuk membaca selengkapnya'}</p>
                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">Baca Tips</span>
                  <FiArrowRight size={14} className="text-blue-400" />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-500">Belum ada tips divalidasi.</div>
            )}
          </div>
        </section>
        )}

        {/* Resources Articles */}
        {activeTab === 'resources' && (
        <section className="animate-[slideUp_0.35s_ease-out]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourceCards.map((card) => {
              const Icon = card.Icon;
              const isActive = activeResourcePanel === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={card.onClick}
                  className={`bg-red-50 dark:bg-zinc-900 rounded-[24px] p-6 text-center border hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group ${isActive ? 'border-red-300 dark:border-red-500/50 shadow-md shadow-red-500/10' : 'border-red-100 dark:border-zinc-800'}`}
                  aria-label={`${card.actionLabel} ${card.title}`}
                >
                  <h4 className="font-bold text-red-600 dark:text-red-400 text-base mb-2">{card.title}</h4>
                  <p className="text-[12px] text-red-600/80 dark:text-slate-400 mb-5 font-medium leading-relaxed px-4">{card.description}</p>
                  <div className="w-14 h-14 mx-auto bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400 shadow-sm border border-red-50 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                    <Icon size={25} />
                  </div>
                  <span className="mt-5 inline-flex items-center justify-center gap-2 text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                    {card.actionLabel}
                    <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              );
            })}
          </div>

          {activeResourcePanel === 'templates' && (
            <div id="resource-templates" className="mt-8 rounded-[28px] border border-red-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm scroll-mt-32">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-black text-blue-950 dark:text-white">Template Dokumen Usaha</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Download template dasar yang bisa langsung kamu edit.</p>
                </div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Resources</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {businessTemplates.length > 0 ? businessTemplates.map((template) => {
                  const Icon = template.Icon || FiFolder;
                  return (
                    <div key={template.key || template.file_name} className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/30 p-4">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 flex items-center justify-center shadow-sm mb-3">
                        <Icon size={20} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{template.title || template.key}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{template.description}</p>
                      <button
                        type="button"
                        onClick={() => downloadTemplateFile(template)}
                        className="inline-flex items-center gap-2 text-[11px] font-black text-white bg-red-500 hover:bg-red-600 rounded-full px-4 py-2 border-none cursor-pointer transition-colors"
                      >
                        Download <FiDownload size={13} />
                      </button>
                    </div>
                  );
                }) : (
                  <div className="col-span-full text-center text-slate-500">Template belum tersedia.</div>
                )}
              </div>
            </div>
          )}

          {activeResourcePanel === 'tools' && (
            <div id="resource-tools" className="mt-8 rounded-[28px] border border-red-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm scroll-mt-32">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-black text-blue-950 dark:text-white">Resource Tools</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Pilih alat bantu sesuai kebutuhan operasional usahamu.</p>
                </div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Tools</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RESOURCE_TOOLS.map((tool) => {
                  const Icon = tool.Icon;
                  return (
                    <button
                      key={tool.title}
                      type="button"
                      onClick={() => openExternalResource(tool.url)}
                      className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/30 p-4 text-left hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 flex items-center justify-center shadow-sm mb-3">
                        <Icon size={20} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{tool.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{tool.description}</p>
                      <span className="inline-flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-wider">
                        Buka Tool
                        <FiExternalLink size={13} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        )}

        {/* Tips mengatur keuangan grid */}
        {activeTab === 'keuangan' && (
        <section className="scroll-mt-32 animate-[slideUp_0.35s_ease-out]">
          <h2 className="text-xl font-black text-blue-950 dark:text-white mb-4 transition-colors">Tips Mengatur Keuangan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {keuanganItems.length > 0 ? keuanganItems.map((item) => (
              <div key={item.id} onClick={() => openContentDetail(item)} className="bg-blue-50 dark:bg-zinc-900 rounded-[24px] p-5 text-center border border-blue-100 dark:border-zinc-800 hover:shadow-md hover:scale-[1.03] transition-all cursor-pointer group flex flex-col items-center">
                {item.gambar && (
                  <div className="w-full h-24 mb-4 rounded-xl overflow-hidden shrink-0">
                    <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-bold text-blue-900 dark:text-blue-400 text-[13px] mb-4 group-hover:text-blue-600 transition-colors">{item.judul}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-3 mb-4">{item.deskripsi || 'Baca selengkapnya...'}</p>
                <div className="flex justify-center mt-auto">
                  <FiArrowRight className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-500">Belum ada tips keuangan divalidasi.</div>
            )}
          </div>
        </section>
        )}
        {/* ── Kalkulator Usaha ── */}
        {activeTab === 'kalkulator' && (
          <KalkulatorUsaha />
        )}

      </div>
        </>
      ) : (
        <div className="animate-[slideUp_0.35s_ease-out] w-full bg-white dark:bg-zinc-950 flex flex-col">
          {/* Sticky Close Header */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
            <button onClick={closeContentModal} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer">
              <FiX size={20} /> Tutup Artikel
            </button>
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm capitalize">
              {selectedContent.kategori || 'Usaha'}
            </span>
          </div>

          {/* Full Image */}
          {selectedContent.gambar ? (
            <div className={`w-full flex justify-center items-center py-8 bg-slate-100/50 dark:bg-zinc-900/50`}>
              <img src={selectedContent.gambar} alt={selectedContent.judul} className="max-w-full max-h-[60vh] object-contain shadow-sm rounded-lg" />
            </div>
          ) : (
            <div className={`w-full h-48 flex items-center justify-center text-6xl opacity-30 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40`}>
              <FiFileText size={56} />
            </div>
          )}

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12 pb-24 w-full flex-grow">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
              {selectedContent.judul}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
              {selectedContent.deskripsi}
            </p>

            <div className="prose dark:prose-invert max-w-none">
              <RichContentRenderer content={selectedContent.isi_konten} />
            </div>

            {selectedContent.link_eksternal && (
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => window.open(selectedContent.link_eksternal, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2 text-blue-600 font-black text-sm hover:gap-3 transition-all cursor-pointer bg-transparent border-none"
                >
                  Kunjungi Sumber Eksternal <FiExternalLink />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   KALKULATOR USAHA
   Hitung modal, harga jual, dan keuntungan
══════════════════════════════════════════ */
function KalkulatorUsaha() {
  const [biayaBahan, setBiayaBahan] = useState('');
  const [biayaOperasional, setBiayaOperasional] = useState('');
  const [biayaLain, setBiayaLain] = useState('');
  const [unitProduksi, setUnitProduksi] = useState('');
  const [persentaseProfit, setPersentaseProfit] = useState('30');
  const [result, setResult] = useState(null);

  const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n));
  const parse = (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;

  const handleHitung = () => {
    const bahan = parse(biayaBahan);
    const ops   = parse(biayaOperasional);
    const lain  = parse(biayaLain);
    const unit  = parse(unitProduksi);
    const pct   = parse(persentaseProfit);

    if (unit <= 0) { alert('Unit produksi harus lebih dari 0'); return; }

    const totalModal       = bahan + ops + lain;
    const hppPerUnit       = totalModal / unit;
    const profit           = hppPerUnit * (pct / 100);
    const hargaJualPerUnit = hppPerUnit + profit;
    const totalPendapatan  = hargaJualPerUnit * unit;
    const totalProfit      = totalPendapatan - totalModal;
    const bep              = totalModal / hargaJualPerUnit;

    setResult({ totalModal, hppPerUnit, hargaJualPerUnit, totalPendapatan, totalProfit, bep, unit, pct });
  };

  const handleReset = () => {
    setBiayaBahan(''); setBiayaOperasional(''); setBiayaLain('');
    setUnitProduksi(''); setPersentaseProfit('30'); setResult(null);
  };

  const inputStyle = "w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-semibold text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all";
  const labelStyle = "block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <section className="animate-[slideUp_0.35s_ease-out]">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 px-4 py-1.5 rounded-full mb-4">
          <span className="text-blue-600 text-sm">🧮</span>
          <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Kalkulator Bisnis</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Kalkulator Modal & Harga Jual</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
          Hitung modal produksi, tentukan harga jual yang tepat, dan lihat estimasi keuntunganmu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Form Input ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm p-7 space-y-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <span className="text-base">📦</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Data Produksi</p>
              <p className="text-[11px] text-slate-400">Isi semua kolom biaya di bawah</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Biaya Bahan Baku (Rp)</label>
              <input type="number" min="0" value={biayaBahan} onChange={e => setBiayaBahan(e.target.value)}
                placeholder="Contoh: 500000" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Biaya Operasional (Rp)</label>
              <input type="number" min="0" value={biayaOperasional} onChange={e => setBiayaOperasional(e.target.value)}
                placeholder="Listrik, gas, dll" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Biaya Lain-lain (Rp)</label>
              <input type="number" min="0" value={biayaLain} onChange={e => setBiayaLain(e.target.value)}
                placeholder="Kemasan, ongkir, dll" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Jumlah Unit Produksi</label>
              <input type="number" min="1" value={unitProduksi} onChange={e => setUnitProduksi(e.target.value)}
                placeholder="Misal: 100 pcs" className={inputStyle} />
            </div>
          </div>

          {/* Profit slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelStyle + ' mb-0'}>Target Keuntungan</label>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{persentaseProfit}%</span>
            </div>
            <input
              type="range" min="5" max="200" step="5"
              value={persentaseProfit}
              onChange={e => setPersentaseProfit(e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>5%</span><span>50%</span><span>100%</span><span>200%</span>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleHitung}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              Hitung Sekarang ✨
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border-none cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ── Hasil ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm p-7">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="text-5xl opacity-30">📊</div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-600">
                Isi data produksi lalu klik<br /><span className="text-blue-500">Hitung Sekarang</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-[slideUp_0.3s_ease-out]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📈</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Hasil Perhitungan</p>
                  <p className="text-[11px] text-slate-400">{result.unit} unit · profit {result.pct}%</p>
                </div>
              </div>

              {/* Kartu hasil utama */}
              <div className="grid grid-cols-2 gap-3">
                <ResultCard
                  label="Total Modal"
                  value={`Rp ${fmt(result.totalModal)}`}
                  sub="Seluruh biaya produksi"
                  color="blue"
                  emoji="💰"
                />
                <ResultCard
                  label="HPP / Unit"
                  value={`Rp ${fmt(result.hppPerUnit)}`}
                  sub="Harga Pokok Produksi"
                  color="indigo"
                  emoji="🏷️"
                />
                <ResultCard
                  label="Harga Jual / Unit"
                  value={`Rp ${fmt(result.hargaJualPerUnit)}`}
                  sub={`Sudah termasuk profit ${result.pct}%`}
                  color="emerald"
                  emoji="🛒"
                  highlight
                />
                <ResultCard
                  label="Estimasi Profit"
                  value={`Rp ${fmt(result.totalProfit)}`}
                  sub={`Dari ${result.unit} unit terjual`}
                  color="amber"
                  emoji="✨"
                />
              </div>

              {/* BEP */}
              <div className="mt-2 p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Break Even Point (BEP)</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {fmt(result.bep)} <span className="text-sm font-semibold text-slate-400">unit</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kamu mulai untung setelah jual {Math.ceil(result.bep)} unit</p>
                  </div>
                  <div className="text-3xl">⚖️</div>
                </div>
                {/* BEP progress bar */}
                <div className="mt-3 w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min((result.bep / result.unit) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                  BEP = {Math.round((result.bep / result.unit) * 100)}% dari total produksi
                </p>
              </div>

              {/* Tips singkat */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
                  💡 <strong>Tips:</strong> Pastikan harga jualmu kompetitif dengan produk sejenis di pasaran. Jika terlalu tinggi, pertimbangkan efisiensi produksi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, sub, color, emoji, highlight }) {
  const colors = {
    blue:    'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30',
    indigo:  'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30',
    amber:   'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30',
  };
  const textColors = {
    blue: 'text-blue-700 dark:text-blue-300',
    indigo: 'text-indigo-700 dark:text-indigo-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} ${highlight ? 'ring-2 ring-emerald-400/30' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-base">{emoji}</span>
      </div>
      <p className={`text-base font-black ${textColors[color]} leading-tight`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{sub}</p>
    </div>
  );
}
