const db = require('../config/database');

// ==============================
// SUMMARY DATA
// ==============================
const getSummary = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query(
      `SELECT COUNT(*) AS totalStudents FROM students WHERE LOWER(status) = 'active'`
    );

    const [[{ totalRooms }]] = await db.query(
      `SELECT COUNT(*) AS totalRooms FROM rooms`
    );

    const [[{ availableRooms }]] = await db.query(
      `SELECT COUNT(*) AS availableRooms FROM rooms WHERE LOWER(status) = 'available'`
    );

    const [[{ occupiedRooms }]] = await db.query(
      `SELECT COUNT(*) AS occupiedRooms FROM rooms WHERE LOWER(status) = 'occupied'`
    );

    const [[{ monthlyRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS monthlyRevenue
      FROM fees
      WHERE LOWER(status) = 'paid'
        AND paid_date IS NOT NULL
        AND MONTH(paid_date) = MONTH(CURDATE())
        AND YEAR(paid_date) = YEAR(CURDATE())
    `);

    const [[{ pendingFees }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS pendingFees FROM fees WHERE LOWER(status) = 'pending'`
    );

    const [[{ totalStaff }]] = await db.query(
      `SELECT COUNT(*) AS totalStaff FROM staff WHERE LOWER(status) = 'active'`
    );

    const [[{ openComplaints }]] = await db.query(
      `SELECT COUNT(*) AS openComplaints FROM complaints WHERE LOWER(status) = 'open'`
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
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ✅ FIXED MONTHLY REVENUE (IMPORTANT)
// ==============================
const getMonthlyRevenue = async (req, res) => {
  console.log("Revenue API HIT");

  try {
    const [rows] = await db.query(`
      SELECT 
        MONTH(paid_date) AS month_num,
        SUM(amount) AS revenue
      FROM fees
      WHERE paid_date IS NOT NULL
      GROUP BY MONTH(paid_date)
      ORDER BY month_num
    `);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const fullData = months.map((m, i) => {
      const found = rows.find(r => r.month_num === i + 1);
      return {
        month: m,
        revenue: found ? Number(found.revenue) : 0,
      };
    });

    res.json(fullData);

  } catch (error) {
    console.error("Monthly revenue error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ✅ FIXED ROOM OCCUPANCY
// ==============================
const getRoomOccupancy = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT LOWER(status) AS status, COUNT(*) AS count
      FROM rooms
      GROUP BY LOWER(status)
    `);

    const formatted = rows.map(r => ({
      status: r.status === 'occupied' ? 'Occupied' : 'Vacant',
      count: r.count
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// RECENT ACTIVITY
// ==============================
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
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// COMPLAINT STATS
// ==============================
const getComplaintStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        LOWER(status) AS status,
        COUNT(*) AS count
      FROM complaints
      GROUP BY LOWER(status)
    `);

    res.json(rows);

  } catch (error) {
    console.error('Complaint stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
module.exports = {
  getSummary,
  getMonthlyRevenue,
  getRoomOccupancy,
  getRecentActivity,
  getComplaintStats,
};