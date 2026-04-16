import { useState, useEffect } from 'react';
import {
  Users, BedDouble, Wallet, MessageSquareWarning,
  UserCheck, TrendingUp, AlertCircle, BellRing,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { dashboardAPI } from '../Utils/api';
import { StatCard, Badge, Spinner } from '../components/UI';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [summary, setSummary]           = useState(null);
  const [revenue, setRevenue]           = useState([]);
  const [occupancy, setOccupancy]       = useState([]);
  const [recentActivity, setRecent]     = useState([]);
  const [complaintStats, setComplaints] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, r, o, a, c] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getMonthlyRevenue(),
          dashboardAPI.getRoomOccupancy(),
          dashboardAPI.getRecentActivity(),
          dashboardAPI.getComplaintStats(),
        ]);
        setSummary(s.data);
        setRevenue(r.data);
        setOccupancy(o.data);
        setRecent(a.data);
        setComplaints(c.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: summary?.totalStudents ?? 0,
      icon: Users,
      color: 'blue',
      sub: 'Active residents',
    },
    {
      title: 'Total Rooms',
      value: summary?.totalRooms ?? 0,
      icon: BedDouble,
      color: 'purple',
      sub: `${summary?.availableRooms ?? 0} available`,
    },
    {
      title: 'Monthly Revenue',
      value: `₹${Number(summary?.monthlyRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      sub: 'Collected this month',
    },
    {
      title: 'Pending Fees',
      value: `₹${Number(summary?.pendingFees ?? 0).toLocaleString()}`,
      icon: Wallet,
      color: 'yellow',
      sub: 'Yet to be collected',
    },
    {
      title: 'Active Staff',
      value: summary?.totalStaff ?? 0,
      icon: UserCheck,
      color: 'orange',
      sub: 'On duty',
    },
    {
      title: 'Open Complaints',
      value: summary?.openComplaints ?? 0,
      icon: AlertCircle,
      color: 'red',
      sub: 'Needs attention',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue (Last 6 Months)</h2>
          {revenue.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Room Occupancy Pie */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Room Occupancy</h2>
          {occupancy.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={occupancy}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ status, percent }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {occupancy.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(val) => (
                    <span className="text-xs capitalize text-slate-600">{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Allocations</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                      {item.student_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.student_name}</p>
                      <p className="text-xs text-slate-400">Room {item.room_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={item.status} />
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(item.check_in).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaint Stats */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Complaint Overview</h2>
          {complaintStats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No complaints recorded</p>
          ) : (
            <div className="space-y-4">
              {complaintStats.map((item, i) => {
                const total = complaintStats.reduce((s, c) => s + Number(c.count), 0);
                const pct = Math.round((Number(item.count) / total) * 100);
                const barColor = {
                  open: 'bg-yellow-400',
                  in_progress: 'bg-blue-400',
                  resolved: 'bg-green-400',
                }[item.status] || 'bg-slate-300';

                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="capitalize">{item.status.replace(/_/g, ' ')}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Occupancy Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summary?.occupiedRooms ?? 0}</p>
              <p className="text-xs text-slate-400">Occupied Rooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary?.availableRooms ?? 0}</p>
              <p className="text-xs text-slate-400">Available Rooms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;