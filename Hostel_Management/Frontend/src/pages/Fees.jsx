import React, { useState, useEffect, useCallback } from 'react';
import { Card, StatusBadge, Modal, Input, Select, Button, PageHeader, LoadingSpinner, ConfirmDialog, StatCard } from '../components/UI';
import axios from 'axios';
import toast from 'react-hot-toast';

// Direct API instance pointing to backend
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const defaultForm = {
  student_id: '',
  amount: '',
  fee_type: 'rent',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  due_date: '',
  remarks: '',
};

const defaultPayForm = { payment_method: 'upi', transaction_id: '' };

export default function Fees() {
  const [fees, setFees]               = useState([]);
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingFee, setPayingFee]     = useState(null);
  const [editFee, setEditFee]         = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState(defaultForm);
  const [payForm, setPayForm]         = useState(defaultPayForm);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState({ status: '', month: '', year: '' });

  // ── Load fees and students ──────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filter).filter(([, v]) => v))
    );
    Promise.all([
      api.get(`/fees?${params}`),
      api.get('/students?status=active'),
    ])
      .then(([feesRes, studentsRes]) => {
        setFees(feesRes.data || []);         //
        setStudents(studentsRes.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Load error:', err);
        toast.error('Failed to load fees');
        setLoading(false);
      });
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Summary stats ───────────────────────────────────────────────────────────
  const stats = {
    total:     fees.reduce((s, f) => s + Number(f.amount), 0),
    collected: fees.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0),
    pending:   fees.filter(f => f.status === 'pending').reduce((s, f) => s + Number(f.amount), 0),
    overdue:   fees.filter(f => f.status === 'overdue').reduce((s, f) => s + Number(f.amount), 0),
  };

  // ── Filtered list (by search) ───────────────────────────────────────────────
  const filtered = fees.filter(f =>
    (f.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Open Add modal ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditFee(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  const openEdit = (fee) => {
    setEditFee(fee);
    setForm({
      student_id: fee.student_id,
      amount: fee.amount,
      fee_type: fee.fee_type,
      month: fee.month,
      year: fee.year,
      due_date: fee.due_date?.slice(0, 10) || '',
      remarks: fee.remarks || '',
    });
    setModalOpen(true);
  };

  // ── Open Pay modal ──────────────────────────────────────────────────────────
  const openPay = (fee) => {
    setPayingFee(fee);
    setPayForm(defaultPayForm);
    setPayModalOpen(true);
  };

  // ── Save (create or update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.student_id || !form.amount || !form.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editFee) {
        await api.put(`/fees/${editFee.id}/status`, { status: form.status || editFee.status });
        toast.success('Fee updated');
      } else {
        await api.post('/fees', form);
        toast.success('Fee record created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving fee');
    } finally { setSaving(false); }
  };

  // ── Mark as Paid ────────────────────────────────────────────────────────────
  const handleMarkPaid = async () => {
    setSaving(true);
    try {
      await api.put(`/fees/${payingFee.id}/pay`, payForm);
      toast.success('Fee marked as paid ✅');
      setPayModalOpen(false);
      setPayingFee(null);
      load();
    } catch (err) {
      toast.error('Error recording payment');
    } finally { setSaving(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/fees/${deleteId}`);
      toast.success('Fee deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error('Error deleting fee');
    } finally { setDeleting(false); }
  };

  // ── Generate monthly fees ───────────────────────────────────────────────────
  const generateMonthly = async () => {
    try {
      const now = new Date();
      const res = await api.post('/fees/generate-monthly', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error('Error generating fees');
    }
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <PageHeader
        title="Fee Management"
        subtitle="Track and manage hostel fees"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={generateMonthly}>Generate Monthly</Button>
            <Button onClick={openAdd}>+ Add Fee</Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Fees"
          value={`₹${stats.total.toLocaleString('en-IN')}`}
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
        <StatCard
          label="Collected"
          value={`₹${stats.collected.toLocaleString('en-IN')}`}
          color="green"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Pending"
          value={`₹${stats.pending.toLocaleString('en-IN')}`}
          color="yellow"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={`₹${stats.overdue.toLocaleString('en-IN')}`}
          color="red"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500"
          />
        </div>

        {/* Status filter buttons */}
        {[['', 'All'], ['pending', 'Pending'], ['paid', 'Paid'], ['overdue', 'Overdue']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(f => ({ ...f, status: v }))}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter.status === v
                ? 'bg-brand-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}

        {/* Month dropdown */}
        <Select value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </Select>

        {/* Year dropdown */}
        <Select value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}>
          <option value="">All Years</option>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['#', 'Student', 'Room', 'Type', 'Amount', 'Period', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((fee, i) => (
                  <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4 text-slate-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm font-medium">{fee.student_name}</p>
                      <p className="text-slate-500 text-xs">{fee.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300 text-sm">
                        {fee.room_number ? `Room ${fee.room_number}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300 text-sm capitalize">{fee.fee_type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white font-semibold text-sm">
                        ₹{Number(fee.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300 text-sm">
                        {MONTHS[fee.month - 1]} {fee.year}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${
                        new Date(fee.due_date) < new Date() && fee.status !== 'paid'
                          ? 'text-red-400'
                          : 'text-slate-300'
                      }`}>
                        {fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Mark Paid */}
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => openPay(fee)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            Mark Paid
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(fee)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(fee.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-slate-500 py-12">No fee records found</p>
            )}
          </div>
        </Card>
      )}

      {/* ── Add / Edit Fee Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editFee ? 'Edit Fee Record' : 'Add Fee Record'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Select
                label="Student *"
                value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}
              >
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Room {s.room_number || 'N/A'}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label="Fee Type"
              value={form.fee_type}
              onChange={e => setForm({ ...form, fee_type: e.target.value })}
            >
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="mess">Mess</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </Select>

            <Input
              label="Amount (₹) *"
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="5000"
            />

            <Select
              label="Month"
              value={form.month}
              onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </Select>

            <Input
              label="Year"
              type="number"
              value={form.year}
              onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
            />

            <div className="col-span-2">
              <Input
                label="Due Date *"
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Remarks (optional)"
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                placeholder="e.g. Monthly hostel rent"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {editFee ? 'Save Changes' : 'Add Fee'}
          </Button>
        </div>
      </Modal>

      {/* ── Mark as Paid Modal ── */}
      <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Payment" size="sm">
        {payingFee && (
          <div className="space-y-4">
            {/* Fee summary */}
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Amount to collect</p>
              <p className="font-display text-2xl font-bold text-white">
                ₹{Number(payingFee.amount).toLocaleString('en-IN')}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {payingFee.student_name} · {MONTHS[payingFee.month - 1]} {payingFee.year}
              </p>
            </div>

            <Select
              label="Payment Method"
              value={payForm.payment_method}
              onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}
            >
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="online">Online Transfer</option>
              <option value="card">Card</option>
            </Select>

            <Input
              label="Transaction ID (optional)"
              value={payForm.transaction_id}
              onChange={e => setPayForm({ ...payForm, transaction_id: e.target.value })}
              placeholder="UTR / reference number"
            />

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setPayModalOpen(false)}>Cancel</Button>
              <Button onClick={handleMarkPaid} loading={saving}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Fee Record"
        message="Are you sure you want to delete this fee record? This action cannot be undone."
      />
    </div>
  );
}