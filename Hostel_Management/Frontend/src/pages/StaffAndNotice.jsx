import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserCheck, Pencil } from 'lucide-react';
import { staffAPI, noticeAPI } from '../Utils/api';
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

const typeColors = {
  general: "bg-blue-500/20 text-blue-400",
  urgent: "bg-red-500/20 text-red-400",
  event: "bg-purple-500/20 text-purple-400",
  maintenance: "bg-yellow-500/20 text-yellow-400",
};

const StaffAndNotice = () => {
  const [tab, setTab] = useState('staff');

  const [staff, setStaff] = useState([]);
  const [staffLoad, setStaffLoad] = useState(true);

  const [notices, setNotices] = useState([]);
  const [noticeLoad, setNoticeLoad] = useState(true);

  const [search, setSearch] = useState('');

  const [showStaff, setShowStaff] = useState(false);
  const [staffForm, setStaffForm] = useState(defaultStaff);
  const [editStaff, setEditStaff] = useState(null);

  const [showNotice, setShowNotice] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'general',
  });

  const [showConfirm, setConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    fetchStaff();
    fetchNotices();
  }, []);

  const fetchStaff = async () => {
    const res = await staffAPI.getAll();
    setStaff(res.data);
    setStaffLoad(false);
  };

  const fetchNotices = async () => {
    const res = await noticeAPI.getAll();
    setNotices(res.data);
    setNoticeLoad(false);
  };

  const handleStaffSave = async () => {
    if (editStaff) {
      await staffAPI.update(editStaff.id, staffForm);
    } else {
      await staffAPI.create(staffForm);
    }
    setShowStaff(false);
    setEditStaff(null);
    setStaffForm(defaultStaff);
    fetchStaff();
  };

  const handleNoticeSave = async () => {
    await noticeAPI.create(noticeForm);
    setShowNotice(false);
    setNoticeForm({ title: '', content: '', type: 'general' });
    fetchNotices();
  };

  const handleDelete = async () => {
    if (deleteType === 'staff') {
      await staffAPI.delete(deleteId);
      fetchStaff();
    } else {
      await noticeAPI.delete(deleteId);
      fetchNotices();
    }
    setConfirm(false);
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff & Notices</h1>
          <p className="text-slate-400">Manage staff and announcements</p>
        </div>

        {tab === 'staff' ? (
          <Button
            onClick={() => {
              setEditStaff(null);
              setStaffForm(defaultStaff);
              setShowStaff(true);
            }}
          >
            <Plus size={16}/> Add Staff
          </Button>
        ) : (
          <Button onClick={() => setShowNotice(true)}>
            <Plus size={16}/> Post Notice
          </Button>
        )}
      </div>

      {/* TABS */}
      <div className="flex bg-slate-800 p-1 rounded-xl w-fit">
        {['staff','notices'].map(t => (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm ${
              tab===t
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* STAFF */}
      {tab === 'staff' && (
        <>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded w-80">
            <Search size={16}/>
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search staff..."
              className="bg-transparent outline-none w-full"
            />
          </div>

          {staffLoad ? <Spinner/> : filteredStaff.length === 0 ? (
            <EmptyState icon={UserCheck} message="No staff found"/>
          ) : (
            <div className="grid gap-4">
              {filteredStaff.map(s => (
                <div key={s.id}
                  className="bg-[#0f172a] border border-slate-800 p-5 rounded-xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-slate-400">{s.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditStaff(s);
                        setStaffForm(s);
                        setShowStaff(true);
                      }}
                      className="text-yellow-400"
                    >
                      <Pencil size={16}/>
                    </button>

                    <button
                      onClick={()=>{
                        setDeleteId(s.id);
                        setDeleteType('staff');
                        setConfirm(true);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* NOTICES */}
      {tab === 'notices' && (
        <div className="space-y-5">
          {noticeLoad ? <Spinner/> : notices.map(n => (
            <div key={n.id}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-5"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{n.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${typeColors[n.type]}`}>
                    {n.type}
                  </span>
                </div>

                <button
                  onClick={()=>{
                    setDeleteId(n.id);
                    setDeleteType('notice');
                    setConfirm(true);
                  }}
                  className="text-red-400"
                >
                  <Trash2 size={16}/>
                </button>
              </div>

              <p className="text-slate-400 mt-2">{n.content}</p>
              <p className="text-xs text-slate-500 mt-2">
                {new Date(n.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* STAFF MODAL (kept using your Modal) */}
      {/* STAFF MODAL */}
<Modal
  isOpen={showStaff}
  onClose={() => setShowStaff(false)}
  title={editStaff ? "Edit Staff" : "Add Staff"}
>

  <input
    placeholder="Name"
    value={staffForm.name}
    onChange={(e)=>setStaffForm({...staffForm,name:e.target.value})}
    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
  />

  <input
    placeholder="Email"
    value={staffForm.email}
    onChange={(e)=>setStaffForm({...staffForm,email:e.target.value})}
    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
  />

  <input
    placeholder="Phone"
    value={staffForm.phone}
    onChange={(e)=>setStaffForm({...staffForm,phone:e.target.value})}
    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
  />

  <input
    placeholder="Role"
    value={staffForm.role}
    onChange={(e)=>setStaffForm({...staffForm,role:e.target.value})}
    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
  />

  <select
    value={staffForm.shift}
    onChange={(e)=>setStaffForm({...staffForm,shift:e.target.value})}
    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
  >
    <option>Morning</option>
    <option>Evening</option>
    <option>Night</option>
  </select>

  <button
    onClick={handleStaffSave}
    className="w-full mt-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition font-medium"
  >
    {editStaff ? "Update Staff" : "Add Staff"}
  </button>

</Modal>

      {/* ✅ CUSTOM NOTICE MODAL (NO WHITE BACKGROUND) */}
      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotice(false)}
          />

          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 w-[420px] shadow-2xl text-white z-10">

            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Post Notice</h2>
              <button onClick={()=>setShowNotice(false)}>✕</button>
            </div>

            <input
              placeholder="Enter title..."
              value={noticeForm.title}
              onChange={(e)=>setNoticeForm({...noticeForm,title:e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mb-3"
            />

            <textarea
              placeholder="Write notice..."
              value={noticeForm.content}
              onChange={(e)=>setNoticeForm({...noticeForm,content:e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mb-3 h-24"
            />

            <select
              value={noticeForm.type}
              onChange={(e)=>setNoticeForm({...noticeForm,type:e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mb-4"
            >
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="event">Event</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <button
              onClick={handleNoticeSave}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-2 rounded-lg"
            >
              Post Notice
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={()=>setConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default StaffAndNotice;