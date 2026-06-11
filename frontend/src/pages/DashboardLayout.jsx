import { useState } from 'react';
import {
  LayoutDashboard, FlaskConical, Leaf, FileInput, ClipboardList,
  LogOut, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allMenuItems = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'penelitian', label: 'Penelitian', icon: FlaskConical, path: '/research' },
  { key: 'keberlanjutan', label: 'Keberlanjutan', icon: Leaf, path: '/sustainability' },
  
  // Kasih garis pemisah khusus Admin sebelum Validasi
  { key: 'div-admin', isDivider: true, adminOnly: true },
  { key: 'validasi', label: 'Validasi Data', icon: ShieldCheck, path: '/validasi', adminOnly: true },
  
  // Kasih garis pemisah khusus Operator sebelum Input Data
  { key: 'div-op', isDivider: true, operatorOnly: true },
  { key: 'input', label: 'Input Data', icon: FileInput, path: '/input', operatorOnly: true },
  { key: 'riwayat', label: 'Riwayat & Revisi', icon: ClipboardList, path: '/riwayat', operatorOnly: true },
];

export function DashboardLayout({ children, activeKey = 'overview', onNavigate }) {
    const { user, logout } = useAuth();
    const userRole = user?.role || 'operator';
    const userName = user?.name || '';
    const navigate = useNavigate();
    const menuItems = allMenuItems.filter(
    (item) => {
        if (item.operatorOnly) return userRole === 'operator';
        if (item.adminOnly) return userRole === 'admin';
        return true;
    }
);

  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : userRole === 'admin' ? 'AP' : 'OP';

  const displayName = userName || (userRole === 'admin' ? 'Aris Purwanto' : 'Teknisi Lapangan');
  const roleLabel = userRole === 'admin' ? 'Director of Research' : 'Operator';

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      {/* ====== SIDEBAR ====== */}
      <aside className="w-60 bg-white flex flex-col border-r border-gray-100">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-900">Science Park</span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Executive Dashboard</span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
            {menuItems.map((item) => {
                // Kalo dia divider, render garis aja
                if (item.isDivider) {
                return <div key={item.key} className="border-t border-black-200 my-3 mx-2"></div>;
                }

                // Kalo bukan, render tombol menu biasa
                const Icon = item.icon;
                const isActive = activeKey === item.key;
                return (
                <button
                    key={item.key}
                    onClick={() => {
                        onNavigate?.(item.key);
                        navigate(item.path);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                </button>
                );
            })}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 pb-6 space-y-0.5">
          <div className="border-t border-gray-100 mb-3"></div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* ====== MAIN AREA ====== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-[#1a2e1a] flex items-center justify-between px-6">
          {/* Search */}
          <div className="relative w-80">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} /> */}
            {/* <input
              type="text"
              placeholder="Cari fasilitas atau proyek..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#253525] border border-[#354535] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            /> */}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5">

            <div className="flex items-center gap-3 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-white">{displayName}</span>
                <span className="text-[11px] text-gray-400">{roleLabel}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/30">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#1a2e1a] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-emerald-400">KST Ngijo</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                Mendorong kemajuan teknologi dan pertumbuhan berkelanjutan melalui keunggulan ilmiah dan ekosistem penelitian terintegrasi.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-gray-400 mb-2">Quick Links</h5>
              <div className="space-y-1">
                {['Privacy Policy', 'Terms of Service', 'University Portal', 'Contact Support'].map((link) => (
                  <a key={link} href="#" className="block text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">© 2024 KST Ngijo Green Science Park. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}