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
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-slate-400">Manage hostel residents</p>
        </div>

        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
          <Plus size={16} /> Add Student
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">

        {loading ? (
          <Spinner size={30} className="py-16" />
        ) : students.length === 0 ? (
          <EmptyState icon={Users} message="No students found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">

              <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
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

              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-800 transition">

                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center font-bold text-blue-400">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.phone || '-'}</td>
                    <td className="px-4 py-3">{s.gender}</td>

                    <td className="px-4 py-3">
                      <Badge status={s.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">

                        <button
                          onClick={() => openView(s)}
                          className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg hover:bg-yellow-500/20 text-yellow-400"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => { setDeleteId(s.id); setConfirm(true); }}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
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

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editStudent ? 'Edit Student' : 'Add Student'}
      >
        <FormRow>
          <FormGroup label="Full Name">
            <Input className="bg-slate-800 text-white" name="name" value={form.name} onChange={handleChange} />
          </FormGroup>

          <FormGroup label="Email">
            <Input className="bg-slate-800 text-white" name="email" value={form.email} onChange={handleChange} />
          </FormGroup>
        </FormRow>

        <Button onClick={handleSave}>{saving ? "Saving..." : "Save"}</Button>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
};

export default Student;