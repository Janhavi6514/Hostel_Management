import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { complaintAPI, studentAPI } from "../Utils/api";
import {
  Modal, ConfirmDialog, Spinner,
  EmptyState, FormGroup, Input, Select, Button,
} from "../components/UI";

const defaultForm = {
  student_id: "",
  subject: "",
  description: "",
  category: "other",
  priority: "medium",
};

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setConfirm] = useState(false);

  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await complaintAPI.getAll(
        filterStatus ? { status: filterStatus } : {}
      );
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll({ status: "active" });
      setStudents(res.data);
    } catch {}
  };

  useEffect(() => { fetchComplaints(); }, [filterStatus]);
  useEffect(() => { fetchStudents(); }, []);

  const filtered = complaints.filter(
    (c) =>
      (c.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const countBy = (s) => complaints.filter((c) => c.status === s).length;

  const updateStatus = async (id, status) => {
    await complaintAPI.updateStatus(id, { status });
    fetchComplaints();
  };

  const handleDelete = async () => {
    await complaintAPI.delete(deleteId);
    setConfirm(false);
    fetchComplaints();
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setForm({
      student_id: c.student_id,
      subject: c.subject,
      description: c.description,
      category: c.category,
      priority: c.priority,
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      if (editId) {
        await complaintAPI.update(editId, form);
      } else {
        await complaintAPI.create(form);
      }
      setShowModal(false);
      setEditId(null);
      setForm(defaultForm);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-slate-400">Manage and track all complaints</p>
        </div>

        <Button
          onClick={() => {
            setEditId(null);
            setForm(defaultForm);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <Plus size={16} /> New
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-yellow-400">Open</p>
          <div className="text-xl font-bold">{countBy("open")}</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400">In Progress</p>
          <div className="text-xl font-bold">{countBy("in_progress")}</div>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-400">Resolved</p>
          <div className="text-xl font-bold">{countBy("resolved")}</div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded w-full max-w-xs">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="outline-none w-full bg-transparent text-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-white"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* CARDS */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No complaints found" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="relative group rounded-2xl p-5 
              bg-gradient-to-br from-[#0f172a] to-[#020617] 
              border border-slate-800 
              shadow-lg hover:shadow-blue-500/10 
              transition-all duration-300 hover:scale-[1.02]"
            >

              {/* 🔥 FIX: pointer-events-none */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 border border-blue-500/20 blur-sm transition pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between mb-3 relative z-10">
                <div>
                  <h3 className="text-white font-semibold">{c.student_name}</h3>
                  <p className="text-xs text-slate-400">{c.category}</p>
                </div>

                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    c.status === "open"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : c.status === "in_progress"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {c.status.replace("_", " ")}
                </span>
              </div>

              {/* Content */}
              <p className="text-white font-medium relative z-10">
                {c.subject}
              </p>

              <p className="text-sm text-slate-400 mb-4 relative z-10">
                {c.description}
              </p>

              {/* Footer */}
              <div className="flex justify-between items-center relative z-10">

                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="bg-slate-800 text-white px-2 py-1 rounded text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                {/* ✅ FIXED BUTTONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-400 hover:scale-110 transition"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(c.id);
                      setConfirm(true);
                    }}
                    className="text-red-400 hover:scale-110 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Complaint">

        <FormGroup label="Student">
          <Select
            className="bg-white !text-black border"
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Subject">
          <Input
            className="bg-white !text-black border"
            name="subject"
            value={form.subject}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full bg-white !text-black border p-2 rounded"
          />
        </FormGroup>

        <Button onClick={handleSave}>
          {editId ? "Update" : "Submit"}
        </Button>

      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
};

export default Complaint;