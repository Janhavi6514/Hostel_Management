const db = require('../config/database');

// Get all fees with student name
const getAllFees = async (req, res) => {
  try {
    const { status, student_id } = req.query;

    let query = `
      SELECT f.*, s.name AS student_name
      FROM fees f
      LEFT JOIN students s ON f.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }

    if (student_id) {
      query += ' AND f.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY f.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single fee by ID
const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT f.*, s.name AS student_name
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE f.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new fee record
const createFee = async (req, res) => {
  try {
    const {
      student_id,
      amount,
      due_date,
      description,
      status,
    } = req.body;

    if (!student_id || !amount || !due_date) {
      return res.status(400).json({ message: 'Student, amount, and due date are required' });
    }

    const [result] = await db.query(
      `INSERT INTO fees (student_id, amount, due_date, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, amount, due_date, description || null, status || 'pending']
    );

    res.status(201).json({
      message: 'Fee record created successfully',
      feeId: result.insertId,
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update fee (mark as paid or edit details)
const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      due_date,
      paid_date,
      method,
      status,
      description,
      transaction_ref,
    } = req.body;

    const [existing] = await db.query('SELECT id FROM fees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    await db.query(
      `UPDATE fees SET
        amount = COALESCE(?, amount),
        due_date = COALESCE(?, due_date),
        paid_date = COALESCE(?, paid_date),
        method = COALESCE(?, method),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        transaction_ref = COALESCE(?, transaction_ref)
       WHERE id = ?`,
      [amount, due_date, paid_date, method, status, description, transaction_ref, id]
    );

    res.json({ message: 'Fee record updated successfully' });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark fee as paid quickly
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, transaction_ref } = req.body;

    const [existing] = await db.query('SELECT id FROM fees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    await db.query(
      `UPDATE fees SET
        status = 'paid',
        paid_date = CURDATE(),
        method = COALESCE(?, 'cash'),
        transaction_ref = COALESCE(?, transaction_ref)
       WHERE id = ?`,
      [method, transaction_ref, id]
    );

    res.json({ message: 'Fee marked as paid successfully' });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete fee record
const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM fees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    await db.query('DELETE FROM fees WHERE id = ?', [id]);
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overdue fees and auto-update their status
const checkOverdueFees = async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE fees
       SET status = 'overdue'
       WHERE status = 'pending' AND due_date < CURDATE()`
    );

    res.json({
      message: 'Overdue fees updated',
      updatedCount: result.affectedRows,
    });
  } catch (error) {
    console.error('Overdue check error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  markAsPaid,
  deleteFee,
  checkOverdueFees,
};