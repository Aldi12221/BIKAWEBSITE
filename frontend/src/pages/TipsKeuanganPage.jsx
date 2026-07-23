import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiArrowRight, FiDownload, FiFileText, FiX, FiChevronLeft } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import RichContentRenderer from '../components/RichContentRenderer';

export default function TipsKeuanganPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.getContents('keuangan')
            .then(d => { if (Array.isArray(d)) setItems(d); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Close article when navigating via sidebar
    useEffect(() => {
        setSelectedContent(null);
    }, [location.pathname, location.hash]);

    // Scroll to top when an article is opened
    useEffect(() => {
        if (selectedContent) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedContent]);

    return (
        <div className="min-h-screen pb-24 overflow-x-hidden bg-[#F8FAFC] dark:bg-black transition-colors duration-300">
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

            {!selectedContent ? (
                <>
                    <section className="pt-12 pb-10 text-center relative z-10 px-6">
                        <button
                            onClick={() => navigate('/usaha')}
                            className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <FiChevronLeft size={16} /> Kembali ke Menu Usaha
                        </button>

                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-slate-100/50 dark:border-zinc-800 mb-5">
                            <span className="text-emerald-600 text-lg">💰</span>
                            <span className="text-[11px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-[0.25em]">Kelola Keuanganmu</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-blue-950 dark:text-white tracking-tight mb-3 drop-shadow-sm">
                            Tips Mengatur Keuangan
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
                            Pelajari cara mengelola keuangan usahamu agar tetap sehat dan terus berkembang.
                        </p>
                    </section>

                    <div className="max-w-5xl mx-auto px-6 relative z-10">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-slate-100 dark:border-zinc-800 animate-pulse">
                                        <div className="w-full h-24 bg-slate-100 dark:bg-zinc-800 rounded-xl mb-4" />
                                        <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded mb-2" />
                                        <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : items.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedContent(item)}
                                        className="bg-emerald-50 dark:bg-zinc-900 rounded-[24px] p-5 text-center border border-emerald-100 dark:border-zinc-800 hover:shadow-lg hover:scale-[1.03] transition-all cursor-pointer group flex flex-col items-center"
                                    >
                                        {item.gambar && (
                                            <div className="w-full h-24 mb-4 rounded-xl overflow-hidden shrink-0">
                                                <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        )}
                                        <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-[13px] mb-2 group-hover:text-emerald-600 transition-colors leading-snug">{item.judul}</h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-3 mb-4">{item.deskripsi || 'Baca selengkapnya...'}</p>
                                        <div className="flex justify-center mt-auto">
                                            <FiArrowRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400 italic">Belum ada tips keuangan yang tersedia.</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="animate-[slideUp_0.35s_ease-out] w-full bg-white dark:bg-zinc-950 flex flex-col">
                    {/* Sticky Close Header */}
                    <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
                        <button onClick={() => setSelectedContent(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer">
                            <FiX size={20} /> Tutup Artikel
                        </button>
                        <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm">Mengatur Keuangan</span>
                    </div>

                    {/* Full Image */}
                    {selectedContent.gambar ? (
                        <div className="w-full bg-slate-100/50 dark:bg-zinc-900/50 flex justify-center items-center py-8">
                            <img src={selectedContent.gambar} alt={selectedContent.judul} className="max-w-full max-h-[60vh] object-contain shadow-sm rounded-lg" />
                        </div>
                    ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center text-6xl opacity-30">
                            💰
                        </div>
                    )}

                    {/* Content */}
                    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12 pb-24 w-full flex-grow">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">{selectedContent.judul}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base mb-8 pb-6 border-b border-slate-100 dark:border-white/5">{selectedContent.deskripsi}</p>
                        <div className="prose dark:prose-invert max-w-none">
                            <RichContentRenderer content={selectedContent.isi_konten} />
                        </div>
                        {selectedContent.link_eksternal && (
                            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                                <button onClick={() => window.open(selectedContent.link_eksternal, '_blank')} className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:gap-3 transition-all cursor-pointer bg-transparent border-none">
                                    Kunjungi Sumber Eksternal <FiExternalLink />
                                </button>
                            </div>
                        )}
                        {selectedContent.file_tambahan && (() => {
                            try {
                                const files = JSON.parse(selectedContent.file_tambahan);
                                if (files.length === 0) return null;
                                return (
                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">File Lampiran</h4>
                                        <div className="flex flex-col gap-3">
                                            {files.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><FiFileText size={20} /></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{file.name}</p>
                                                            <p className="text-[10px] font-medium text-slate-400 uppercase">{file.type?.split('/')[1] || 'File'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (!user) { toast.error('Silakan login untuk mendownload'); navigate('/login'); return; }
                                                            const link = document.createElement('a'); link.href = file.data; link.download = file.name; link.click();
                                                        }}
                                                        className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors border-none cursor-pointer"
                                                    ><FiDownload size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } catch { return null; }
                        })()}
                    </div>
                </div>
            )}
            <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width:6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background:#334155; }
      `}</style>
        </div>
    );
}
