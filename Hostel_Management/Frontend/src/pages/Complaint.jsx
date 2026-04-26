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
          <h1 className="text-2xl font-bold text-white">Complaints</h1>
          <p className="text-slate-400">Manage and track all complaints</p>
        </div>

        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
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
              className={`relative group p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow hover:shadow-xl transition
                border-l-4
                ${c.status === "open" && "border-l-yellow-400"}
                ${c.status === "in_progress" && "border-l-blue-500"}
                ${c.status === "resolved" && "border-l-green-500"}
              `}
            >

              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {c.student_name}
                  </h3>
                  <p className="text-xs text-slate-400">{c.category}</p>
                </div>

                <span className={`px-3 py-1 text-xs rounded-full capitalize
                  ${c.status === "open" && "bg-yellow-500/20 text-yellow-400"}
                  ${c.status === "in_progress" && "bg-blue-500/20 text-blue-400"}
                  ${c.status === "resolved" && "bg-green-500/20 text-green-400"}
                `}>
                  {c.status.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-slate-200">{c.subject}</h4>

              <p className="text-sm text-slate-400 mt-1 mb-4 line-clamp-2">
                {c.description}
              </p>

              <div className="flex justify-between items-center">

                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:scale-110"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(c.id);
                      setConfirm(true);
                    }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:scale-110"
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
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Complaint" : "New Complaint"}
      >
        <FormGroup label="Student">
          <Select name="student_id" value={form.student_id} onChange={handleChange}>
            <option value="">Select</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Subject">
          <Input className="bg-slate-800 text-white" name="subject" value={form.subject} onChange={handleChange} />
        </FormGroup>

        <FormGroup label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white"
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