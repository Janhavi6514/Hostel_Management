const db = require('../config/database');

// Get all dashboard summary stats
const getSummary = async (req, res) => {
  try {
    // Total students
    const [[{ totalStudents }]] = await db.query(
      'SELECT COUNT(*) AS totalStudents FROM students WHERE status = "active"'
    );

    // Total rooms
    const [[{ totalRooms }]] = await db.query(
      'SELECT COUNT(*) AS totalRooms FROM rooms'
    );

    // Available rooms
    const [[{ availableRooms }]] = await db.query(
      'SELECT COUNT(*) AS availableRooms FROM rooms WHERE status = "available"'
    );

    // Occupied rooms
    const [[{ occupiedRooms }]] = await db.query(
      'SELECT COUNT(*) AS occupiedRooms FROM rooms WHERE status = "occupied"'
    );

    // Total fees collected this month
    const [[{ monthlyRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS monthlyRevenue
      FROM fees
      WHERE status = 'paid'
        AND MONTH(paid_date) = MONTH(CURDATE())
        AND YEAR(paid_date) = YEAR(CURDATE())
    `);

    // Pending fees
    const [[{ pendingFees }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS pendingFees FROM fees WHERE status = "pending"'
    );

    // Total staff
    const [[{ totalStaff }]] = await db.query(
      'SELECT COUNT(*) AS totalStaff FROM staff WHERE status = "active"'
    );

    // Open complaints
    const [[{ openComplaints }]] = await db.query(
      'SELECT COUNT(*) AS openComplaints FROM complaints WHERE status = "open"'
    );

    res.json({
      totalStudents,
      totalRooms,
      availableRooms,
      occupiedRooms,
      monthlyRevenue,
      pendingFees,
      totalStaff,
      openComplaints,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monthly revenue for the last 6 months
const getMonthlyRevenue = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(paid_date, '%b %Y') AS month,
        MONTH(paid_date) AS month_num,
        YEAR(paid_date) AS year,
        SUM(amount) AS revenue
      FROM fees
      WHERE status = 'paid'
        AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(paid_date), MONTH(paid_date)
      ORDER BY YEAR(paid_date) ASC, MONTH(paid_date) ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get room occupancy breakdown
const getRoomOccupancy = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM rooms
      GROUP BY status
    `);

    res.json(rows);
  } catch (error) {
    console.error('Room occupancy error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent activities (latest 10 bookings/allocations)
const getRecentActivity = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.id,
        s.name AS student_name,
        r.room_number,
        a.check_in,
        a.check_out,
        a.status
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get complaint status breakdown
const getComplaintStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM complaints
      GROUP BY status
    `);

    res.json(rows);
  } catch (error) {
    console.error('Complaint stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSummary,
  getMonthlyRevenue,
  getRoomOccupancy,
  getRecentActivity,
  getComplaintStats,
};