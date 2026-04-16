import { useState, useEffect } from 'react';
import { Plus, Search, MessageSquareWarning, Trash2, RefreshCw } from 'lucide-react';
import { complaintAPI, studentAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Badge, Spinner,
  EmptyState, FormGroup, FormRow, Input, Select, Button,
} from '../components/UI';

const defaultForm = {
  student_id: '', subject: '', description: '',
  category: 'other', priority: 'medium',
};

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');

  const [showModal, setShowModal]   = useState(false);
  const [showConfirm, setConfirm]   = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const [form, setForm]             = useState(defaultForm);
  const [deleteId, setDeleteId]     = useState(null);
  const [selectedId, setSelected]   = useState(null);
  const [newStatus, setNewStatus]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await complaintAPI.getAll(params);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll({ status: 'active' });
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchComplaints(); }, [filterStatus]);
  useEffect(() => { fetchStudents(); }, []);

  const openCreate = () => { setForm(defaultForm); setShowModal(true); };

  const openStatusChange = (complaint) => {
    setSelected(complaint.id);
    setNewStatus(complaint.status);
    setShowStatus(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.student_id || !form.subject || !form.description) return;
    setSaving(true);
    try {
      await complaintAPI.create(form);
      setShowModal(false);
      fetchComplaints();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await complaintAPI.updateStatus(selectedId, { status: newStatus });
      setShowStatus(false);
      fetchComplaints();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await complaintAPI.delete(deleteId);
      setConfirm(false);
      fetchComplaints();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  // Summary counts
  const countBy = (s) => complaints.filter((c) => c.status === s).length;

  const filtered = complaints.filter((c) =>
    (c.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const priorityColor = {
    high:   'text-red-600 bg-red-50',
    medium: 'text-orange-600 bg-orange-50',
    low:    'text-slate-600 bg-slate-100',
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Complaints</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track and resolve student complaints</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New Complaint
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-yellow-600 font-medium">Open</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{countBy('open')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{countBy('in_progress')}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium">Resolved</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{countBy('resolved')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or subject..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner size={28} className="py-16" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquareWarning} message="No complaints found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.student_name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{c.subject}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityColor[c.priority] || ''}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.status !== 'resolved' && (
                          <button
                            onClick={() => openStatusChange(c)}
                            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium flex items-center gap-1"
                          >
                            <RefreshCw size={11} /> Update
                          </button>
                        )}
                        <button
                          onClick={() => { setDeleteId(c.id); setConfirm(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit New Complaint"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              Submit Complaint
            </Button>
          </>
        }
      >
        <FormGroup label="Student" required>
          <Select name="student_id" value={form.student_id} onChange={handleChange}>
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup label="Subject" required>
          <Input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief title of the complaint..."
          />
        </FormGroup>
        <FormRow>
          <FormGroup label="Category">
            <Select name="category" value={form.category} onChange={handleChange}>
              <option value="maintenance">Maintenance</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="food">Food</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>
          <FormGroup label="Priority">
            <Select name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormGroup>
        </FormRow>
        <FormGroup label="Description" required>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the complaint in detail..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </FormGroup>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
        title="Update Complaint Status"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStatus(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              Update Status
            </Button>
          </>
        }
      >
        <FormGroup label="New Status">
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </Select>
        </FormGroup>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default Complaint;