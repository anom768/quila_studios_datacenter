const staffApplication = require('../application/staff.application');
const ValidationError = require('../errors/ValidationError');
const { sendSuccess } = require('../utils/response');

const createStaff = async (req, res, next) => {
  try {
    const staff = await staffApplication.createStaff(req.body);
    return sendSuccess(res, staff, 'Staff created successfully', 201);
  } catch (err) {
    return next(err);
  }
};

const getStaffList = async (req, res, next) => {
  try {
    const data = await staffApplication.getStaffList(req.query);
    return sendSuccess(res, data, 'Staff list retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getStaffById = async (req, res, next) => {
  try {
    const staff = await staffApplication.getStaffById(req.params.id);
    return sendSuccess(res, staff, 'Staff details retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const staff = await staffApplication.updateStaff(req.params.id, req.body);
    return sendSuccess(res, staff, 'Staff updated successfully');
  } catch (err) {
    return next(err);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    await staffApplication.deleteStaff(req.params.id);
    return sendSuccess(res, null, 'Staff deleted successfully');
  } catch (err) {
    return next(err);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No photo uploaded or invalid file format');
    }
    const staff = await staffApplication.uploadPhoto(req.params.id, req.file);
    return sendSuccess(res, staff, 'Staff photo uploaded successfully');
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createStaff,
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  uploadPhoto,
};
