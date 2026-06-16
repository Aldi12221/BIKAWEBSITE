import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlay, FiBookOpen, FiMessageCircle, FiX, FiExternalLink, FiArrowRight, FiDownload, FiFileText } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function TutorialPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [videoTutorials, setVideoTutorials] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab with URL hash (e.g. /tutorial#bank_kuis)
  const getTabFromHash = (hash) => {
    const map = { '#bank_kuis': 'bank_kuis', '#wawancara': 'wawancara', '#asesmen': 'asesmen' };
    return map[hash] || 'bank_kuis';
  };
  const [activeTab, setActiveTab] = useState(() => getTabFromHash(location.hash));

  useEffect(() => {
    setActiveTab(getTabFromHash(location.hash));
  }, [location.hash]);
  const { user } = useAuth();
  const regularQuizzes = quizzes.filter((quiz) => quiz.kategori !== 'psikotes');
  const assessmentQuizzes = quizzes.filter((quiz) => quiz.kategori === 'psikotes');

  const getQuizLabel = (kategori) => {
    if (kategori === 'psikotes') return 'Psikotes';
    if (kategori === 'umum') return 'Quiz Biasa';
    return kategori || 'Quiz';
  };
  const isPsychotestQuiz = selectedQuiz?.kategori === 'psikotes';

  useEffect(() => {
    api.getQuizzes().then(d => {
      if (Array.isArray(d)) setQuizzes(d);
    }).catch(console.error);

    api.getContents('tutorial').then(d => {
      if (Array.isArray(d)) setTutorials(d);
    }).catch(console.error);

    api.getVideoTutorials().then(d => {
      if (Array.isArray(d)) setVideoTutorials(d.filter(v => v.is_published !== false));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // only prevent body scroll for modals that cover the whole app (quiz detail or article)
    if (selectedQuiz || selectedContent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedQuiz, selectedContent]);

  // Scroll to top when an article is opened
  useEffect(() => {
    if (selectedContent) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedContent]);

  // Close article when navigating via sidebar
  useEffect(() => {
    setSelectedContent(null);
    setSelectedQuiz(null);
  }, [location.pathname, location.hash]);

  const openContentDetail = (item) => {
    setSelectedContent(item);
  };

  const closeContentModal = () => {
    setSelectedContent(null);
  };

  const openQuizDetail = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const closeQuizModal = () => {
    setSelectedQuiz(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black overflow-x-hidden transition-colors duration-300 font-sans pb-24">
      {/* --- BACKGROUND ORNAMENTS --- */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 dark:bg-rose-900/10 rounded-full blur-[150px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 dark:bg-red-900/10 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

      {!selectedContent && !selectedVideo ? (
        <>
          {/* Header */}
          <div className="text-center pt-32 pb-14 relative z-10">
            <div className="inline-flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 border border-rose-200/50 dark:border-rose-900/30 px-5 py-2 rounded-full mb-5 shadow-sm backdrop-blur-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Platform Pembelajaran</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors mb-4">
              Tuto<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">rial</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium transition-colors">
              Learning <span className="font-light italic">&</span> Testing
            </p>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 relative z-10">

            {/* Tab Sub Menu */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => navigate('/tutorial#bank_kuis', { replace: true })}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'bank_kuis' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
              >
                Bank Kuis
              </button>
              <button
                onClick={() => navigate('/tutorial#wawancara', { replace: true })}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'wawancara' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
              >
                Tips & Trick Wawancara
              </button>
              <button
                onClick={() => navigate('/tutorial#asesmen', { replace: true })}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeTab === 'asesmen' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-violet-200/50 dark:border-violet-900/30 hover:bg-violet-50 dark:hover:bg-violet-900/20'}`}
              >
                Tes Asesmen
              </button>
            </div>

            {/* 1. Bank Kuis Section */}
            {activeTab === 'bank_kuis' && (
              <div className="bg-rose-500/80 dark:bg-rose-900/40 rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 shadow-sm border border-rose-200 dark:border-rose-900/50 transition-colors animate-[slideUp_0.35s_ease-out]">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/30 dark:bg-black/20 rounded-xl flex items-center justify-center text-white">
                    <FiBookOpen className="text-xl" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Bank Kuis</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {regularQuizzes.length > 0 ? regularQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => openQuizDetail(quiz)}
                      className="group flex items-center gap-3 bg-white/95 dark:bg-white/10 rounded-2xl overflow-hidden p-2 shadow-sm hover:shadow-lg sm:block sm:p-0 sm:hover:scale-[1.03] sm:hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Quiz Image */}
                      <div className="relative h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 overflow-hidden sm:h-40 sm:w-full sm:rounded-none">
                        {quiz.gambar ? (
                          <img src={quiz.gambar} alt={quiz.judul} className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl opacity-50">
                            📝
                          </div>
                        )}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <span className="block max-w-[4.5rem] truncate rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-black uppercase text-rose-600 backdrop-blur-sm dark:bg-black/50 dark:text-rose-300 sm:max-w-none sm:px-3 sm:py-1 sm:text-[10px]">
                            {getQuizLabel(quiz.kategori)}
                          </span>
                        </div>
                      </div>

                      {/* Quiz Info */}
                      <div className="min-w-0 flex-1 p-2 sm:p-4">
                        <h4 className="font-black text-[13px] sm:text-[15px] text-slate-800 dark:text-white leading-tight mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                          {quiz.judul}
                        </h4>
                        <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-300 leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {quiz.deskripsi || 'Klik untuk melihat detail quiz'}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-100 dark:border-white/10">
                          <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400">Lihat Detail</span>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <FiArrowRight className="text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-8 text-center text-white/80">
                      <p className="text-lg font-bold mb-1">Belum ada quiz biasa tersedia</p>
                      <p className="text-sm opacity-70">Quiz biasa akan segera ditambahkan</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Tips & Trick Wawancara Section */}
            {activeTab === 'wawancara' && (
              <div className="bg-rose-500/80 dark:bg-rose-900/40 rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 shadow-sm border border-rose-200 dark:border-rose-900/50 transition-colors animate-[slideUp_0.35s_ease-out]">
                <div className="flex items-center gap-3 mb-4 sm:mb-8">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/30 dark:bg-black/20 rounded-xl flex items-center justify-center text-white">
                    <FiMessageCircle className="text-xl" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Tips & Trick Wawancara</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  {/* Left Column - Articles */}
                  <div className="space-y-3 sm:space-y-4">
                    {tutorials.length > 0 ? tutorials.map((item) => (
                      <div key={item.id} onClick={() => openContentDetail(item)} className="flex items-center gap-3 sm:gap-4 bg-white/90 dark:bg-white/10 rounded-2xl p-2 sm:p-3 hover:shadow-md sm:hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 dark:bg-black/30 rounded-xl overflow-hidden shrink-0">
                          <img src={item.gambar || `https://ui-avatars.com/api/?name=${item.judul}&background=cbd5e1&color=475569`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-[13px] text-slate-800 dark:text-white leading-tight mb-1 line-clamp-1">{item.judul}</h4>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 line-clamp-1">{item.deskripsi ? item.deskripsi.substring(0, 50) + '...' : 'Klik untuk membaca selengkapnya'}</p>
                        </div>
                        <FiArrowRight className="text-slate-400 group-hover:text-rose-500" />
                      </div>
                    )) : (
                      <div className="py-4 text-white/80">Belum ada tutorial...</div>
                    )}
                  </div>

                  {/* Right Column - Videos */}
                  <div className="space-y-3 sm:space-y-4">
                    {videoTutorials.length > 0 ? videoTutorials.slice(0, 3).map((video) => (
                      <div key={video.id} onClick={() => video.video_url && setSelectedVideo(video)} className="flex items-center gap-3 sm:gap-4 bg-[#4A3B3B] dark:bg-zinc-900 rounded-2xl p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer border border-[#5A4B4B] dark:border-zinc-800">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/50 rounded-xl flex items-center justify-center text-white shrink-0 relative overflow-hidden">
                          {video.gambar ? <img src={video.gambar} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" /> : <div className="absolute inset-0 bg-rose-500/20"></div>}
                          <FiPlay className="text-xl relative z-10 ml-1" fill="currentColor" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[13px] text-white leading-tight mb-1 line-clamp-1">{video.judul}</h4>
                          <p className="text-[10px] font-medium text-slate-400">Tonton Sekarang</p>
                        </div>
                      </div>
                    )) : (
                      <div className="py-4 text-white/80">Belum ada video tutorial tersedia</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Tes Asesmen Section */}
            {activeTab === 'asesmen' && (
              <div className="bg-violet-600/85 dark:bg-violet-950/45 rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 shadow-sm border border-violet-200/60 dark:border-violet-900/50 transition-colors relative overflow-hidden animate-[slideUp_0.35s_ease-out]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 sm:mb-8 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center text-white">
                        <FiFileText className="text-xl" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Tes Asesmen</h2>
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-2xl">
                      Latihan psikotes untuk persiapan seleksi, asesmen, dan proses rekrutmen.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 relative z-10">
                  {assessmentQuizzes.length > 0 ? assessmentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => openQuizDetail(quiz)}
                      className="group flex items-center gap-3 bg-white/95 dark:bg-white/10 rounded-2xl overflow-hidden p-2 shadow-sm hover:shadow-lg sm:block sm:p-0 sm:hover:scale-[1.03] sm:hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 overflow-hidden sm:h-40 sm:w-full sm:rounded-none">
                        {quiz.gambar ? (
                          <img src={quiz.gambar} alt={quiz.judul} className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl opacity-50">
                            🧠
                          </div>
                        )}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <span className="block max-w-[4.5rem] truncate rounded-full bg-violet-500/80 px-2 py-0.5 text-[8px] font-black uppercase text-white backdrop-blur-sm sm:max-w-none sm:px-3 sm:py-1 sm:text-[10px]">
                            {getQuizLabel(quiz.kategori)}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 p-2 sm:p-4">
                        <h4 className="font-black text-[13px] sm:text-[15px] text-slate-800 dark:text-white leading-tight mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                          {quiz.judul}
                        </h4>
                        <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-300 leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {quiz.deskripsi || 'Klik untuk melihat detail psikotes'}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-100 dark:border-white/10">
                          <span className="text-[11px] font-bold text-violet-500 dark:text-violet-300">Lihat Detail</span>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/50 text-violet-500 dark:text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                            <FiArrowRight className="text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-8 text-center text-white/80">
                      <p className="text-lg font-bold mb-1">Belum ada tes asesmen tersedia</p>
                      <p className="text-sm opacity-70">Psikotes akan ditampilkan di sini</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </>
      ) : selectedContent ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-zinc-950">
          {/* Sticky Close Header */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
            <button onClick={closeContentModal} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer">
              <FiX size={20} /> Tutup Artikel
            </button>
            <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm">Tutorial</span>
          </div>

          {/* Full Image */}
          {selectedContent.gambar ? (
            <div className={`w-full flex justify-center items-center py-8 bg-slate-100/50 dark:bg-zinc-900/50`}>
              <img src={selectedContent.gambar} alt={selectedContent.judul} className="max-w-full max-h-[60vh] object-contain shadow-sm rounded-lg" />
            </div>
          ) : (
            <div className={`w-full h-48 flex items-center justify-center text-6xl opacity-30 ${isPsychotestQuiz ? 'bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40' : 'bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/40 dark:to-orange-900/40'}`}>
              📰
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
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base sm:text-lg font-medium">
                {selectedContent.isi_konten}
              </div>
            </div>

            {selectedContent.link_eksternal && (
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => window.open(selectedContent.link_eksternal, '_blank')}
                  className="flex items-center gap-2 text-rose-500 font-black text-sm hover:gap-3 transition-all cursor-pointer bg-transparent border-none"
                >
                  Kunjungi Sumber Eksternal <FiExternalLink />
                </button>
              </div>
            )}

            {/* File Tambahan */}
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
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                              <FiFileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{file.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase">{file.type?.split('/')[1] || 'File'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (!user) {
                                toast.error('Silakan login untuk mendownload lampiran');
                                navigate('/login');
                                return;
                              }
                              const link = document.createElement('a');
                              link.href = file.data;
                              link.download = file.name;
                              link.click();
                            }}
                            className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 cursor-pointer border-none"
                          >
                            <FiDownload size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch { return null; }
            })()}
          </div>
        </div>
      ) : selectedVideo ? (
        <div className="animate-[slideUp_0.35s_ease-out] w-full bg-white dark:bg-zinc-950 flex flex-col">
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
            <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer">
              <FiX size={20} /> Tutup Video
            </button>
            <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm">Video Tutorial</span>
          </div>

          <div className={`w-full flex justify-center items-center py-6 bg-black`}> 
            <div className="w-full max-w-6xl h-[60vh] bg-black flex items-center justify-center">
              {(() => {
                const url = selectedVideo.video_url || '';
                const isYouTube = /youtu\.be|youtube\.com/.test(url);
                if (isYouTube) {
                  let embed = url;
                  const ytMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
                  const id = ytMatch ? ytMatch[1] : null;
                  if (id) embed = `https://www.youtube.com/embed/${id}`;
                  return <iframe title={selectedVideo.judul} src={embed} className="w-full h-full" allowFullScreen frameBorder="0" />;
                }
                return (
                  <video src={url} controls className="w-full h-full bg-black" />
                );
              })()}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12 pb-24 w-full flex-grow">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
              {selectedVideo.judul}
            </h1>
            {selectedVideo.deskripsi && (
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
                {selectedVideo.deskripsi}
              </p>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base sm:text-lg font-medium">
                {/* Admin can add more descriptive content via `deskripsi` in admin panel */}
              </div>
            </div>

            {selectedVideo.link_eksternal && (
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => window.open(selectedVideo.link_eksternal, '_blank')}
                  className="flex items-center gap-2 text-rose-500 font-black text-sm hover:gap-3 transition-all cursor-pointer bg-transparent border-none"
                >
                  Kunjungi Sumber Eksternal <FiExternalLink />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ===== QUIZ DETAIL MODAL ===== */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={closeQuizModal}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg max-h-[90vh] shadow-2xl animate-[slideUp_0.35s_ease-out] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover image */}
            <div className="relative w-full h-48 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/40 dark:to-orange-900/40 shrink-0">
              {selectedQuiz.gambar ? (
                <img src={selectedQuiz.gambar} alt={selectedQuiz.judul} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
                  {isPsychotestQuiz ? '🧠' : '📝'}
                </div>
              )}
              <button onClick={closeQuizModal} className="absolute top-4 right-4 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md border-none cursor-pointer transition-all">
                <FiX size={20} />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg ${isPsychotestQuiz ? 'bg-violet-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {getQuizLabel(selectedQuiz.kategori)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 tracking-tight">
                {selectedQuiz.judul}
              </h2>
              {selectedQuiz.deskripsi && (
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                  {selectedQuiz.deskripsi}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeQuizModal}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-600 transition-all bg-transparent cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Silakan login untuk memulai kuis');
                      closeQuizModal();
                      navigate('/login');
                      return;
                    }
                    closeQuizModal();
                    if (selectedQuiz.link_eksternal) {
                      window.open(selectedQuiz.link_eksternal, '_blank');
                    } else {
                      navigate(`/quiz/${selectedQuiz.id}`);
                    }
                  }}
                  className={`flex-1 py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-lg ${isPsychotestQuiz ? 'shadow-violet-500/30' : 'shadow-rose-500/30'}`}
                  style={{ background: isPsychotestQuiz ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'linear-gradient(135deg, #f43f5e, #fb923c)' }}
                >
                  <FiPlay size={14} fill="currentColor" /> {isPsychotestQuiz ? 'Mulai Tes' : 'Mulai Kuis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
