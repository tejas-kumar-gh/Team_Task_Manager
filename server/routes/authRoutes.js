import express from 'express';
import { loginUser, registerUser, logoutUser, getUserProfile, getUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/users').get(protect, admin, getUsers);

export default router;
