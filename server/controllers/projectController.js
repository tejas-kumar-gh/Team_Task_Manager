import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  let projects;
  if (req.user.role === 'Admin') {
    projects = await Project.find({}).populate('members', 'name email').populate('createdBy', 'name');
  } else {
    projects = await Project.find({ members: req.user._id }).populate('members', 'name email').populate('createdBy', 'name');
  }
  res.json(projects);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = asyncHandler(async (req, res) => {
  const { title, description, members, dueDate } = req.body;

  const project = new Project({
    title,
    description,
    dueDate,
    members: members || [],
    createdBy: req.user._id
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name');

  if (project) {
    // Check if user is admin or a member of the project
    if (req.user.role !== 'Admin' && !project.members.some(m => m._id.equals(req.user._id))) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = asyncHandler(async (req, res) => {
  const { title, description, members, dueDate } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.members = members || project.members;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

export { getProjects, createProject, getProjectById, updateProject, deleteProject };
