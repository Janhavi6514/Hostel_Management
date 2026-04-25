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

  // FETCH
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
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Complaints</h1>
          <p className="text-gray-500">Manage and track all complaints</p>
        </div>

        <Button onClick={() => {
          setEditId(null);
          setForm(defaultForm);
          setShowModal(true);
        }}>
          <Plus size={16} /> New
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-50 shadow">
          Open <div className="text-xl font-bold">{countBy("open")}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 shadow">
          In Progress <div className="text-xl font-bold">{countBy("in_progress")}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-green-50 shadow">
          Resolved <div className="text-xl font-bold">{countBy("resolved")}</div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 border px-3 py-2 rounded w-full max-w-xs bg-white shadow-sm">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="outline-none w-full"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded shadow-sm"
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
              className={`relative group p-5 rounded-2xl bg-white border shadow-sm
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
                border-l-4
                ${c.status === "open" && "border-l-yellow-400"}
                ${c.status === "in_progress" && "border-l-blue-500"}
                ${c.status === "resolved" && "border-l-green-500"}
              `}
            >

              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                    {c.student_name}
                  </h3>
                  <p className="text-xs text-gray-500">{c.category}</p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full capitalize
                    ${c.status === "open" && "bg-yellow-100 text-yellow-700"}
                    ${c.status === "in_progress" && "bg-blue-100 text-blue-700"}
                    ${c.status === "resolved" && "bg-green-100 text-green-700"}
                  `}
                >
                  {c.status.replace("_", " ")}
                </span>
              </div>

              {/* SUBJECT */}
              <h4 className="font-medium text-gray-700">{c.subject}</h4>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 mt-1 mb-4 line-clamp-2">
                {c.description}
              </p>

              {/* FOOTER */}
              <div className="flex justify-between items-center">

                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:scale-110 transition"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(c.id);
                      setConfirm(true);
                    }}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:scale-110 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* HOVER GLOW */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-100/20 to-purple-100/20 transition pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Complaint" : "New Complaint"}
        footer={
          <>
            <Button type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave}>
              {editId ? "Update" : "Submit"}
            </Button>
          </>
        }
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
          <Input name="subject" value={form.subject} onChange={handleChange} />
        </FormGroup>

        <FormGroup label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </FormGroup>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure?"
      />

    </div>
  );
};

export default Complaint;