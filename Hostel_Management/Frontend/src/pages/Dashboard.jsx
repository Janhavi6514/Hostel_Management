import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, BedDouble, Wallet, UserCheck,
  TrendingUp, AlertCircle
} from 'lucide-react';

import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { dashboardAPI } from '../Utils/api';
import { StatCard, Spinner } from '../components/UI';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [s, r, o, f, stu] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getMonthlyRevenue(),
          dashboardAPI.getRoomOccupancy(),

          // ✅ FEES
          axios.get('http://localhost:5000/api/fees', {
            headers: { Authorization: `Bearer ${token}` }
          }),

          // ✅ FIX: GET ALL STUDENTS (NOT ONLY ACTIVE)
          axios.get('http://localhost:5000/api/students', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setSummary(s.data || {});
        setRevenue(r.data || []);
        setFees(f.data || []);

        // ✅ FIX STUDENT COUNT
        const allStudents = stu.data?.data || stu.data || [];
        setStudents(allStudents);

        // ✅ FIX OCCUPANCY LABELS
        const occ = o.data || [];
        const formattedOcc = occ.map(item => ({
          status: item.status || item.name,
          count: Number(item.count || item.value || 0)
        }));
        setOccupancy(formattedOcc);

      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ SAFE CALCULATIONS
  const totalRevenue = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const pendingFees = fees
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const paidCount = fees.filter(f => f.status === 'paid').length;
  const pendingCount = fees.filter(f => f.status === 'pending').length;
  const overdueCount = fees.filter(f => f.status === 'overdue').length;

  const statusData = [
    { name: 'Paid', value: paidCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Overdue', value: overdueCount },
  ];

  const COLORS = ['#22c55e', '#facc15', '#ef4444'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* TITLE */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* ✅ FIXED STUDENT COUNT */}
        <StatCard title="Students" value={students.length} icon={Users} />

        <StatCard title="Rooms" value={summary.totalRooms || 0} icon={BedDouble} />

        <StatCard title="Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} />

        <StatCard title="Pending" value={`₹${pendingFees}`} icon={Wallet} />

        <StatCard title="Staff" value={summary.totalStaff || 0} icon={UserCheck} />

        <StatCard title="Complaints" value={summary.openComplaints || 0} icon={AlertCircle} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* REVENUE GRAPH */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
          <h2 className="font-semibold mb-2">Revenue Analytics</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROOM OCCUPANCY (FIXED LABELS) */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="font-semibold mb-2">Room Occupancy</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={occupancy}
                dataKey="count"
                nameKey="status"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {occupancy.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.status === 'Occupied'
                        ? '#22c55e'
                        : '#3b82f6'
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* FEES STATUS */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="font-semibold mb-2">Fees Status</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;