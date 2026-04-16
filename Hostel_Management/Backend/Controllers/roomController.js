const db = require('../config/database');

// Get all rooms with optional filters
const getAllRooms = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY room_number ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students currently allocated to a room
const getRoomStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT s.*, a.check_in, a.check_out, a.id AS allocation_id
       FROM allocations a
       JOIN students s ON a.student_id = s.id
       WHERE a.room_id = ? AND a.status = 'active'`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get room students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new room
const createRoom = async (req, res) => {
  try {
    const {
      room_number,
      type,
      capacity,
      floor,
      price_per_month,
      status,
      amenities,
      description,
    } = req.body;

    if (!room_number || !capacity || !price_per_month) {
      return res.status(400).json({
        message: 'Room number, capacity, and price are required',
      });
    }

    // Check if room number already exists
    const [existing] = await db.query(
      'SELECT id FROM rooms WHERE room_number = ?',
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Room number already exists' });
    }

    const [result] = await db.query(
      `INSERT INTO rooms
        (room_number, type, capacity, floor, price_per_month, status, amenities, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        type || 'Single',
        capacity,
        floor || 1,
        price_per_month,
        status || 'available',
        amenities || null,
        description || null,
      ]
    );

    res.status(201).json({
      message: 'Room created successfully',
      roomId: result.insertId,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update room details
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      type,
      capacity,
      floor,
      price_per_month,
      status,
      amenities,
      description,
    } = req.body;

    const [existing] = await db.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await db.query(
      `UPDATE rooms SET
        room_number   = COALESCE(?, room_number),
        type          = COALESCE(?, type),
        capacity      = COALESCE(?, capacity),
        floor         = COALESCE(?, floor),
        price_per_month = COALESCE(?, price_per_month),
        status        = COALESCE(?, status),
        amenities     = COALESCE(?, amenities),
        description   = COALESCE(?, description),
        updated_at    = NOW()
       WHERE id = ?`,
      [room_number, type, capacity, floor, price_per_month, status, amenities, description, id]
    );

    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has active allocations
    const [active] = await db.query(
      "SELECT id FROM allocations WHERE room_id = ? AND status = 'active'",
      [id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete room with active student allocations',
      });
    }

    await db.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Allocate a student to a room
const allocateRoom = async (req, res) => {
  try {
    const { student_id, room_id, check_in, check_out } = req.body;

    if (!student_id || !room_id || !check_in) {
      return res.status(400).json({
        message: 'Student ID, room ID, and check-in date are required',
      });
    }

    // Check room availability
    const [room] = await db.query(
      "SELECT * FROM rooms WHERE id = ? AND status = 'available'",
      [room_id]
    );

    if (room.length === 0) {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Check if student already has an active allocation
    const [existingAlloc] = await db.query(
      "SELECT id FROM allocations WHERE student_id = ? AND status = 'active'",
      [student_id]
    );

    if (existingAlloc.length > 0) {
      return res.status(400).json({
        message: 'Student already has an active room allocation',
      });
    }

    // Create allocation
    await db.query(
      `INSERT INTO allocations (student_id, room_id, check_in, check_out, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [student_id, room_id, check_in, check_out || null]
    );

    // Update room status to occupied
    await db.query(
      "UPDATE rooms SET status = 'occupied', updated_at = NOW() WHERE id = ?",
      [room_id]
    );

    res.status(201).json({ message: 'Room allocated successfully' });
  } catch (error) {
    console.error('Allocate room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vacate a room (end allocation)
const vacateRoom = async (req, res) => {
  try {
    const { allocation_id } = req.params;

    const [alloc] = await db.query(
      'SELECT * FROM allocations WHERE id = ?',
      [allocation_id]
    );

    if (alloc.length === 0) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    // Mark allocation as vacated
    await db.query(
      "UPDATE allocations SET status = 'vacated', check_out = CURDATE() WHERE id = ?",
      [allocation_id]
    );

    // Set room back to available
    await db.query(
      "UPDATE rooms SET status = 'available', updated_at = NOW() WHERE id = ?",
      [alloc[0].room_id]
    );

    res.json({ message: 'Room vacated successfully' });
  } catch (error) {
    console.error('Vacate room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  getRoomStudents,
  createRoom,
  updateRoom,
  deleteRoom,
  allocateRoom,
  vacateRoom,
};