const db = require('../config/database');

// Get all students with optional search/filter
const getAllStudents = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single student by ID with room allocation info
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [student] = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get current room allocation
    const [allocation] = await db.query(
      `SELECT a.*, r.room_number, r.type, r.floor, r.price_per_month
       FROM allocations a
       JOIN rooms r ON a.room_id = r.id
       WHERE a.student_id = ? AND a.status = 'active'
       LIMIT 1`,
      [id]
    );

    // Get fee history
    const [fees] = await db.query(
      'SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({
      ...student[0],
      allocation: allocation[0] || null,
      fees,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new student
const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      date_of_birth,
      id_proof_type,
      id_proof_number,
      gender,
      status,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check duplicate email
    const [existing] = await db.query(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const [result] = await db.query(
      `INSERT INTO students
        (name, email, phone, address, date_of_birth, id_proof_type, id_proof_number, gender, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone || null,
        address || null,
        date_of_birth || null,
        id_proof_type || null,
        id_proof_number || null,
        gender || 'Male',
        status || 'active',
      ]
    );

    res.status(201).json({
      message: 'Student created successfully',
      studentId: result.insertId,
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update student details
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      date_of_birth,
      id_proof_type,
      id_proof_number,
      gender,
      status,
    } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check email conflict with another student
    if (email) {
      const [emailCheck] = await db.query(
        'SELECT id FROM students WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ message: 'Email already in use by another student' });
      }
    }

    await db.query(
      `UPDATE students SET
        name           = COALESCE(?, name),
        email          = COALESCE(?, email),
        phone          = COALESCE(?, phone),
        address        = COALESCE(?, address),
        date_of_birth  = COALESCE(?, date_of_birth),
        id_proof_type  = COALESCE(?, id_proof_type),
        id_proof_number= COALESCE(?, id_proof_number),
        gender         = COALESCE(?, gender),
        status         = COALESCE(?, status),
        updated_at     = NOW()
       WHERE id = ?`,
      [name, email, phone, address, date_of_birth, id_proof_type, id_proof_number, gender, status, id]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT id FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for active room allocation
    const [active] = await db.query(
      "SELECT id FROM allocations WHERE student_id = ? AND status = 'active'",
      [id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete student with an active room allocation. Please vacate the room first.',
      });
    }

    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student's complaint history
const getStudentComplaints = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get student complaints error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentComplaints,
};