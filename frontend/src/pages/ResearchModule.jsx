import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { useApiWithAuth } from '../hooks/useApiWithAuth';
import {
  Plus, Search, SlidersHorizontal, GitBranch, Download,
  MoreVertical, ChevronLeft, ChevronRight,
  TrendingUp, Shield, Users, BarChart3, Loader2, AlertCircle,
  Pencil, Trash2, Eye
} from 'lucide-react';
import { X } from 'lucide-react';

const getCategoryStyle = (category) => {
  const map = {
    technology:    { label: 'Technology',    style: 'bg-blue-100 text-blue-800' },
    agriculture:   { label: 'Agritech',      style: 'bg-emerald-100 text-emerald-800' },
    energy:        { label: 'Energy',        style: 'bg-amber-100 text-amber-800' },
    sustainability:{ label: 'Sustainability',style: 'bg-teal-100 text-teal-800' },
    other:         { label: 'Other',         style: 'bg-gray-100 text-gray-700' },
  };
  return map[category] || { label: category, style: 'bg-gray-100 text-gray-700' };
};

const getTRLConfig = (level) => {
  const configs = {
    1: { color: '#dc2626', label: 'Basic Research' },
    2: { color: '#dc2626', label: 'Concept Formulation' },
    3: { color: '#dc2626', label: 'Proof of Concept' },
    4: { color: '#d97706', label: 'Lab Validation' },
    5: { color: '#d97706', label: 'Technology Validation' },
    6: { color: '#d97706', label: 'Prototype Testing' },
    7: { color: '#16a34a', label: 'Demonstration Stage' },
    8: { color: '#16a34a', label: 'System Complete' },
    9: { color: '#16a34a', label: 'Market Ready' },
  };
  return configs[level] || { color: '#6b7280', label: 'Unknown' };
};

function TRLBar({ level }) {
  const config = getTRLConfig(level);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: config.color }}>TRL {level}</span>
        <span className="text-[11px] text-gray-400">{config.label}</span>
      </div>
      <div className="flex items-center gap-0.5 w-36">
        {Array.from({ length: 9 }, (_, i) => {
          const segLevel = i + 1;
          const filled = segLevel <= level;
          let bgColor = '#e5e7eb';
          if (filled) {
            if (segLevel <= 3) bgColor = '#dc2626';
            else if (segLevel <= 6) bgColor = '#d97706';
            else bgColor = '#16a34a';
          }
          return <div key={i} className="h-2 flex-1 rounded-sm transition-all duration-300" style={{ backgroundColor: bgColor }} />;
        })}
      </div>
    </div>
  );
}

function TRLMiniBar({ level }) {
  return (
    <div className="flex items-center gap-0.5 mt-1.5">
      {Array.from({ length: 9 }, (_, i) => {
        const segLevel = i + 1;
        const filled = segLevel <= Number(level);
        let bgColor = '#e5e7eb';
        if (filled) {
          if (segLevel <= 3) bgColor = '#dc2626';
          else if (segLevel <= 6) bgColor = '#d97706';
          else bgColor = '#16a34a';
        }
        return <div key={i} className="h-1.5 flex-1 rounded-sm transition-all duration-200" style={{ backgroundColor: bgColor }} />;
      })}
    </div>
  );
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const formatRupiah = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-teal-600',
  'bg-violet-600', 'bg-amber-600', 'bg-rose-600'
];

const INITIAL_FORM = {
  title: '',
  category: '',
  start_date: new Date().toISOString().split('T')[0],
  budget: '',
  description: '',
  trl_level: 1,
  kepala_riset: '',
};

export default function ResearchModule() {
  const { fetchWithAuth } = useApiWithAuth();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('aktif');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null); // State buat Modal Detail
  const [modalForm, setModalForm] = useState(INITIAL_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Dropdown menu state
  const [activeMenu, setActiveMenu] = useState(null);

  // TAMBAHAN STATE FILTER
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [filterTrl, setFilterTrl] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Researchers list buat datalist autocomplete
  const [researchers, setResearchers] = useState([]);

    useEffect(() => {
      const handleClickOutside = () => {
        setActiveMenu(null);
        setActiveFilterMenu(null); // Tambahin ini
      };
      if (activeMenu !== null || activeFilterMenu !== null) {
        document.addEventListener('click', handleClickOutside);
      }
      return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu, activeFilterMenu]);

  const fetchResearchers = async () => {
    try {
      const json = await fetchWithAuth('/internal/researchers');
      if (json?.data) setResearchers(json.data);
    } catch {
      setResearchers([]);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setModalForm(INITIAL_FORM);
    setModalError(null);
    setShowModal(true);
    if (researchers.length === 0) fetchResearchers();
  };

  const handleOpenEditModal = (project) => {
    setActiveMenu(null);
    setEditingProject(project);
    setModalForm({
      title: project.title || '',
      category: project.category || '',
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      budget: project.budget || '',
      description: project.description || '',
      trl_level: project.trl_level || 1,
      kepala_riset: project.principal_investigator?.name || '',
    });
    setModalError(null);
    setShowModal(true);
    if (researchers.length === 0) fetchResearchers();
  };
  
  const handleViewDetails = (project) => {
    setActiveMenu(null);
    setViewingProject(project);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    setModalForm(INITIAL_FORM);
    setEditingProject(null);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const json = await fetchWithAuth('/internal/research-data', {
        method: 'POST',
        body: JSON.stringify({
          title: modalForm.title,
          category: modalForm.category,
          start_date: modalForm.start_date,
          budget: modalForm.budget ? Number(modalForm.budget) : null,
          description: modalForm.description,
          trl_level: Number(modalForm.trl_level),
          kepala_riset: modalForm.kepala_riset,
        }),
      });
      if (!json) return;
      handleCloseModal();
      fetchProjects(currentPage, searchQuery);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const json = await fetchWithAuth(`/internal/research-data/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: modalForm.title,
          category: modalForm.category,
          start_date: modalForm.start_date,
          budget: modalForm.budget ? Number(modalForm.budget) : null,
          description: modalForm.description,
          trl_level: Number(modalForm.trl_level),
          kepala_riset: modalForm.kepala_riset,
        }),
      });
      if (!json) return;
      handleCloseModal();
      fetchProjects(currentPage, searchQuery);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!showDeleteConfirm) return;
    setDeleteLoading(true);
    try {
      const json = await fetchWithAuth(`/internal/research-data/${showDeleteConfirm.id}`, {
        method: 'DELETE',
      });
      if (!json) return;
      setShowDeleteConfirm(null);
      fetchProjects(currentPage, searchQuery);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchProjects = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        per_page: 10,
        page,
        ...(search && { search }),
        ...(activeTab === 'aktif' && { status: 'active' }),
        ...(filterTrl && { trl_level: filterTrl }),   
        ...(filterCategory && { category: filterCategory }),
      });
      const json = await fetchWithAuth(`/internal/research-data?${params}`);
      if (!json) return;
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
  }, [currentPage, activeTab, filterTrl, filterCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjects(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tabs = [
    // { key: 'database', label: 'Database Riset' },
    { key: 'aktif',    label: 'Aktif Projek' },
    // { key: 'keluaran', label: 'Keluaran' },
  ];
  // KODE TAMBAHAN: Kalkulasi rata-rata TRL beneran dari data
  const avgTrl = projects.length > 0 
    ? (projects.reduce((sum, p) => sum + parseInt(p.trl_level || 0), 0) / projects.length).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout activeKey="penelitian" onNavigate={() => {}}>
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="text-emerald-700 font-semibold">RISET</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-400 font-semibold">PELACAKAN INOVASI</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pelacakan Penelitian &amp; Inovasi</h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Memantau siklus hidup proyek aktif dan tingkat kesiapan teknologi (TRL).
          </p>
        </div>
        <button onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={16} /> Project Baru
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          // KODE TAMBAHAN: Variabel mockup diganti jadi nilai beneran & 0
          { label: 'TOTAL AKTIF',        value: pagination?.total ?? '0', icon: TrendingUp, iconColor: 'text-red-500' },
          { label: 'RATA-RATA SKOR TRL', value: avgTrl, hasMiniBars: true, icon: BarChart3,  iconColor: 'text-blue-500' },
          { label: 'PATEN TERTUNDA',     value: '0',  icon: Shield,      iconColor: 'text-amber-500' },
          { label: 'KOLABORASI',         value: '0', icon: Users,       iconColor: 'text-indigo-500' },
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
                ) : <Icon size={22} className={card.iconColor} />}
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
          <input type="text" placeholder="Saring berdasarkan nama proyek, ID, atau prospek..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white" />
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol TRL Level */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilterMenu(activeFilterMenu === 'trl' ? null : 'trl'); setActiveMenu(null); }}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${filterTrl ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <SlidersHorizontal size={14} /> 
              {filterTrl ? `TRL ${filterTrl}` : 'TRL Level'}
            </button>
            
            {activeFilterMenu === 'trl' && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 w-32 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
                <button onClick={() => { setFilterTrl(''); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Semua TRL</button>
                {Array.from({length: 9}, (_, i) => i + 1).map(level => (
                  <button key={level} onClick={() => { setFilterTrl(level); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">TRL {level}</button>
                ))}
              </div>
            )}
          </div>
          {/* Tombol Field (Kategori) */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilterMenu(activeFilterMenu === 'field' ? null : 'field'); setActiveMenu(null); }}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${filterCategory ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <GitBranch size={14} /> 
              {filterCategory ? getCategoryStyle(filterCategory).label : 'Field'}
            </button>
            
            {activeFilterMenu === 'field' && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 w-40 animate-in fade-in slide-in-from-top-1 duration-100">
                <button onClick={() => { setFilterCategory(''); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Semua Field</button>
                <button onClick={() => { setFilterCategory('technology'); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Technology</button>
                <button onClick={() => { setFilterCategory('agriculture'); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Agritech</button>
                <button onClick={() => { setFilterCategory('energy'); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Energy</button>
                <button onClick={() => { setFilterCategory('sustainability'); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Sustainability</button>
                <button onClick={() => { setFilterCategory('other'); setActiveFilterMenu(null); setCurrentPage(1); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Other</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hilangin overflow-hidden biar dropdown menu kaga kepotong */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Projek</div>
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kepala Riset</div>
          <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Domain</div>
          <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">TRL Status</div>
          <div className="col-span-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data proyek...</span>
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
          const isMenuOpen = activeMenu === project.id;

          return (
            <div key={project.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="col-span-3">
                <h3 className="text-sm font-bold text-gray-900 leading-snug truncate pr-2">{project.title}</h3>
                {project.start_date && (
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    Mulai: {new Date(project.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                <span className="text-[11px] text-gray-400">ID: KST-{String(project.id).padStart(4, '0')}</span>
              </div>
              <div className="col-span-3 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {getInitials(piName)}
                </div>
                <span className="text-sm text-gray-700 truncate pr-2">{piName}</span>
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cat.style}`}>{cat.label}</span>
              </div>
              <div className="col-span-3">
                <TRLBar level={trl} />
              </div>

              <div className="col-span-1 flex justify-end relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : project.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                >
                  <MoreVertical size={16} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-8 top-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5 w-40 animate-in fade-in slide-in-from-right-2 duration-100">
                    <button
                      onClick={() => handleViewDetails(project)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Eye size={14} className="text-gray-400" />
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Pencil size={14} className="text-gray-400" />
                      Edit Project
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(project); setActiveMenu(null); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      Hapus Project
                    </button>
                  </div>
                )}
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

      {/* ===== MODAL DETAILS (BARU) ===== */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Detail Project</h2>
              <button onClick={() => setViewingProject(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">{viewingProject.title}</h3>
                <p className="text-sm text-gray-500 mt-1">ID: KST-{String(viewingProject.id).padStart(4, '0')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 mb-1">Kepala Riset</span>
                  <span className="text-sm font-medium text-gray-900">{viewingProject.principal_investigator?.name || '-'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 mb-1">Kategori Domain</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryStyle(viewingProject.category).style}`}>
                    {getCategoryStyle(viewingProject.category).label}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 mb-1">Tanggal Mulai</span>
                  <span className="text-sm font-medium text-gray-900">
                    {viewingProject.start_date ? new Date(viewingProject.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 mb-1">Budget Dialokasikan</span>
                  <span className="text-sm font-medium text-gray-900">{formatRupiah(viewingProject.budget)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-400 mb-2">TRL Status Saat Ini</span>
                <TRLBar level={viewingProject.trl_level || 1} />
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-400 mb-1">Deskripsi & Tujuan Penelitian</span>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {viewingProject.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button onClick={() => setViewingProject(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CREATE / EDIT ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Tambah Project Baru'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingProject
                    ? `Mengedit: ${editingProject.title}`
                    : 'Data akan disimpan ke database riset'}
                </p>
              </div>
              <button onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="px-6 py-5 space-y-4">
              {modalError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{modalError}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Judul Proyek <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={modalForm.title}
                  onChange={(e) => setModalForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="cth: Pengembangan Bioreaktor Skala Pilot"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kepala Riset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="researchers-list"
                  value={modalForm.kepala_riset}
                  onChange={(e) => setModalForm(p => ({ ...p, kepala_riset: e.target.value }))}
                  placeholder="cth: Dr. Ahmad Fauzi, M.Sc."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <datalist id="researchers-list">
                  {researchers.map(r => (
                    <option key={r.id} value={r.name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-gray-400 mt-1">
                  Ketik nama lengkap beserta gelar. Nama baru otomatis tersimpan di database.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select required value={modalForm.category}
                    onChange={(e) => setModalForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all">
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
                    <input type="range" min={1} max={9} value={modalForm.trl_level}
                      onChange={(e) => setModalForm(p => ({ ...p, trl_level: e.target.value }))}
                      className="flex-1 accent-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700 w-6 text-center">{modalForm.trl_level}</span>
                  </div>
                  <TRLMiniBar level={modalForm.trl_level} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input type="date" required value={modalForm.start_date}
                    onChange={(e) => setModalForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (Rp)</label>
                  <input type="number" min={0} value={modalForm.budget}
                    onChange={(e) => setModalForm(p => ({ ...p, budget: e.target.value }))}
                    placeholder="cth: 50000000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                <textarea rows={3} value={modalForm.description}
                  onChange={(e) => setModalForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Ringkasan tujuan dan metode penelitian..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50">
                  {modalLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : editingProject ? <Pencil size={15} /> : <Plus size={16} />}
                  {editingProject ? 'Simpan Perubahan' : 'Simpan Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Hapus Project?</h2>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Lo yakin mau hapus project{' '}
              <span className="font-semibold text-gray-900">"{showDeleteConfirm.title}"</span>?{' '}
              Semua data terkait akan ikut terhapus permanen dari sistem.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Batal, Jangan Hapus
              </button>
              <button onClick={handleDeleteProject} disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleteLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 size={14} />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}