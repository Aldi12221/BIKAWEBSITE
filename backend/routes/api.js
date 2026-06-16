const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/authController');
const contentCtrl = require('../controllers/contentController');
const quizCtrl = require('../controllers/quizController');
const adminAuthCtrl = require('../controllers/adminAuthController');
const templateCtrl = require('../controllers/templateController');
const videoCtrl = require('../controllers/videoTutorialController');
const { isAdmin } = require('../config/authMiddleware');

// Routes Auth & Profile (User)
router.post('/auth/google', authCtrl.loginGoogle);
router.put('/user/:id', authCtrl.updateProfile);

// Routes Contents (Masa Depan, Tutorial, Usaha)
router.get('/contents/:kategori', contentCtrl.getContentByKategori);
router.get('/stats/login', contentCtrl.getLoginStats);
router.get('/stats/public', contentCtrl.getPublicStats);
router.post('/contents', isAdmin, contentCtrl.createContent);
router.put('/contents/:id', isAdmin, contentCtrl.updateContent);
router.delete('/contents/:id', isAdmin, contentCtrl.deleteContent);

// Templates (public GET, admin POST)
router.get('/templates', templateCtrl.getAllTemplates);
router.post('/templates', isAdmin, templateCtrl.createOrUpdateTemplate);

// Routes Quizzes
router.get('/quizzes', quizCtrl.getAllQuiz);
router.get('/quizzes/:id', quizCtrl.getQuizDetail);
router.post('/quizzes', isAdmin, quizCtrl.createQuiz);
router.put('/quizzes/:id', isAdmin, quizCtrl.updateQuiz);
router.delete('/quizzes/:id', isAdmin, quizCtrl.deleteQuiz);

// Routes Admin Auth
router.post('/admin/login', adminAuthCtrl.loginAdmin);
router.get('/admin/setup', async (req, res) => {
  try {
    const { Admin } = require('../models');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [admin, created] = await Admin.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hashedPassword,
        nama: 'Default Admin',
        role: 'admin'
      }
    });
    res.json({ message: created ? 'Admin created' : 'Admin already exists', admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/admin/verify', adminAuthCtrl.verifyAdmin);
router.post('/admin/register', adminAuthCtrl.registerAdmin);
router.get('/admin/stats', isAdmin, adminAuthCtrl.getDashboardStats);
router.get('/admin/users', isAdmin, adminAuthCtrl.getAllUsers);
router.delete('/admin/users/:id', isAdmin, adminAuthCtrl.deleteUser);

// Routes Admin CRUD (kelola akun admin)
router.get('/admin/admins', isAdmin, adminAuthCtrl.getAllAdmins);
router.get('/admin/admins/:id', isAdmin, adminAuthCtrl.getAdminById);
router.put('/admin/admins/:id', isAdmin, adminAuthCtrl.updateAdmin);
router.delete('/admin/admins/:id', isAdmin, adminAuthCtrl.deleteAdmin);

// Routes Video Tutorials (public list, admin CRUD)
router.get('/video-tutorials', videoCtrl.getAll);
router.get('/video-tutorials/:id', videoCtrl.getById);
router.post('/video-tutorials', isAdmin, videoCtrl.create);
router.put('/video-tutorials/:id', isAdmin, videoCtrl.update);
router.delete('/video-tutorials/:id', isAdmin, videoCtrl.delete);

module.exports = router;
