import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState(0);
  const [roomsOccupied, setRoomsOccupied] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [complaints, setComplaints] = useState(0);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Students
      const studentsRes = await axios.get("http://localhost:5000/api/students", config);
      const students = studentsRes.data?.data || studentsRes.data || [];
      setTotalStudents(students.length);

      // Rooms
      const roomsRes = await axios.get("http://localhost:5000/api/rooms", config);
      const rooms = roomsRes.data?.data || roomsRes.data || [];
      setRoomsOccupied(rooms.filter(r => r.status === "occupied").length);

      // Fees
      const feesRes = await axios.get("http://localhost:5000/api/fees", config);
      const fees = feesRes.data?.data || feesRes.data || [];

      const pending = fees
        .filter(f => f.status === "pending")
        .reduce((sum, f) => sum + Number(f.amount || 0), 0);

      setPendingFees(pending);

      // Complaints
      const compRes = await axios.get("http://localhost:5000/api/complaints", config);
      const comp = compRes.data?.data || compRes.data || [];
      setComplaints(comp.length);

    } catch (err) {
      console.error("Home Load Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back 👋</h1>
        <p className="text-sm opacity-90 mt-1">
          Manage hostel operations efficiently
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Students */}
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon="👨‍🎓"
          gradient="from-blue-500 to-indigo-600"
        />

        {/* Rooms */}
        <StatCard
          title="Rooms Occupied"
          value={roomsOccupied}
          icon="🛏️"
          gradient="from-green-500 to-emerald-600"
        />

        {/* Fees */}
        <StatCard
          title="Pending Fees"
          value={`₹${pendingFees}`}
          icon="💰"
          gradient="from-yellow-400 to-amber-500"
        />

        {/* Complaints */}
        <StatCard
          title="Complaints"
          value={complaints}
          icon="⚠️"
          gradient="from-red-500 to-pink-500"
        />

      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <ActionCard
            title="Manage Students"
            desc="Add, update or remove student records"
            icon="👨‍🎓"
            gradient="from-blue-500 to-indigo-600"
            onClick={() => navigate("/students")}
          />

          <ActionCard
            title="View Rooms"
            desc="Check room availability & allocation"
            icon="🛏️"
            gradient="from-green-500 to-emerald-600"
            onClick={() => navigate("/rooms")}
          />

          <ActionCard
            title="Track Fees"
            desc="Monitor fee payments and dues"
            icon="💰"
            gradient="from-yellow-400 to-amber-500"
            onClick={() => navigate("/fees")}
          />

        </div>
      </div>

    </div>
  );
};

export default Home;


/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon, gradient }) => {
  return (
    <div className={`rounded-2xl p-[1px] bg-gradient-to-br ${gradient}`}>
      <div className="bg-[#0f172a] rounded-2xl p-5 shadow hover:-translate-y-1 hover:shadow-xl transition">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">{title}</p>
          <div className="bg-white/10 p-2 rounded-lg">{icon}</div>
        </div>

        <h2 className="text-3xl font-bold mt-3 text-white">
          {value}
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Updated data
        </p>
      </div>
    </div>
  );
};


/* ================= ACTION CARD ================= */
const ActionCard = ({ title, desc, icon, gradient, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br ${gradient}`}
    >
      <div className="bg-[#0f172a] rounded-2xl p-6 shadow hover:-translate-y-1 hover:shadow-xl transition">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white">{title}</h3>
          <div className="bg-white/10 p-2 rounded-lg">{icon}</div>
        </div>

        <p className="text-sm text-slate-400 mt-2">
          {desc}
        </p>
      </div>
    </div>
  );
};