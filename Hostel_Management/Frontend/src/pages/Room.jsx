import { useState, useEffect } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import { roomAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Spinner,
  EmptyState, FormGroup, Input, Select, Button,
} from '../components/UI';

const defaultForm = {
  room_number: '',
  type: 'Single',
  capacity: 1,
  floor: 1,
  price_per_month: '',
  status: 'available',
  gender: '',
  amenities: '',
  description: '',
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

  const [selectedRoom, setSelectedRoom] = useState(null);
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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openCreate = () => {
    setEditRoom(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      ...room,
      gender: normalizeGender(room.gender)
    });
    setShowModal(true);
  };

  const handleSave = async () => {
  console.log("FORM BEFORE:", form);

  if (!form.room_number || !form.capacity || !form.price_per_month || !form.gender) {
    alert("Fill all required fields");
    return;
  }

  try {
    const payload = {
      ...form,
      gender: form.gender === "girls" ? "girls" : "boys"
    };

    console.log("SENDING TO BACKEND:", payload);

    if (editRoom) {
      await roomAPI.update(editRoom.id, payload);
    } else {
      await roomAPI.create(payload);
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
      r.type.toLowerCase().includes(search.toLowerCase());

    const matchGender =
  activeTab === 'all'
    ? true
    : normalizeGender(r.gender).includes(activeTab);

    return matchSearch && matchGender;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Rooms</h1>
        <Button onClick={openCreate}>
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
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100'
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
        className="border px-3 py-2 rounded-lg w-full max-w-xs"
      />

      {/* CARDS */}
      {loading ? <Spinner/> : filtered.length === 0 ? (
        <EmptyState icon={BedDouble} message="No rooms found"/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filtered.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-xl p-4 shadow hover:shadow-lg border"
            >
              <div className="flex justify-between mb-2">
                <h2 className="font-semibold text-sm">
                  Room {room.room_number}
                </h2>

                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  normalizeGender(room.gender) === 'boys'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-pink-100 text-pink-600'
                }`}>
                  {normalizeGender(room.gender) === 'boys' ? '👦' : '👧'}
                </span>
              </div>

              <div className="text-xs text-gray-500 flex justify-between">
                <span>Floor {room.floor}</span>
                <span>{room.capacity} Beds</span>
              </div>

              <p className="text-base font-bold mt-2">
                ₹{room.price_per_month}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={()=>setSelectedRoom(room)}
                  className="flex-1 bg-blue-100 text-blue-600 text-xs py-1 rounded"
                >
                  View
                </button>

                <button onClick={()=>openEdit(room)}>✏️</button>

                <button onClick={()=>{
                  setDeleteId(room.id);
                  setConfirm(true);
                }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* ✅ VIEW MODAL */}
      <Modal isOpen={!!selectedRoom} onClose={()=>setSelectedRoom(null)} title="Room Details">
        {selectedRoom && (
          <div className="space-y-2 text-sm">
            <p><b>Room:</b> {selectedRoom.room_number}</p>
            <p><b>Type:</b> {selectedRoom.type}</p>
            <p><b>Floor:</b> {selectedRoom.floor}</p>
            <p><b>Capacity:</b> {selectedRoom.capacity}</p>
            <p><b>Gender:</b> {selectedRoom.gender}</p>
            <p><b>Price:</b> ₹{selectedRoom.price_per_month}</p>
            <p><b>Amenities:</b> {selectedRoom.amenities || 'None'}</p>
            <p><b>Description:</b> {selectedRoom.description || 'None'}</p>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT */}
      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Room">

        <FormGroup label="Room Number">
          <Input name="room_number" value={form.room_number} onChange={handleChange}/>
        </FormGroup>

        <FormGroup label="Capacity">
          <Input type="number" name="capacity" value={form.capacity} onChange={handleChange}/>
        </FormGroup>

        <FormGroup label="Price">
          <Input type="number" name="price_per_month" value={form.price_per_month} onChange={handleChange}/>
        </FormGroup>

        <FormGroup label="Gender">
          <Select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </Select>
        </FormGroup>

        <Button onClick={handleSave}>Save</Button>

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