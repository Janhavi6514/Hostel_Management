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
import { Spinner } from '../components/UI';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [s, r, o, f, stu, comp] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getMonthlyRevenue(),
          dashboardAPI.getRoomOccupancy(),

          axios.get('http://localhost:5000/api/fees', {
            headers: { Authorization: `Bearer ${token}` }
          }),

          axios.get('http://localhost:5000/api/students', {
            headers: { Authorization: `Bearer ${token}` }
          }),

          axios.get('http://localhost:5000/api/complaints', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setSummary(s.data || {});
        setRevenue(r.data || []);
        setFees(f.data || []);
        setStudents(stu.data?.data || stu.data || []);
        setComplaints(comp.data?.data || comp.data || []);

        const occ = o.data || [];
        setOccupancy(occ.map(item => ({
          status: item.status || item.name,
          count: Number(item.count || item.value || 0)
        })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== DATA =====
  const totalRevenue = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const pendingFees = fees
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const statusData = [
    { name: 'Paid', value: fees.filter(f => f.status === 'paid').length },
    { name: 'Pending', value: fees.filter(f => f.status === 'pending').length },
    { name: 'Overdue', value: fees.filter(f => f.status === 'overdue').length },
  ];

  const genderData = [
    { name: 'Boys', value: students.filter(s => s.gender === 'Male').length },
    { name: 'Girls', value: students.filter(s => s.gender === 'Female').length },
  ];

  const complaintData = [
    { name: 'Open', value: complaints.filter(c => c.status === 'open').length },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'inprogress').length },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length },
  ];

  const COLORS = ['#22c55e', '#facc15', '#ef4444'];
  const GENDER_COLORS = ['#6366f1', '#ec4899'];
  const COMPLAINT_COLORS = ['#ef4444', '#facc15', '#22c55e'];

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#334155"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* 🔥 PROFESSIONAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card title="Students" value={students.length} icon={Users} color="blue" />
        <Card title="Rooms" value={summary.totalRooms || 0} icon={BedDouble} color="purple" />
        <Card title="Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="green" />
        <Card title="Pending" value={`₹${pendingFees}`} icon={Wallet} color="yellow" />
        <Card title="Staff" value={summary.totalStaff || 0} icon={UserCheck} color="pink" />
        <Card title="Complaints" value={summary.openComplaints || 0} icon={AlertCircle} color="red" />
      </div>

      {/* TOP CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-3">Revenue Analytics</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-3">Room Occupancy</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={occupancy} dataKey="count" outerRadius={90}>
                {occupancy.map((entry, i) => (
                  <Cell key={i} fill={entry.status === 'Occupied' ? '#22c55e' : '#3b82f6'} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* BOTTOM CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Chart title="Fees Status" data={statusData} colors={COLORS} label={renderLabel} />
        <Chart title="Students Gender (%)" data={genderData} colors={GENDER_COLORS} label={renderLabel} />
        <Chart title="Complaints Status" data={complaintData} colors={COMPLAINT_COLORS} label={renderLabel} />

      </div>

    </div>
  );
};

// 🔥 PREMIUM CARD
const Card = ({ title, value, icon: Icon, color }) => {

  const styles = {
    blue: "from-blue-500 to-blue-600 bg-blue-100 text-blue-600",
    purple: "from-purple-500 to-purple-600 bg-purple-100 text-purple-600",
    green: "from-green-500 to-green-600 bg-green-100 text-green-600",
    yellow: "from-yellow-400 to-yellow-500 bg-yellow-100 text-yellow-600",
    pink: "from-pink-500 to-pink-600 bg-pink-100 text-pink-600",
    red: "from-red-500 to-red-600 bg-red-100 text-red-600",
  };

  const [gradFrom, gradTo, bg, text] = styles[color].split(" ");

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-5 relative overflow-hidden">

      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradFrom} ${gradTo}`} />

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
        </div>

        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={text} size={22} />
        </div>
      </div>
    </div>
  );
};

// CHART CARD
const Chart = ({ title, data, colors, label }) => (
  <div className="bg-white p-5 rounded-2xl shadow">
    <h2 className="font-semibold mb-3 text-center">{title}</h2>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90} label={label}>
          {data.map((e, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default Dashboard;