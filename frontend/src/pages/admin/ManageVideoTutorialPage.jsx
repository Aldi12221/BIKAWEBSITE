import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit3, FiX, FiSave, FiSearch } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ManageVideoTutorialPage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ judul: '', deskripsi: '', gambar: '', video_url: '', is_published: true });
  const [search, setSearch] = useState('');

  const load = () => {
    api.getVideoTutorials().then(d => Array.isArray(d) && setItems(d)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ judul: '', deskripsi: '', gambar: '', video_url: '', is_published: true }); setShowModal(true); };
  const openEdit = (it) => { setEditItem(it); setForm({ judul: it.judul || '', deskripsi: it.deskripsi || '', gambar: it.gambar || '', video_url: it.video_url || '', is_published: it.is_published !== false }); setShowModal(true); };

  const handleImage = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await readFileAsDataUrl(f);
    setForm(prev => ({ ...prev, gambar: data }));
  };

  const handleSave = async () => {
    if (!form.judul?.trim()) { toast.error('Judul tidak boleh kosong'); return; }
    try {
      if (editItem) await api.updateVideoTutorial(editItem.id, form);
      else await api.createVideoTutorial(form);
      toast.success('Berhasil disimpan');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">Hapus video tutorial ini?</p>
        <div className="flex gap-2">
          <button onClick={async () => { toast.dismiss(t.id); await api.deleteVideoTutorial(id); toast.success('Dihapus'); load(); }} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white">Hapus</button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 py-1.5 rounded-lg bg-gray-700 text-white">Batal</button>
        </div>
      </div>
    ));
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.judul.toLowerCase().includes(q) || (i.deskripsi || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Video Tutorial</h1>
          <p className="text-sm text-gray-400">Buat, ubah, dan hapus video tutorial terpisah dari artikel.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="px-3 py-2 rounded-lg border" />
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Tambah</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(it => (
          <div key={it.id} className="p-4 bg-white rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden">
                {it.gambar ? <img src={it.gambar} alt={it.judul} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{it.judul}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{it.deskripsi}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-lg bg-yellow-500 text-white"><FiEdit3 /></button>
                  <button onClick={() => handleDelete(it.id)} className="px-3 py-1 rounded-lg bg-red-500 text-white"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{editItem ? 'Edit' : 'Tambah'} Video Tutorial</h3>
              <button onClick={() => setShowModal(false)} className="p-2"><FiX /></button>
            </div>
            <div className="space-y-3">
              <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} placeholder="Judul" className="w-full p-2 border rounded" />
              <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Deskripsi" className="w-full p-2 border rounded" />
              <input type="file" accept="image/*" onChange={handleImage} />
              <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="URL Video atau file" className="w-full p-2 border rounded" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2"> <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /> Dipublikasikan</label>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-white">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
