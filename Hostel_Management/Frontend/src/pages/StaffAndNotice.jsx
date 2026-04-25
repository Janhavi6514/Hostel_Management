import { useState, useEffect } from 'react';
import { Plus, UserCheck, Pencil, Trash2, Search } from 'lucide-react';
import { staffAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Spinner,
  EmptyState, Input, Select, Button,
} from '../components/UI';

const defaultStaff = {
  name: '',
  email: '',
  phone: '',
  role: '',
  shift: 'Morning',
  status: 'active',
};

const StaffAndNotice = () => {
  const [staff, setStaff] = useState([]);
  const [staffLoad, setStaffLoad] = useState(true);
  const [showStaff, setShowStaff] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [staffForm, setStaffForm] = useState(defaultStaff);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [showConfirm, setConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data);
    } catch (err) { console.error(err); }
    finally { setStaffLoad(false); }
  };

  const openCreateStaff = () => {
    setEditStaff(null);
    setStaffForm(defaultStaff);
    setShowStaff(true);
  };

  const openEditStaff = (s) => {
    setEditStaff(s);
    setStaffForm({ ...s });
    setShowStaff(true);
  };

  const handleStaffChange = (e) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handleStaffSave = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.role) return;

    try {
      if (editStaff) {
        await staffAPI.update(editStaff.id, staffForm);
      } else {
        await staffAPI.create(staffForm);
      }
      setShowStaff(false);
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirm(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await staffAPI.delete(deleteId);
      setConfirm(false);
      fetchStaff();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  // 🔍 FILTER
  const filteredStaff = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && s.status === 'active') ||
      (filter === 'inactive' && s.status === 'inactive');

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-sm text-gray-400">Manage hostel staff efficiently</p>
        </div>

        <Button onClick={openCreateStaff}>
          <Plus size={16} /> Add Staff
        </Button>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="flex gap-4 items-center flex-wrap">

        {/* SEARCH */}
        <div className="relative w-80">
          <Search size={18} className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition"
          />
        </div>

        {/* FILTER */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm rounded-lg capitalize transition ${
                filter === f ? 'bg-white shadow text-blue-600' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

      </div>

      {/* STAFF LIST */}
      {staffLoad ? (
        <Spinner />
      ) : filteredStaff.length === 0 ? (
        <EmptyState icon={UserCheck} message="No staff found" />
      ) : (
        <div className="grid gap-4">
          {filteredStaff.map((s) => (
            <div
              key={s.id}
              className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition flex justify-between items-center border"
            >

              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                  {s.name.charAt(0)}
                </div>

                <div>
                  <p className="font-semibold text-lg">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>

                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {s.role}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      {s.shift}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">

                {/* STATUS BADGE */}
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  s.status === 'active'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {s.status}
                </span>

                {/* ACTIONS */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEditStaff(s)} className="hover:text-blue-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => confirmDelete(s.id)} className="hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={showStaff} onClose={() => setShowStaff(false)} title="Staff Details">
        <div className="space-y-3">
          <Input name="name" placeholder="Name" value={staffForm.name} onChange={handleStaffChange} />
          <Input name="email" placeholder="Email" value={staffForm.email} onChange={handleStaffChange} />
          <Input name="phone" placeholder="Phone" value={staffForm.phone} onChange={handleStaffChange} />
          <Input name="role" placeholder="Role" value={staffForm.role} onChange={handleStaffChange} />

          <Select name="shift" value={staffForm.shift} onChange={handleStaffChange}>
            <option>Morning</option>
            <option>Evening</option>
            <option>Night</option>
          </Select>

          <Select name="status" value={staffForm.status} onChange={handleStaffChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Button onClick={handleStaffSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />

    </div>
  );
};

export default StaffAndNotice;