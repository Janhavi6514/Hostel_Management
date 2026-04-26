import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/UI';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const defaultForm = {
  student_id: '',
  amount: '',
  due_date: '',
  description: '',
  status: 'pending'
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editFee, setEditFee] = useState(null);

  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);

    Promise.all([
      api.get('/fees'),
      api.get('/students?status=active'),
    ])
      .then(([feesRes, studentsRes]) => {
        setFees(feesRes.data || []);
        setStudents(studentsRes.data.data || studentsRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load');
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = fees.filter(f =>
    (f.student_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id == form.student_id);

  const openEdit = (fee) => {
    setEditFee(fee);
    setForm({
      student_id: fee.student_id,
      amount: fee.amount,
      due_date: fee.due_date?.split('T')[0],
      description: fee.description || '',
      status: fee.status || 'pending'
    });
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditFee(null);
    setForm({
      ...defaultForm,
      description: `Room Rent - ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`
    });
    setStudentSearch('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!form.student_id || !form.amount || !form.due_date) {
        return toast.error("Please fill all fields");
      }

      if (editFee) {
        await api.put(`/fees/${editFee.id}`, form);
      } else {
        await api.post('/fees', form);
      }

      toast.success(editFee ? 'Updated' : 'Fee Added');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete fee?")) return;

    await api.delete(`/fees/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6 text-white">

      {/* 🔥 HEADER FIXED */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            💰 Fee Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage hostel fee collection
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-xl shadow hover:opacity-90 transition"
        >
          + Add Fee
        </button>
      </div>

      {/* 🔥 DIVIDER */}
      <div className="h-px bg-slate-800 w-full"></div>

      {/* 🔥 SEARCH FIXED */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search student..."
        className="bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
      />

      {/* CARDS */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow hover:shadow-xl hover:-translate-y-1 transition group"
            >

              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg group-hover:text-blue-400 transition">
                  {f.student_name}
                </h3>

                <span className={`text-xs px-3 py-1 rounded-full ${
                  f.status === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : f.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {f.status}
                </span>
              </div>

              <p className="text-3xl font-bold text-blue-400">
                ₹{f.amount}
              </p>

              <div className="mt-3 text-sm text-slate-400 space-y-1">
                <p>📅 Due: {f.due_date?.split('T')[0]}</p>
                <p>🏠 {f.description}</p>
                <p className="text-xs">ID: #{f.id}</p>
              </div>

              {f.status === 'overdue' && (
                <p className="text-red-400 text-xs mt-2 animate-pulse">
                  ⚠ Payment overdue
                </p>
              )}

              <div className="flex justify-between mt-4 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(f)} className="text-blue-400 hover:underline">
                  ✏️ Edit
                </button>

                <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:underline">
                  🗑 Delete
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

          <div className="bg-[#0f172a] border border-slate-800 w-[420px] rounded-2xl p-6 shadow-xl text-white">

            <h2 className="text-xl font-semibold mb-4">
              {editFee ? "Edit Fee" : "Add Fee"}
            </h2>

            {/* STUDENT DROPDOWN */}
            <div className="relative mb-4">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg cursor-pointer flex justify-between"
              >
                {selectedStudent ? selectedStudent.name : "Select Student"}
              </div>

              {dropdownOpen && (
                <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-lg mt-1 max-h-48 overflow-y-auto">
                  <input
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full p-2 bg-slate-800 border-b border-slate-700 outline-none"
                  />

                  {filteredStudents.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setForm({ ...form, student_id: s.id });
                        setDropdownOpen(false);
                      }}
                      className="p-2 hover:bg-blue-500/20 cursor-pointer"
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount"
              className="bg-slate-800 border border-slate-700 p-2 w-full mb-2 rounded"
            />

            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="bg-slate-800 border border-slate-700 p-2 w-full mb-2 rounded"
            />

            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="bg-slate-800 border border-slate-700 p-2 w-full mb-2 rounded"
            />

            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="bg-slate-800 border border-slate-700 p-2 w-full mb-4 rounded"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-600 rounded">
                Cancel
              </button>

              <button onClick={handleSave} className="bg-blue-600 px-4 py-2 rounded">
                {editFee ? "Update" : "Add"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}