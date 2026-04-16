import { useState, useEffect } from 'react';
import { Plus, Search, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { studentAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Badge, Spinner,
  EmptyState, FormGroup, FormRow, Input, Select, Button,
} from '../components/UI';

const defaultForm = {
  name: '', email: '', phone: '', address: '',
  date_of_birth: '', id_proof_type: '', id_proof_number: '',
  gender: 'Male', status: 'active',
};

const Student = () => {
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView]   = useState(false);
  const [showConfirm, setConfirm] = useState(false);

  const [editStudent, setEdit]    = useState(null);
  const [viewStudent, setView]    = useState(null);
  const [form, setForm]           = useState(defaultForm);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const fetchStudents = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await studentAPI.getAll(params);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchStudents, 300);
    return () => clearTimeout(delay);
  }, [search, filterStatus]);

  const openCreate = () => { setEdit(null); setForm(defaultForm); setShowModal(true); };
  const openEdit   = (s)  => { setEdit(s); setForm({ ...s, date_of_birth: s.date_of_birth?.split('T')[0] || '' }); setShowModal(true); };

  const openView = async (s) => {
    try {
      const res = await studentAPI.getById(s.id);
      setView(res.data);
      setShowView(true);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      if (editStudent) {
        await studentAPI.update(editStudent.id, form);
      } else {
        await studentAPI.create(form);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentAPI.delete(deleteId);
      setConfirm(false);
      fetchStudents();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage hostel residents</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner size={28} className="py-16" />
        ) : students.length === 0 ? (
          <EmptyState icon={Users} message="No students found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Gender</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{s.gender}</td>
                    <td className="px-4 py-3"><Badge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openView(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { setDeleteId(s.id); setConfirm(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editStudent ? 'Edit Student' : 'Add New Student'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              {editStudent ? 'Save Changes' : 'Add Student'}
            </Button>
          </>
        }
      >
        <FormRow>
          <FormGroup label="Full Name" required>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
          </FormGroup>
          <FormGroup label="Email" required>
            <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Phone">
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
          </FormGroup>
          <FormGroup label="Date of Birth">
            <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Gender">
            <Select name="gender" value={form.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="ID Proof Type">
            <Select name="id_proof_type" value={form.id_proof_type} onChange={handleChange}>
              <option value="">Select...</option>
              <option>Aadhar Card</option>
              <option>Passport</option>
              <option>Driving License</option>
              <option>Voter ID</option>
              <option>PAN Card</option>
            </Select>
          </FormGroup>
          <FormGroup label="ID Proof Number">
            <Input name="id_proof_number" value={form.id_proof_number} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" />
          </FormGroup>
        </FormRow>
        <FormGroup label="Address">
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            placeholder="Full address..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </FormGroup>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showView}
        onClose={() => setShowView(false)}
        title="Student Details"
      >
        {viewStudent && (
          <div className="space-y-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {viewStudent.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-lg">{viewStudent.name}</p>
                <p className="text-sm text-slate-500">{viewStudent.email}</p>
                <Badge status={viewStudent.status} />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Phone', value: viewStudent.phone },
                { label: 'Gender', value: viewStudent.gender },
                { label: 'Date of Birth', value: viewStudent.date_of_birth ? new Date(viewStudent.date_of_birth).toLocaleDateString() : '—' },
                { label: 'ID Type', value: viewStudent.id_proof_type },
                { label: 'ID Number', value: viewStudent.id_proof_number },
                { label: 'Joined', value: new Date(viewStudent.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="font-medium text-slate-700 mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Address */}
            {viewStudent.address && (
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <p className="text-xs text-slate-400 mb-1">Address</p>
                <p className="text-slate-700">{viewStudent.address}</p>
              </div>
            )}

            {/* Current Room */}
            {viewStudent.allocation && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm">
                <p className="text-xs text-green-600 font-medium mb-1">Current Room</p>
                <p className="text-slate-700 font-semibold">Room {viewStudent.allocation.room_number} — {viewStudent.allocation.type}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Floor {viewStudent.allocation.floor} · ₹{Number(viewStudent.allocation.price_per_month).toLocaleString()}/month
                </p>
                <p className="text-xs text-slate-400">Check-in: {new Date(viewStudent.allocation.check_in).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? All related data will be removed."
        loading={deleting}
      />
    </div>
  );
};

export default Student;