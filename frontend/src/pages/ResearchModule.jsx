import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { useApiWithAuth } from '../hooks/useApiWithAuth';
import {
  Plus, Search, SlidersHorizontal, GitBranch, Download,
  MoreVertical, ChevronLeft, ChevronRight,
  TrendingUp, Shield, Users, BarChart3, Loader2, AlertCircle
} from 'lucide-react';
import { X, Calendar } from 'lucide-react';

const getCategoryStyle = (category) => {
  const map = {
    technology:    { label: 'Technology',    style: 'bg-blue-100 text-blue-800' },
    agriculture:   { label: 'Agritech',      style: 'bg-emerald-100 text-emerald-800' },
    energy:        { label: 'Energy',         style: 'bg-amber-100 text-amber-800' },
    sustainability:{ label: 'Sustainability', style: 'bg-teal-100 text-teal-800' },
    other:         { label: 'Other',          style: 'bg-gray-100 text-gray-700' },
  };
  return map[category] || { label: category, style: 'bg-gray-100 text-gray-700' };
};

const getTRLConfig = (level) => {
  if (level <= 2) return { color: '#dc2626', label: 'Concept Formulation' };
  if (level <= 4) return { color: '#2563eb', label: 'Lab Validation' };
  if (level <= 6) return { color: '#d97706', label: 'Prototype Testing' };
  if (level <= 8) return { color: '#16a34a', label: 'Demonstration Stage' };
  return { color: '#16a34a', label: 'Market Ready' };
};

function TRLBar({ level }) {
  const config = getTRLConfig(level);
  const percentage = (level / 9) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: config.color }}>TRL {level}</span>
        <span className="text-[11px] text-gray-400">{config.label}</span>
      </div>
      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: config.color }} />
      </div>
    </div>
  );
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-teal-600',
  'bg-violet-600', 'bg-amber-600', 'bg-rose-600'
];

export default function ResearchModule() {
  // ✅ Hook dipanggil DI DALAM component
  const { fetchWithAuth } = useApiWithAuth();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('aktif');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProjects = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        per_page: 10,
        page,
        ...(search && { search }),
        ...(activeTab === 'aktif' && { status: 'active' }),
      });

      // ✅ Pake fetchWithAuth, bukan fetch() langsung
      const json = await fetchWithAuth(`/internal/research-data?${params}`);
      if (!json) return; // null = session expired, udah di-redirect

      setProjects(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage, searchQuery);
  }, [currentPage, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjects(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavigate = (key) => console.log('Navigate to:', key);

  const tabs = [
    { key: 'database', label: 'Database Riset' },
    { key: 'aktif', label: 'Aktif Projek' },
    { key: 'keluaran', label: 'Keluaran' },
  ];

  return (
    <DashboardLayout activeKey="penelitian" onNavigate={handleNavigate}>
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="text-emerald-700 font-semibold">RISET</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-400 font-semibold">PELACAKAN INOVASI</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pelacakan Penelitian & Inovasi</h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Memantau siklus hidup proyek aktif, tingkat kesiapan teknologi (TRL), dan terobosan
            ilmiah interdisipliner di seluruh taman.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Project Baru
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL AKTIF', value: pagination?.total ?? '—', icon: TrendingUp, iconColor: 'text-red-500' },
          { label: 'RATA-RATA SKOR TRL', value: '5.4', hasMiniBars: true, icon: BarChart3, iconColor: 'text-blue-500' },
          { label: 'PATEN TERTUNDA', value: '08', icon: Shield, iconColor: 'text-amber-500' },
          { label: 'KOLABORASI', value: '156', icon: Users, iconColor: 'text-indigo-500' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
              <p className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-2">{card.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                {card.hasMiniBars ? (
                  <div className="flex items-end gap-0.5 h-6">
                    {[40, 65, 85, 55, 70, 90].map((h, i) => (
                      <div key={i} className="w-1.5 bg-blue-400 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                ) : ( <Icon size={22} className={card.iconColor} /> )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-0 border-b border-gray-200 mb-5">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'text-gray-900 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {tab.label}
            {tab.key === 'aktif' && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Saring berdasarkan nama proyek, ID, atau prospek..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={14} /> TRL Level
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <GitBranch size={14} /> Field
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Projek</div>
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kepala Riset</div>
          <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Domain</div>
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">TRL Status</div>
          <div className="col-span-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" /> <span className="text-sm">Memuat data proyek...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex items-center justify-center py-16 gap-3 text-red-500">
            <AlertCircle size={20} /> <span className="text-sm">{error}</span>
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Tidak ada proyek ditemukan.</div>
        )}

        {!loading && !error && projects.map((project, idx) => {
          const cat = getCategoryStyle(project.category);
          const trl = project.trl_level || 1;
          const piName = project.principal_investigator?.name || 'Unknown';
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          return (
            <div key={project.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="col-span-3">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{project.title}</h3>
                <span className="text-[11px] text-gray-400">ID: KST-{String(project.id).padStart(4, '0')}</span>
              </div>
              <div className="col-span-3 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{getInitials(piName)}</div>
                <span className="text-sm text-gray-700">{piName}</span>
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cat.style}`}>{cat.label}</span>
              </div>
              <div className="col-span-3"><TRLBar level={trl} /></div>
              <div className="col-span-1 flex justify-end">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            Menampilkan <span className="font-medium text-gray-600">{projects.length}</span> dari{' '}
            <span className="font-medium text-gray-600">{pagination.total}</span> proyek
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  currentPage === page ? 'bg-emerald-700 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))} disabled={currentPage === pagination.last_page}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL PROJECT BARU ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tambah Project Baru</h2>
                <p className="text-xs text-gray-400 mt-0.5">Data akan disimpan ke database riset</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setModalError(null); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateProject} className="px-6 py-5 space-y-4">
              {modalError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Judul Proyek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="cth: Pengembangan Bioreaktor Skala Pilot"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Kategori + TRL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={modalForm.category}
                    onChange={(e) => setModalForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"
                  >
                    <option value="">Pilih...</option>
                    <option value="technology">Technology</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="energy">Energy</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    TRL Level (1–9) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1} max={9}
                      value={modalForm.trl_level}
                      onChange={(e) => setModalForm(p => ({ ...p, trl_level: e.target.value }))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="text-sm font-bold text-emerald-700 w-6 text-center">
                      {modalForm.trl_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tanggal + Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={modalForm.start_date}
                    onChange={(e) => setModalForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={modalForm.budget}
                    onChange={(e) => setModalForm(p => ({ ...p, budget: e.target.value }))}
                    placeholder="cth: 50000000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Ringkasan tujuan dan metode penelitian..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setModalError(null); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  {modalLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Plus size={16} />}
                  Simpan Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const [showModal, setShowModal] = useState(false);
const [modalForm, setModalForm] = useState({
  title: '',
  category: '',
  start_date: new Date().toISOString().split('T')[0],
  budget: '',
  description: '',
  trl_level: 1,
});
const [modalLoading, setModalLoading] = useState(false);
const [modalError, setModalError] = useState(null);

const handleCreateProject = async (e) => {
  e.preventDefault();
  setModalLoading(true);
  setModalError(null);
  try {
    const json = await fetchWithAuth('/internal/research-data', {
      method: 'POST',
      body: JSON.stringify({
        ...modalForm,
        budget: modalForm.budget ? Number(modalForm.budget) : null,
        trl_level: Number(modalForm.trl_level),
        principal_investigator_id: 1, // sementara hardcode, nanti bisa dropdown user
      }),
    });
    if (!json) return;
    setShowModal(false);
    setModalForm({ title: '', category: '', start_date: new Date().toISOString().split('T')[0], budget: '', description: '', trl_level: 1 });
    fetchProjects(currentPage, searchQuery); // refresh table
  } catch (err) {
    setModalError(err.message);
  } finally {
    setModalLoading(false);
  }
};