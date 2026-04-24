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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showConfirm, setConfirm] = useState(false);

  const [editStudent, setEdit] = useState(null);
  const [viewStudent, setView] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ FETCH
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

  const openCreate = () => {
    setEdit(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEdit(s);
    setForm({
      ...s,
      date_of_birth: s.date_of_birth?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const openView = async (s) => {
    try {
      const res = await studentAPI.getById(s.id);
      setView(res.data);
      setShowView(true);
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentAPI.delete(deleteId);
      setConfirm(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* 🔷 HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-400">Manage hostel residents</p>
        </div>

        <Button className="shadow-md hover:scale-105 transition" onClick={openCreate}>
          <Plus size={16} /> Add Student
        </Button>
      </div>

      {/* 🔷 FILTERS */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border">

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* 🔷 TABLE CARD */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        {loading ? (
          <Spinner size={30} className="py-16" />
        ) : students.length === 0 ? (
          <EmptyState icon={Users} message="No students found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              {/* HEADER */}
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-t hover:bg-slate-50 transition">

                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>

                    {/* STUDENT */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || '-'}</td>
                    <td className="px-4 py-3">{s.gender}</td>

                    <td className="px-4 py-3">
                      <Badge status={s.status} />
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">

                        <button
                          onClick={() => openView(s)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => { setDeleteId(s.id); setConfirm(true); }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={16} />
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

      {/* 🔷 MODAL + VIEW + DELETE (same logic, no backend change needed) */}
      <Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title={editStudent ? 'Edit Student' : 'Add Student'}
  footer={
    <>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : editStudent ? "Save Changes" : "Add Student"}
      </Button>
    </>
  }
>

  <FormRow>
    <FormGroup label="Full Name" required>
      <Input name="name" value={form.name} onChange={handleChange} />
    </FormGroup>

    <FormGroup label="Email" required>
      <Input type="email" name="email" value={form.email} onChange={handleChange} />
    </FormGroup>
  </FormRow>

  <FormRow>
    <FormGroup label="Phone">
      <Input name="phone" value={form.phone} onChange={handleChange} />
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
      <Input name="id_proof_number" value={form.id_proof_number} onChange={handleChange} />
    </FormGroup>
  </FormRow>

  <FormGroup label="Address">
    <textarea
      name="address"
      value={form.address}
      onChange={handleChange}
      rows={2}
      className="w-full px-3 py-2 border rounded-lg"
    />
  </FormGroup>

</Modal>

      <Modal isOpen={showView} onClose={() => setShowView(false)} title="Student Details">
        {viewStudent && (
          <div className="space-y-3">
            <p><b>Name:</b> {viewStudent.name}</p>
            <p><b>Email:</b> {viewStudent.email}</p>
            <p><b>Phone:</b> {viewStudent.phone}</p>
            <p><b>Status:</b> {viewStudent.status}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure?"
        loading={deleting}
      />

    </div>
  );
};

export default Student;