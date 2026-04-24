const db = require('../config/database');

// GET ALL ROOMS
const getAllRooms = async (req, res) => {
  try {
    const { status, type, gender } = req.query;

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

    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }

    query += ' ORDER BY room_number ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ROOM BY ID
const getRoomById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ROOM STUDENTS
const getRoomStudents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, a.check_in, a.check_out, a.id AS allocation_id
       FROM allocations a
       JOIN students s ON a.student_id = s.id
       WHERE a.room_id = ? AND a.status = 'active'`,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// CREATE ROOM
const createRoom = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // ✅ DEBUG

    const {
      room_number,
      type,
      capacity,
      floor,
      price_per_month,
      status,
      gender,
      amenities,
      description,
    } = req.body;

    // ✅ VALIDATION
    if (!room_number || !capacity || !price_per_month || !gender) {
      return res.status(400).json({
        message: 'Room number, capacity, price and gender required',
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM rooms WHERE room_number = ?',
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Room number already exists',
      });
    }

    const [result] = await db.query(
      `INSERT INTO rooms
      (room_number, type, capacity, floor, price_per_month, status, gender, amenities, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        type || 'Single',
        capacity,
        floor || 1,
        price_per_month,
        status || 'available',
        gender.toLowerCase(),   // ✅ FIXED
        amenities || null,
        description || null,
      ]
    );

    res.status(201).json({
      message: 'Room created',
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// UPDATE ROOM
const updateRoom = async (req, res) => {
  try {
    const {
      room_number,
      type,
      capacity,
      floor,
      price_per_month,
      status,
      gender,
      amenities,
      description,
    } = req.body;

    await db.query(
      `UPDATE rooms SET
        room_number = COALESCE(?, room_number),
        type = COALESCE(?, type),
        capacity = COALESCE(?, capacity),
        floor = COALESCE(?, floor),
        price_per_month = COALESCE(?, price_per_month),
        status = COALESCE(?, status),
        gender = COALESCE(LOWER(?), gender),  -- ✅ FIXED
        amenities = COALESCE(?, amenities),
        description = COALESCE(?, description),
        updated_at = NOW()
       WHERE id = ?`,
      [
        room_number,
        type,
        capacity,
        floor,
        price_per_month,
        status,
        gender,
        amenities,
        description,
        req.params.id,
      ]
    );

    res.json({ message: 'Room updated' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE ROOM
const deleteRoom = async (req, res) => {
  try {
    const [active] = await db.query(
      "SELECT id FROM allocations WHERE room_id = ? AND status = 'active'",
      [req.params.id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: 'Room has active students',
      });
    }

    await db.query(
      'DELETE FROM rooms WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🚀 SMART ALLOCATION
const allocateRoom = async (req, res) => {
  try {
    const { student_id, room_id, check_in, check_out } = req.body;

    if (!student_id || !check_in) {
      return res.status(400).json({
        message: 'Student ID and check-in required',
      });
    }

    // GET STUDENT
    const [studentRows] = await db.query(
      "SELECT * FROM students WHERE id = ?",
      [student_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentRows[0];

    // 🔹 MANUAL ROOM
    if (room_id) {
      const [roomRows] = await db.query(
        "SELECT * FROM rooms WHERE id = ?",
        [room_id]
      );

      if (roomRows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const room = roomRows[0];

      if (room.gender !== student.gender) {
        return res.status(400).json({
          message: 'Gender mismatch',
        });
      }

      const [[{ count }]] = await db.query(
        "SELECT COUNT(*) as count FROM allocations WHERE room_id = ? AND status='active'",
        [room_id]
      );

      if (count >= room.capacity) {
        return res.status(400).json({
          message: 'Room full',
        });
      }

      await db.query(
        `INSERT INTO allocations (student_id, room_id, check_in, check_out, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [student_id, room_id, check_in, check_out || null]
      );

      return res.json({ message: 'Allocated manually' });
    }

    // 🔥 AUTO ALLOCATION
    const [rooms] = await db.query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM allocations a 
         WHERE a.room_id = r.id AND a.status='active') AS occupied
       FROM rooms r
       WHERE r.gender = ?
       HAVING occupied < capacity
       ORDER BY occupied ASC, price_per_month ASC`,
      [student.gender]
    );

    if (rooms.length === 0) {
      return res.status(400).json({
        message: 'No available rooms',
      });
    }

    const room = rooms[0];

    await db.query(
      `INSERT INTO allocations (student_id, room_id, check_in, check_out, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [student_id, room.id, check_in, check_out || null]
    );

    // UPDATE ROOM STATUS
    if (room.occupied + 1 >= room.capacity) {
      await db.query(
        "UPDATE rooms SET status='occupied' WHERE id=?",
        [room.id]
      );
    }

    res.json({
      message: 'Auto allocated',
      room: room,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VACATE ROOM
const vacateRoom = async (req, res) => {
  try {
    const [alloc] = await db.query(
      'SELECT * FROM allocations WHERE id = ?',
      [req.params.allocation_id]
    );

    if (alloc.length === 0) {
      return res.status(404).json({
        message: 'Allocation not found',
      });
    }

    await db.query(
      "UPDATE allocations SET status='vacated', check_out=CURDATE() WHERE id=?",
      [req.params.allocation_id]
    );

    await db.query(
      "UPDATE rooms SET status='available' WHERE id=?",
      [alloc[0].room_id]
    );

    res.json({ message: 'Room vacated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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