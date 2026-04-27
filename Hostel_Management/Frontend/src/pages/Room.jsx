import { useState, useEffect } from 'react';
import { Plus, BedDouble, Pencil, Trash2 } from 'lucide-react';
import { roomAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Spinner,
  EmptyState, FormGroup, Button,
} from '../components/UI';

const defaultForm = {
  room_number: '',
  type: 'Single',
  capacity: 1,
  floor: 1,
  price_per_month: '',
  status: 'available',
  gender: '',
};

const normalizeGender = (g) => {
  if (!g) return '';
  const val = g.toLowerCase().trim();
  if (val.includes('girl')) return 'girls';
  if (val.includes('boy')) return 'boys';
  return val;
};

const Room = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setConfirm] = useState(false);

  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await roomAPI.getAll();
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditRoom(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({ ...room, gender: normalizeGender(room.gender) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.room_number || !form.capacity || !form.price_per_month || !form.gender) {
      alert("Fill all required fields");
      return;
    }

    try {
      if (editRoom) {
        await roomAPI.update(editRoom.id, form);
      } else {
        await roomAPI.create(form);
      }

      setShowModal(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Error saving room");
    }
  };

  const handleDelete = async () => {
    await roomAPI.delete(deleteId);
    setConfirm(false);
    fetchRooms();
  };

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.room_number.toString().includes(search) ||
      r.type?.toLowerCase().includes(search.toLowerCase());

    const matchGender =
      activeTab === 'all'
        ? true
        : normalizeGender(r.gender).includes(activeTab);

    return matchSearch && matchGender;
  });

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>

        <Button
          onClick={openCreate}
          variant="custom"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16}/> Add Room
        </Button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {['all','boys','girls'].map(tab => (
          <button
            key={tab}
            onClick={()=>setActiveTab(tab)}
            className={`px-4 py-1 rounded-lg text-sm ${
              activeTab===tab
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {tab==='all' ? 'All' : tab==='boys' ? '👦 Boys' : '👧 Girls'}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search rooms..."
        className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg w-full max-w-xs text-white"
      />

      {/* CARDS */}
      {loading ? <Spinner/> : filtered.length === 0 ? (
        <EmptyState icon={BedDouble} message="No rooms found"/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filtered.map(room => (
            <div
              key={room.id}
              className="
                bg-[#0f172a]
                border border-slate-800
                rounded-xl p-4
                relative group
                transition-all duration-300

                hover:shadow-2xl
                hover:shadow-blue-500/10
                hover:-translate-y-2
                hover:scale-[1.02]
                hover:border-blue-500/40
              "
            >
              {/* HEADER */}
              <div className="flex justify-between">
                <h2 className="font-semibold text-sm">
                  Room {room.room_number}
                </h2>

                <span className="text-xs">
                  {normalizeGender(room.gender) === 'boys' ? '👦' : '👧'}
                </span>
              </div>

              {/* DETAILS */}
              <div className="text-xs text-slate-400 flex justify-between mt-1">
                <span>Floor {room.floor}</span>
                <span>{room.capacity} Beds</span>
              </div>

              <p className="text-lg font-bold mt-2">
                ₹{room.price_per_month}
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">

                <button
                  onClick={() => openEdit(room)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded transition"
                >
                  <Pencil size={16} className="text-blue-400"/>
                </button>

                <button
                  onClick={() => {
                    setDeleteId(room.id);
                    setConfirm(true);
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded transition"
                >
                  <Trash2 size={16} className="text-red-400"/>
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Room">

        <FormGroup label="Room Number">
          <input
            name="room_number"
            value={form.room_number}
            onChange={handleChange}
            className="w-full bg-slate-800 px-3 py-2 rounded border border-slate-700 text-white"
          />
        </FormGroup>

        <FormGroup label="Capacity">
          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            className="w-full bg-slate-800 px-3 py-2 rounded border border-slate-700 text-white"
          />
        </FormGroup>

        <FormGroup label="Price">
          <input
            name="price_per_month"
            value={form.price_per_month}
            onChange={handleChange}
            className="w-full bg-slate-800 px-3 py-2 rounded border border-slate-700 text-white"
          />
        </FormGroup>

        <FormGroup label="Gender">
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full bg-slate-800 px-3 py-2 rounded border border-slate-700 text-white"
          >
            <option value="">Select Gender</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </FormGroup>

        <Button onClick={handleSave} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
          Save
        </Button>

      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={()=>setConfirm(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
};

export default Room;