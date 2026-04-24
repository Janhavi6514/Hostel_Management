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

      // STUDENTS
      const studentsRes = await axios.get("http://localhost:5000/api/students", config);
      const students = studentsRes.data?.data || studentsRes.data || [];
      setTotalStudents(students.length);

      // ROOMS
      const roomsRes = await axios.get("http://localhost:5000/api/rooms", config);
      const rooms = roomsRes.data?.data || roomsRes.data || [];
      const occupied = rooms.filter(r => r.status === "occupied").length;
      setRoomsOccupied(occupied);

      // FEES
      const feesRes = await axios.get("http://localhost:5000/api/fees", config);
      const fees = feesRes.data?.data || feesRes.data || [];

      const pending = fees
        .filter(f => f.status === "pending")
        .reduce((sum, f) => sum + Number(f.amount || 0), 0);

      setPendingFees(pending);

      // COMPLAINTS
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
    <div className="space-y-6">

      {/* 🔷 HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back 👋</h1>
        <p className="text-sm opacity-90 mt-1">
          Manage hostel operations efficiently
        </p>
      </div>

      {/* 🔷 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Students */}
        <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-blue-400 to-indigo-500">
          <div className="bg-white rounded-2xl p-5 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Total Students</p>
              <div className="bg-blue-100 p-2 rounded-lg">👨‍🎓</div>
            </div>
            <h2 className="text-3xl font-bold text-blue-600 mt-3">
              {totalStudents}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Active + inactive</p>
          </div>
        </div>

        {/* Rooms */}
        <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-green-400 to-emerald-500">
          <div className="bg-white rounded-2xl p-5 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Rooms Occupied</p>
              <div className="bg-green-100 p-2 rounded-lg">🛏️</div>
            </div>
            <h2 className="text-3xl font-bold text-green-600 mt-3">
              {roomsOccupied}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Currently in use</p>
          </div>
        </div>

        {/* Fees */}
        <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-yellow-300 to-amber-400">
          <div className="bg-white rounded-2xl p-5 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Pending Fees</p>
              <div className="bg-yellow-100 p-2 rounded-lg">💰</div>
            </div>
            <h2 className="text-3xl font-bold text-yellow-600 mt-3">
              ₹{pendingFees}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
          </div>
        </div>

        {/* Complaints */}
        <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-red-400 to-pink-500">
          <div className="bg-white rounded-2xl p-5 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Complaints</p>
              <div className="bg-red-100 p-2 rounded-lg">⚠️</div>
            </div>
            <h2 className="text-3xl font-bold text-red-600 mt-3">
              {complaints}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Active issues</p>
          </div>
        </div>

      </div>

      {/* 🔷 QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Students */}
          <div
            onClick={() => navigate("/students")}
            className="group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-blue-400 to-indigo-500"
          >
            <div className="bg-white rounded-2xl p-6 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Manage Students
                </h3>
                <div className="bg-blue-100 p-2 rounded-lg">👨‍🎓</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add, update or remove student records
              </p>
            </div>
          </div>

          {/* Rooms */}
          <div
            onClick={() => navigate("/rooms")}
            className="group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-green-400 to-emerald-500"
          >
            <div className="bg-white rounded-2xl p-6 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  View Rooms
                </h3>
                <div className="bg-green-100 p-2 rounded-lg">🛏️</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Check room availability & allocation
              </p>
            </div>
          </div>

          {/* Fees */}
          <div
            onClick={() => navigate("/fees")}
            className="group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-yellow-300 to-amber-400"
          >
            <div className="bg-white rounded-2xl p-6 shadow transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Track Fees
                </h3>
                <div className="bg-yellow-100 p-2 rounded-lg">💰</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Monitor fee payments and dues
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;