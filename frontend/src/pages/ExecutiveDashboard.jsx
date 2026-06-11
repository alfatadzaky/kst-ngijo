import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { useApiWithAuth } from '../hooks/useApiWithAuth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Archive, Handshake, Leaf, TrendingUp, TrendingDown, 
  ExternalLink, MapPin, Loader2, BadgeCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const KST_COORDS = [-7.9151283496690885, 112.61328022988705];

// Chart data tetap mock dulu — backend gak ada endpoint trend tahunan
const trendDataTahunan = [
  { year: '2019', output: 18, dampak: 12 },
  { year: '2020', output: 22, dampak: 15 },
  { year: '2021', output: 28, dampak: 20 },
  { year: '2022', output: 35, dampak: 24 },
  { year: '2023', output: 52, dampak: 38 },
  { year: '2024', output: 68, dampak: 55 },
];

const trendDataBulanan = [
  { year: 'Jan', output: 5, dampak: 3 },
  { year: 'Feb', output: 7, dampak: 4 },
  { year: 'Mar', output: 6, dampak: 5 },
  { year: 'Apr', output: 9, dampak: 6 },
  { year: 'Mei', output: 8, dampak: 7 },
  { year: 'Jun', output: 11, dampak: 9 },
  { year: 'Jul', output: 10, dampak: 8 },
  { year: 'Agu', output: 12, dampak: 10 },
  { year: 'Sep', output: 14, dampak: 11 },
  { year: 'Okt', output: 13, dampak: 12 },
  { year: 'Nov', output: 15, dampak: 13 },
  { year: 'Des', output: 16, dampak: 14 },
];

const fasilitasData = [
  { name: 'Laboratorium Mikrobiologi Lanjutan', value: 94, color: '#1e3a5f' },
  { name: 'Area Prototipe Energi Terbarukan', value: 62, color: '#b45309' },
  { name: 'Area Manufaktur Pintar', value: 88, color: '#1e40af' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ExecutiveDashboard() {
  const [trendMode, setTrendMode] = useState('tahun');
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useApiWithAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Hit public executive endpoint — gak perlu token
        const res = await fetch('http://localhost/api/external/dashboard/executive');
        const json = await res.json();
        if (json.success) setKpis(json.data.kpis);
      } catch (_) {
        // Ganti angka mockup ini jadi 0 semua
        setKpis({ active_projects: 0, active_tenants: 0, total_visitors_ytd: 0, green_score: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNavigate = (key) => console.log('Navigate to:', key);
  const trendData = trendMode === 'tahun' ? trendDataTahunan : trendDataBulanan;

  // Stat cards pake data real dari API, sisanya fallback mock
    const statsCards = [
    {
      label: 'Total Proyek Aktif',
      value: loading ? '...' : String(kpis?.active_projects ?? 0),
      change: '0%', isUp: true,
      icon: Archive, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700',
    },
    {
      label: 'Total Paten',
      value: loading ? '...' : String(kpis?.total_visitors_ytd ?? 0),
      change: '0%', isUp: true,
      icon: BadgeCheck, iconBg: 'bg-amber-50', iconColor: 'text-amber-700',
    },
    {
      label: 'Mitra Industri',
      value: loading ? '...' : String(kpis?.active_tenants ?? 0),
      change: '0%', isUp: true,
      icon: Handshake, iconBg: 'bg-sky-50', iconColor: 'text-sky-700',
    },
    {
      label: 'Green Score',
      value: loading ? '...' : String(kpis?.green_score ?? 0), suffix: '/100',
      change: '0%', isUp: true,
      icon: Leaf, iconBg: 'bg-emerald-700', iconColor: 'text-emerald-50',
    },
  ];

  return (
    <DashboardLayout activeKey="overview" onNavigate={handleNavigate}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ringkasan Eksekutif</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${card.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {card.change}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {card.value}
                  {card.suffix && <span className="text-base font-normal text-gray-400">{card.suffix}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tren Output dan Dampak Penelitian Tahunan</h2>
            <p className="text-sm text-gray-400 mt-0.5">Gabungan metrik volume publikasi dan dampak sitasi.</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTrendMode('tahun')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${trendMode === 'tahun' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Tahun</button>
            <button onClick={() => setTrendMode('bulan')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${trendMode === 'bulan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Bulan</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
              formatter={(value) => <span className="text-xs text-gray-500 ml-1">{value}</span>} />
            <Line type="monotone" dataKey="output" name="Output Penelitian" stroke="#166534" strokeWidth={2.5} dot={{ r: 3, fill: '#166534' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="dampak" name="Dampak Sitasi" stroke="#1e40af" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#1e40af' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pemanfaatan Fasilitas */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Pemanfaatan Fasilitas</h2>
            <span className="text-xs text-gray-400">Bulan ini</span>
          </div>
          <div className="space-y-5">
            {fasilitasData.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peta Kawasan */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Peta Kawasan Regional</h2>
          <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-100">
            <MapContainer
              center={KST_COORDS}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />
              <Marker position={KST_COORDS}>
                <Popup>
                  <div className="text-center">
                    <strong>KST Ngijo Core Zone</strong><br />
                    <span style={{ fontSize: '11px', color: '#666' }}>Kawasan Sains & Teknologi Ngijo</span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Area fokus saat ini: Ekspansi wilayah utara untuk inkubasi bioteknologi.
          </p>
          <a
            href={`https://www.openstreetmap.org/?mlat=${KST_COORDS[0]}&mlon=${KST_COORDS[1]}#map=16/${KST_COORDS[0]}/${KST_COORDS[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            PERBESAR
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}