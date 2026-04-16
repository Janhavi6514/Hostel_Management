import { useState, useEffect } from 'react';
import { Plus, Search, BedDouble, Pencil, Trash2, Users, X } from 'lucide-react';
import { roomAPI, studentAPI } from '../Utils/api';
import {
  Modal, ConfirmDialog, Badge, Spinner,
  EmptyState, FormGroup, FormRow, Input, Select, Button,
} from '../components/UI';

const defaultForm = {
  room_number: '', type: 'Single', capacity: 1,
  floor: 1, price_per_month: '', status: 'available',
  amenities: '', description: '',
};

const defaultAlloc = {
  student_id: '', room_id: '', check_in: '', check_out: '',
};

const Room = () => {
  const [rooms, setRooms]           = useState([]);
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');

  const [showModal, setShowModal]   = useState(false);
  const [showAlloc, setShowAlloc]   = useState(false);
  const [showConfirm, setConfirm]   = useState(false);
  const [showOccupants, setOccupants] = useState(false);

  const [editRoom, setEditRoom]     = useState(null);
  const [form, setForm]             = useState(defaultForm);
  const [alloc, setAlloc]           = useState(defaultAlloc);
  const [selectedRoom, setSelected] = useState(null);
  const [occupants, setOccupantList]= useState([]);
  const [deleteId, setDeleteId]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await roomAPI.getAll(filterStatus ? { status: filterStatus } : {});
      setRooms(res.data);
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

  useEffect(() => { fetchRooms(); }, [filterStatus]);
  useEffect(() => { fetchStudents(); }, []);

  const openCreate = () => { setEditRoom(null); setForm(defaultForm); setShowModal(true); };
  const openEdit   = (room) => { setEditRoom(room); setForm({ ...room }); setShowModal(true); };
  const openAlloc  = (room) => { setSelected(room); setAlloc({ ...defaultAlloc, room_id: room.id }); setShowAlloc(true); };

  const openOccupants = async (room) => {
    setSelected(room);
    try {
      const res = await roomAPI.getStudents(room.id);
      setOccupantList(res.data);
    } catch (err) { console.error(err); }
    setOccupants(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAllocChange = (e) =>
    setAlloc({ ...alloc, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.room_number || !form.capacity || !form.price_per_month) return;
    setSaving(true);
    try {
      if (editRoom) {
        await roomAPI.update(editRoom.id, form);
      } else {
        await roomAPI.create(form);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAllocate = async () => {
    if (!alloc.student_id || !alloc.check_in) return;
    setSaving(true);
    try {
      await roomAPI.allocate(alloc);
      setShowAlloc(false);
      fetchRooms();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleVacate = async (allocId) => {
    try {
      await roomAPI.vacate(allocId);
      const res = await roomAPI.getStudents(selectedRoom.id);
      setOccupantList(res.data);
      fetchRooms();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await roomAPI.delete(deleteId);
      setConfirm(false);
      fetchRooms();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  const filtered = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rooms</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage hostel rooms and allocations</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner size={28} className="py-16" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={BedDouble} message="No rooms found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Room No.</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Floor</th>
                  <th className="px-4 py-3 text-left">Capacity</th>
                  <th className="px-4 py-3 text-left">Price/Month</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => (
                  <tr key={room.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{room.room_number}</td>
                    <td className="px-4 py-3 text-slate-600">{room.type}</td>
                    <td className="px-4 py-3 text-slate-600">Floor {room.floor}</td>
                    <td className="px-4 py-3 text-slate-600">{room.capacity}</td>
                    <td className="px-4 py-3 text-slate-600">₹{Number(room.price_per_month).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge status={room.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {room.status === 'available' && (
                          <button
                            onClick={() => openAlloc(room)}
                            className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium"
                          >
                            Allocate
                          </button>
                        )}
                        {room.status === 'occupied' && (
                          <button
                            onClick={() => openOccupants(room)}
                            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium flex items-center gap-1"
                          >
                            <Users size={11} /> View
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(room)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { setDeleteId(room.id); setConfirm(true); }}
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

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editRoom ? 'Edit Room' : 'Add New Room'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              {editRoom ? 'Save Changes' : 'Create Room'}
            </Button>
          </>
        }
      >
        <FormRow>
          <FormGroup label="Room Number" required>
            <Input name="room_number" value={form.room_number} onChange={handleChange} placeholder="e.g. 101" />
          </FormGroup>
          <FormGroup label="Type">
            <Select name="type" value={form.type} onChange={handleChange}>
              <option>Single</option>
              <option>Double</option>
              <option>Triple</option>
              <option>Dormitory</option>
            </Select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Floor">
            <Input type="number" name="floor" value={form.floor} onChange={handleChange} min={1} />
          </FormGroup>
          <FormGroup label="Capacity" required>
            <Input type="number" name="capacity" value={form.capacity} onChange={handleChange} min={1} />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Price per Month (₹)" required>
            <Input type="number" name="price_per_month" value={form.price_per_month} onChange={handleChange} placeholder="5000" />
          </FormGroup>
          <FormGroup label="Status">
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </FormGroup>
        </FormRow>
        <FormGroup label="Amenities">
          <Input name="amenities" value={form.amenities} onChange={handleChange} placeholder="WiFi, AC, Attached Bath..." />
        </FormGroup>
        <FormGroup label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </FormGroup>
      </Modal>

      {/* Allocate Room Modal */}
      <Modal
        isOpen={showAlloc}
        onClose={() => setShowAlloc(false)}
        title={`Allocate Room ${selectedRoom?.room_number}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAlloc(false)}>Cancel</Button>
            <Button variant="success" onClick={handleAllocate} disabled={saving}>
              {saving && <Spinner size={14} className="" />}
              Allocate Room
            </Button>
          </>
        }
      >
        <FormGroup label="Select Student" required>
          <Select name="student_id" value={alloc.student_id} onChange={handleAllocChange}>
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </Select>
        </FormGroup>
        <FormRow>
          <FormGroup label="Check-in Date" required>
            <Input type="date" name="check_in" value={alloc.check_in} onChange={handleAllocChange} />
          </FormGroup>
          <FormGroup label="Check-out Date">
            <Input type="date" name="check_out" value={alloc.check_out} onChange={handleAllocChange} />
          </FormGroup>
        </FormRow>
      </Modal>

      {/* Occupants Modal */}
      <Modal
        isOpen={showOccupants}
        onClose={() => setOccupants(false)}
        title={`Occupants — Room ${selectedRoom?.room_number}`}
      >
        {occupants.length === 0 ? (
          <EmptyState icon={Users} message="No active occupants" />
        ) : (
          <div className="space-y-3">
            {occupants.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.email}</p>
                  <p className="text-xs text-slate-400">Check-in: {new Date(s.check_in).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleVacate(s.allocation_id)}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  Vacate
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default Room;