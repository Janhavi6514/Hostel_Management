const db = require('../config/database');

// ─────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────

const getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM staff ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, phone, role, shift, status } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    const [result] = await db.query(
      `INSERT INTO staff (name, email, phone, role, shift, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, role, shift || 'Morning', status || 'active']
    );

    res.status(201).json({ message: 'Staff added successfully', staffId: result.insertId });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, shift, status } = req.body;

    const [existing] = await db.query('SELECT id FROM staff WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await db.query(
      `UPDATE staff SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        shift = COALESCE(?, shift),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, email, phone, role, shift, status, id]
    );

    res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM staff WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await db.query('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────

const getAllNotices = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notices ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, type, posted_by, expires_at } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const [result] = await db.query(
      `INSERT INTO notices (title, content, type, posted_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, type || 'general', posted_by || null, expires_at || null]
    );

    res.status(201).json({ message: 'Notice posted successfully', noticeId: result.insertId });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await db.query('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// COMPLAINTS
// ─────────────────────────────────────────

const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT c.*, s.name AS student_name
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { student_id, subject, description, category, priority } = req.body;

    if (!student_id || !subject || !description) {
      return res.status(400).json({ message: 'Student, subject, and description are required' });
    }

    const [result] = await db.query(
      `INSERT INTO complaints (student_id, subject, description, category, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, subject, description, category || 'other', priority || 'medium']
    );

    res.status(201).json({ message: 'Complaint submitted successfully', complaintId: result.insertId });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const [existing] = await db.query('SELECT id FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const resolvedAt = status === 'resolved' ? new Date() : null;

    await db.query(
      'UPDATE complaints SET status = ?, resolved_at = ? WHERE id = ?',
      [status, resolvedAt, id]
    );

    res.json({ message: 'Complaint status updated successfully' });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await db.query('DELETE FROM complaints WHERE id = ?', [id]);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getAllNotices,
  createNotice,
  deleteNotice,
  getAllComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
};