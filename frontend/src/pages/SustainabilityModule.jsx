import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { useApiWithAuth } from '../hooks/useApiWithAuth';
import {
  Leaf, Download, Clock, TrendingUp, TrendingDown, Minus,
  Loader2, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

// ─── Green Performance Gauge (SVG circle) ─────────────────────────────────
function PerformanceGauge({ score }) {
  const size = 136;
  const sw   = 12;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const label  = score >= 90 ? 'EXCELLENT' : score >= 75 ? 'GOOD' : 'FAIR';

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#16a34a" strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        <span className="text-[10px] font-bold text-emerald-600 tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// ─── Trend Icon ─────────────────────────────────────────────────────────────
function TrendIcon({ value, target }) {
  if (!target || target === 0) return <Minus size={14} className="text-gray-400" />;
  const ratio = value / target;
  if (ratio >= 0.9)  return <TrendingUp   size={14} className="text-emerald-500" />;
  if (ratio >= 0.65) return <Minus        size={14} className="text-amber-500" />;
  return               <TrendingDown  size={14} className="text-red-500" />;
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function getStatus(value, target) {
  if (!target || target === 0) return { label: 'OPTIMAL',   cls: 'bg-emerald-100 text-emerald-700' };
  const r = value / target;
  if (r >= 0.85) return { label: 'OPTIMAL',   cls: 'bg-emerald-100 text-emerald-700' };
  if (r >= 0.6)  return { label: 'ATTENTION', cls: 'bg-amber-100 text-amber-700' };
  return               { label: 'CRITICAL',  cls: 'bg-red-100 text-red-700' };
}

// ─── Chart Tooltip custom ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value} {unit}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Breakdown dot colors ────────────────────────────────────────────────────
const BREAKDOWN_COLORS = ['#10b981', '#3b82f6', '#a78bfa'];

export default function SustainabilityModule() {
  const { fetchWithAuth } = useApiWithAuth();
  const [dashData,  setDashData]  = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, chart] = await Promise.all([
          fetchWithAuth('/internal/sustainability-data'),
          fetchWithAuth('/internal/sustainability-data/chart-data'),
        ]);
        if (!dash || !chart) return;
        setDashData(dash);
        setChartData(chart);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalEnergy = dashData?.dashboard_summary?.total_renewable_energy?.value ?? 0;

  return (
    <DashboardLayout activeKey="keberlanjutan" onNavigate={() => {}}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-widest">RUANG KONTROL</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-1">Modul Keberlanjutan</h1>
          <p className="text-sm text-gray-500">
            Pemantauan secara real-time terhadap jejak ekologis dan efisiensi sumber daya Taman Sains Hijau.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Clock size={13} /> 24 Jam Terakhir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
            <Download size={13} /> Ekspor Data
          </button>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Memuat data sensor...</span>
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {!loading && !error && dashData && chartData && (
        <>
          {/* ── Row 1: Hero Energy + Performance ─────────────────────── */}
          <div className="grid grid-cols-5 gap-5 mb-5">

            {/* Hero Card */}
            <div className="col-span-3 relative overflow-hidden rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, #071a0e 0%, #0d3320 50%, #0a2518 100%)' }}>
              <Leaf size={160} className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-[0.06] text-emerald-400" />
              
              <p className="text-emerald-400 text-xs font-semibold tracking-wide mb-3">
                Total Energi Terbarukan yang Dihasilkan
              </p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-black text-white leading-none">
                  {totalEnergy.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <span className="text-2xl font-bold text-emerald-400 mb-1">MWh</span>
              </div>

              {/* Breakdown per sumber */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {(chartData.energy_breakdown ?? []).map((src, i) => (
                  <div key={src.source} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }} />
                    <span className="text-xs text-white/80">
                      {src.source}: <span className="font-semibold text-white">{src.value.toFixed(1)} MWh</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Green Performance */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center justify-between">
              <p className="text-sm font-bold text-gray-700 self-start">Green Performance</p>
              <PerformanceGauge score={chartData.performance_score ?? 0} />
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Kinerja{' '}
                <span className="font-semibold text-emerald-700">
                  {chartData.performance_score >= 90 ? '12% lebih tinggi' : 'terpantau'}
                </span>{' '}
                dibandingkan kuartal lalu. Teruslah berkembang!
              </p>
            </div>
          </div>

          {/* ── Row 2: Charts ─────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-5 mb-5">

            {/* Energy Line Chart */}
            <div className="col-span-5 bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-bold text-gray-800 mb-0.5">Dinamika Energi</p>
              <p className="text-[11px] text-gray-400 mb-4">Daya vs. Konsumsi secara Real-time</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData.energy_timeline ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit="MWh" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="supply" name="Supply" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="demand" name="Demand" stroke="#1e3a5f" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Water Donut */}
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-bold text-gray-800 mb-0.5">Siklus Hidup Air</p>
              <p className="text-[11px] text-gray-400 mb-2">Distribusi sumber daya</p>
              <div className="relative">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Daur Ulang', value: chartData.water?.recycled ?? 0 },
                        { name: 'Sumber Segar', value: chartData.water?.fresh ?? 0 },
                      ]}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                      paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#93c5fd" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900">{chartData.water?.recycleRate ?? 0}%</span>
                  <span className="text-[9px] font-bold text-gray-500 tracking-widest">DAUR ULANG</span>
                </div>
              </div>
              <div className="space-y-1.5 mt-2">
                {[
                  { label: 'Daur Ulang', val: chartData.water?.recycled, color: '#16a34a' },
                  { label: 'Sumber Segar', val: chartData.water?.fresh, color: '#93c5fd' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-500">{item.label}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{item.val?.toFixed(1)} L/s</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waste Bar Chart */}
            <div className="col-span-4 bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-bold text-gray-800 mb-0.5">Metrik Limbah</p>
              <p className="text-[11px] text-gray-400 mb-4">Efisiensi Proses (5 hari terakhir)</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData.waste_weekly ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit="ton" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="processed" name="Diproses" fill="#16a34a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="incoming"  name="Masuk"    fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Row 3: Sensor Table ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-base font-bold text-gray-900">Real Time Sensor Feed</p>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="col-span-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Sensor</div>
              <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipe</div>
              <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Baca</div>
              <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
              <div className="col-span-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Tren</div>
            </div>

            {/* Rows */}
            {(dashData.real_time_sensor_feed ?? []).slice(0, 10).map((feed, i) => {
              const status = getStatus(feed.value, feed.target_value);
              return (
                <div key={feed.id ?? i}
                  className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center">
                  <div className="col-span-4 text-sm font-semibold text-gray-900 truncate pr-2">
                    {feed.metric_name}
                  </div>
                  <div className="col-span-3 text-sm text-gray-500 truncate">{feed.notes || '-'}</div>
                  <div className="col-span-2 text-sm font-semibold text-gray-800">
                    {parseFloat(feed.value).toFixed(1)}
                    <span className="text-gray-400 font-normal ml-1 text-xs">{feed.unit}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <TrendIcon value={feed.value} target={feed.target_value} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}