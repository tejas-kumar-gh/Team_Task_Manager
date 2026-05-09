import express from 'express';
import { getTasks, createTask, getTaskById, updateTask, deleteTask, getDashboardStats, addComment } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

router.post('/:id/comments', protect, addComment);

export default router;
