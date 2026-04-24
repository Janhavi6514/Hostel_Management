import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PageHeader, LoadingSpinner } from '../components/UI';

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

  // LOAD DATA
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

  // OPEN EDIT
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

  // SAVE
  const handleSave = async () => {
    try {
      if (editFee) {
        await api.put(`/fees/${editFee.id}`, form);
      } else {
        await api.post('/fees', form);
      }

      toast.success('Saved successfully');
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error('Error saving');
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee?")) return;

    try {
      await api.delete(`/fees/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="💰 Fee Management"
        subtitle="Manage hostel fee collection"
      />

      {/* SEARCH */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search student..."
        className="border px-4 py-2 rounded w-full"
      />

      {/* CARDS */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition border"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  {f.student_name}
                </h3>

                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  f.status === 'paid'
                    ? 'bg-green-100 text-green-600'
                    : f.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {f.status}
                </span>
              </div>

              {/* AMOUNT */}
              <p className="text-2xl font-bold text-blue-600 mb-2">
                ₹{f.amount}
              </p>

              {/* DATE */}
              <p className="text-sm text-gray-500 mb-3">
                Due: {f.due_date?.split('T')[0]}
              </p>

              {/* DESCRIPTION */}
              {f.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {f.description}
                </p>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openEdit(f)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-red-500 font-medium hover:underline"
                >
                  🗑 Delete
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

            <h2 className="text-lg font-semibold mb-4">
              Edit Fee
            </h2>

            <select
              value={form.student_id}
              onChange={e => setForm({ ...form, student_id: e.target.value })}
              className="border p-2 w-full mb-2"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="border p-2 w-full mb-2"
              placeholder="Amount"
            />

            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border p-2 w-full mb-2"
              placeholder="Description"
            />

            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="border p-2 w-full mb-3"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}