const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../Middleware/auth');

// Controllers
const {
  login,
  register,
  verifyToken: verifyTokenCtrl,
} = require('../Controllers/authController');

const {
  getSummary,
  getMonthlyRevenue,
  getRoomOccupancy,
  getRecentActivity,
  getComplaintStats,
} = require('../Controllers/dashboardController');

const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentComplaints,
} = require('../Controllers/studentController');

const {
  getAllRooms,
  getRoomById,
  getRoomStudents,
  createRoom,
  updateRoom,
  deleteRoom,
  allocateRoom,
  vacateRoom,
} = require('../Controllers/roomController');

const {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  markAsPaid,
  deleteFee,
  checkOverdueFees,
} = require('../Controllers/feeController');

const {
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
} = require('../Controllers/miscController');

// ─────────────────────────────────────────
// AUTH ROUTES (public)
// ─────────────────────────────────────────
router.post('/auth/login', login);
router.post('/auth/register', verifyToken, isAdmin, register);
router.get('/auth/verify', verifyToken, verifyTokenCtrl);

// ─────────────────────────────────────────
// DASHBOARD ROUTES (protected)
// ─────────────────────────────────────────
router.get('/dashboard/summary', verifyToken, getSummary);
router.get('/dashboard/revenue', verifyToken, getMonthlyRevenue);
router.get('/dashboard/occupancy', verifyToken, getRoomOccupancy);
router.get('/dashboard/recent-activity', verifyToken, getRecentActivity);
router.get('/dashboard/complaint-stats', verifyToken, getComplaintStats);

// ─────────────────────────────────────────
// STUDENT ROUTES (protected)
// ─────────────────────────────────────────
router.get('/students', verifyToken, getAllStudents);
router.get('/students/:id', verifyToken, getStudentById);
router.get('/students/:id/complaints', verifyToken, getStudentComplaints);
router.post('/students', verifyToken, createStudent);
router.put('/students/:id', verifyToken, updateStudent);
router.delete('/students/:id', verifyToken, isAdmin, deleteStudent);

// ─────────────────────────────────────────
// ROOM ROUTES (protected)
// ─────────────────────────────────────────
router.get('/rooms', verifyToken, getAllRooms);
router.get('/rooms/:id', verifyToken, getRoomById);
router.get('/rooms/:id/students', verifyToken, getRoomStudents);
router.post('/rooms', verifyToken, createRoom);
router.put('/rooms/:id', verifyToken, updateRoom);
router.delete('/rooms/:id', verifyToken, isAdmin, deleteRoom);
router.post('/rooms/allocate', verifyToken, allocateRoom);
router.put('/rooms/vacate/:allocation_id', verifyToken, vacateRoom);

// ─────────────────────────────────────────
// FEES ROUTES (protected)
// ─────────────────────────────────────────
router.get('/fees', verifyToken, getAllFees);
router.get('/fees/check-overdue', verifyToken, checkOverdueFees);
router.get('/fees/:id', verifyToken, getFeeById);
router.post('/fees', verifyToken, createFee);
router.put('/fees/:id', verifyToken, updateFee);
router.put('/fees/:id/pay', verifyToken, markAsPaid);
router.delete('/fees/:id', verifyToken, isAdmin, deleteFee);

// ─────────────────────────────────────────
// STAFF ROUTES (protected)
// ─────────────────────────────────────────
router.get('/staff', verifyToken, getAllStaff);
router.post('/staff', verifyToken, isAdmin, createStaff);
router.put('/staff/:id', verifyToken, isAdmin, updateStaff);
router.delete('/staff/:id', verifyToken, isAdmin, deleteStaff);

// ─────────────────────────────────────────
// NOTICE ROUTES (protected)
// ─────────────────────────────────────────
router.get('/notices', verifyToken, getAllNotices);
router.post('/notices', verifyToken, createNotice);
router.delete('/notices/:id', verifyToken, isAdmin, deleteNotice);

// ─────────────────────────────────────────
// COMPLAINT ROUTES (protected)
// ─────────────────────────────────────────
router.get('/complaints', verifyToken, getAllComplaints);
router.post('/complaints', verifyToken, createComplaint);
router.put('/complaints/:id/status', verifyToken, updateComplaintStatus);
router.delete('/complaints/:id', verifyToken, isAdmin, deleteComplaint);

module.exports = router;