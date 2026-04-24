import { useState, useEffect } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { complaintAPI, studentAPI } from "../Utils/api";
import {
  Modal, ConfirmDialog, Badge, Spinner,
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

  // FETCH DATA
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
    } catch (err) {}
  };

  useEffect(() => { fetchComplaints(); }, [filterStatus]);
  useEffect(() => { fetchStudents(); }, []);

  // FILTER
  const filtered = complaints.filter(
    (c) =>
      (c.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const countBy = (s) => complaints.filter((c) => c.status === s).length;

  // QUICK STATUS UPDATE
  const updateStatus = async (id, status) => {
    await complaintAPI.updateStatus(id, { status });
    fetchComplaints();
  };

  // DELETE
  const handleDelete = async () => {
    await complaintAPI.delete(deleteId);
    setConfirm(false);
    fetchComplaints();
  };

  // FORM CHANGE
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // SAVE
  const handleSave = async () => {
    await complaintAPI.create(form);
    setShowModal(false);
    fetchComplaints();
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-sm text-gray-500">
            Manage all complaints
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-yellow-100">
          <p className="text-xs">Open</p>
          <p className="text-xl font-bold">{countBy("open")}</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-100">
          <p className="text-xs">In Progress</p>
          <p className="text-xl font-bold">{countBy("in_progress")}</p>
        </div>

        <div className="p-4 rounded-xl bg-green-100">
          <p className="text-xs">Resolved</p>
          <p className="text-xl font-bold">{countBy("resolved")}</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-full max-w-xs"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* 🔥 CARD UI ONLY */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No complaints found" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border shadow-sm hover:shadow-md transition"
            >

              {/* TOP */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {c.student_name}
                </h3>
                <Badge status={c.status} />
              </div>

              {/* SUBJECT */}
              <p className="text-sm text-gray-600 mt-1">
                {c.subject}
              </p>

              {/* CATEGORY */}
              <div className="mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {c.category}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex justify-between items-center">

                <select
                  value={c.status}
                  onChange={(e) =>
                    updateStatus(c.id, e.target.value)
                  }
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <button
                  onClick={() => {
                    setDeleteId(c.id);
                    setConfirm(true);
                  }}
                  className="text-red-500 hover:scale-110 transition"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Complaint"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Submit
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

      {/* DELETE */}
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