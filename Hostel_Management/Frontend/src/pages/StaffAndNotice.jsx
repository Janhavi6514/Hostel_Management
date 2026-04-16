import { useState, useEffect } from 'react';
import { Plus, UserCheck, BellRing, Pencil, Trash2 } from 'lucide-react';
import { staffAPI, noticeAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Badge, Spinner,
  EmptyState, FormGroup, FormRow, Input, Select, Button,
} from '../components/UI';

const defaultStaff = {
  name: '', email: '', phone: '',
  role: '', shift: 'Morning', status: 'active',
};

const defaultNotice = {
  title: '', content: '', type: 'general',
  posted_by: '', expires_at: '',
};

const StaffAndNotice = () => {
  const [tab, setTab]             = useState('staff');

  // Staff state
  const [staff, setStaff]         = useState([]);
  const [staffLoad, setStaffLoad] = useState(true);
  const [showStaff, setShowStaff] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [staffForm, setStaffForm] = useState(defaultStaff);

  // Notice state
  const [notices, setNotices]         = useState([]);
  const [noticeLoad, setNoticeLoad]   = useState(true);
  const [showNotice, setShowNotice]   = useState(false);
  const [noticeForm, setNoticeForm]   = useState(defaultNotice);

  // Shared
  const [showConfirm, setConfirm] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleteType, setDelType]  = useState('');
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  // ─── Fetch ───
  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data);
    } catch (err) { console.error(err); }
    finally { setStaffLoad(false); }
  };

  const fetchNotices = async () => {
    try {
      const res = await noticeAPI.getAll();
      setNotices(res.data);
    } catch (err) { console.error(err); }
    finally { setNoticeLoad(false); }
  };

  useEffect(() => { fetchStaff(); fetchNotices(); }, []);

  // ─── Staff handlers ───
  const openCreateStaff = () => { setEditStaff(null); setStaffForm(defaultStaff); setShowStaff(true); };
  const openEditStaff   = (s)  => { setEditStaff(s); setStaffForm({ ...s }); setShowStaff(true); };

  const handleStaffChange = (e) =>
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });

  const handleStaffSave = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.role) return;
    setSaving(true);
    try {
      if (editStaff) {
        await staffAPI.update(editStaff.id, staffForm);
      } else {
        await staffAPI.create(staffForm);
      }
      setShowStaff(false);
      fetchStaff();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ─── Notice handlers ───
  const openCreateNotice = () => { setNoticeForm(defaultNotice); setShowNotice(true); };

  const handleNoticeChange = (e) =>
    setNoticeForm({ ...noticeForm, [e.target.name]: e.target.value });

  const handleNoticeSave = async () => {
    if (!noticeForm.title || !noticeForm.content) return;
    setSaving(true);
    try {
      await noticeAPI.create(noticeForm);
      setShowNotice(false);
      fetchNotices();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ─── Delete ───
  const confirmDelete = (id, type) => {
    setDeleteId(id); setDelType(type); setConfirm(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteType === 'staff')  await staffAPI.delete(deleteId);
      if (deleteType === 'notice') await noticeAPI.delete(deleteId);
      setConfirm(false);
      if (deleteType === 'staff')  fetchStaff();
      if (deleteType === 'notice') fetchNotices();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  const noticeTypeColor = {
    general:     'bg-slate-100 text-slate-600',
    urgent:      'bg-red-100 text-red-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    event:       'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff & Notices</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage hostel staff and announcements</p>
        </div>
        {tab === 'staff' ? (
          <Button onClick={openCreateStaff}>
            <Plus size={16} /> Add Staff
          </Button>
        ) : (
          <Button onClick={openCreateNotice}>
            <Plus size={16} /> Post Notice
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'staff',   label: 'Staff',   icon: UserCheck },
          { key: 'notices', label: 'Notices', icon: BellRing  },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── STAFF TAB ── */}
      {tab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {staffLoad ? (
            <Spinner size={28} className="py-16" />
          ) : staff.length === 0 ? (
            <EmptyState icon={UserCheck} message="No staff members added yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Shift</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{s.email}</td>
                      <td className="px-4 py-3 text-slate-600">{s.role}</td>
                      <td className="px-4 py-3 text-slate-500">{s.shift}</td>
                      <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                      <td className="px-4 py-3"><Badge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditStaff(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(s.id, 'staff')}
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
      )}

      {/* ── NOTICES TAB ── */}
      {tab === 'notices' && (
        <div className="space-y-3">
          {noticeLoad ? (
            <Spinner size={28} className="py-16" />
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
              <EmptyState icon={BellRing} message="No notices posted yet" />
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex gap-4"
              >
                {/* Type indicator */}
                <div className={`w-1.5 rounded-full shrink-0 ${
                  n.type === 'urgent' ? 'bg-red-400' :
                  n.type === 'maintenance' ? 'bg-yellow-400' :
                  n.type === 'event' ? 'bg-purple-400' : 'bg-slate-300'
                }`} />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{n.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${noticeTypeColor[n.type] || ''}`}>
                          {n.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{n.content}</p>
                    </div>
                    <button
                      onClick={() => confirmDelete(n.id, 'notice')}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    {n.posted_by && <span>Posted by <span className="font-medium">{n.posted_by}</span></span>}
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    {n.expires_at && (
                      <span>Expires: {new Date(n.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Staff Modal */}
      <Modal
        isOpen={showStaff}
        onClose={() => setShowStaff(false)}
        title={editStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStaff(false)}>Cancel</Button>
            <Button onClick={handleStaffSave} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              {editStaff ? 'Save Changes' : 'Add Staff'}
            </Button>
          </>
        }
      >
        <FormRow>
          <FormGroup label="Full Name" required>
            <Input name="name" value={staffForm.name} onChange={handleStaffChange} placeholder="John Smith" />
          </FormGroup>
          <FormGroup label="Email" required>
            <Input type="email" name="email" value={staffForm.email} onChange={handleStaffChange} placeholder="john@hostel.com" />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Phone">
            <Input name="phone" value={staffForm.phone} onChange={handleStaffChange} placeholder="+91 9876543210" />
          </FormGroup>
          <FormGroup label="Role" required>
            <Input name="role" value={staffForm.role} onChange={handleStaffChange} placeholder="Warden, Security, Cook..." />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Shift">
            <Select name="shift" value={staffForm.shift} onChange={handleStaffChange}>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select name="status" value={staffForm.status} onChange={handleStaffChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormGroup>
        </FormRow>
      </Modal>

      {/* Notice Modal */}
      <Modal
        isOpen={showNotice}
        onClose={() => setShowNotice(false)}
        title="Post New Notice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNotice(false)}>Cancel</Button>
            <Button onClick={handleNoticeSave} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              Post Notice
            </Button>
          </>
        }
      >
        <FormGroup label="Title" required>
          <Input name="title" value={noticeForm.title} onChange={handleNoticeChange} placeholder="Notice title..." />
        </FormGroup>
        <FormRow>
          <FormGroup label="Type">
            <Select name="type" value={noticeForm.type} onChange={handleNoticeChange}>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="maintenance">Maintenance</option>
              <option value="event">Event</option>
            </Select>
          </FormGroup>
          <FormGroup label="Posted By">
            <Input name="posted_by" value={noticeForm.posted_by} onChange={handleNoticeChange} placeholder="Admin" />
          </FormGroup>
        </FormRow>
        <FormGroup label="Expiry Date">
          <Input type="date" name="expires_at" value={noticeForm.expires_at} onChange={handleNoticeChange} />
        </FormGroup>
        <FormGroup label="Content" required>
          <textarea
            name="content"
            value={noticeForm.content}
            onChange={handleNoticeChange}
            rows={3}
            placeholder="Write notice content here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </FormGroup>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title={deleteType === 'staff' ? 'Delete Staff Member' : 'Delete Notice'}
        message={
          deleteType === 'staff'
            ? 'Are you sure you want to remove this staff member?'
            : 'Are you sure you want to delete this notice?'
        }
        loading={deleting}
      />
    </div>
  );
};

export default StaffAndNotice;