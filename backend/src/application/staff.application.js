const fs = require('fs');
const path = require('path');
const staffService = require('../services/staffService');
const NotFoundError = require('../errors/NotFoundError');

/**
 * Handle staff creation
 */
const createStaff = async (data) => staffService.createStaff(data);

/**
 * Get paginated and filtered staff
 */
const getStaffList = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const where = {};
  if (query.status) where.status = query.status;
  if (query.employmentType) where.employmentType = query.employmentType;
  if (query.position) where.position = query.position;
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { staffId: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const result = await staffService.findAll({ skip, take: limit, where });
  return {
    ...result,
    page,
    limit,
  };
};

/**
 * Get staff by ID
 */
const getStaffById = async (id) => {
  const staff = await staffService.findById(Number(id));
  if (!staff) throw new NotFoundError('Staff not found');
  return staff;
};

/**
 * Update staff details
 */
const updateStaff = async (id, data) => {
  const existing = await staffService.findById(Number(id));
  if (!existing) throw new NotFoundError('Staff not found');

  const updateData = { ...data };
  delete updateData.staffId;
  delete updateData.photoPath;

  return staffService.updateStaff(Number(id), updateData);
};

/**
 * Helper to delete photo file
 */
const deletePhotoFile = (photoPath) => {
  if (!photoPath) return;
  const absolutePath = path.join(__dirname, '../../uploads/staff-photos', path.basename(photoPath));
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
    } catch (err) {
      console.error(`Failed to delete photo ${absolutePath}`, err);
    }
  }
};

/**
 * Delete staff and their photo
 */
const deleteStaff = async (id) => {
  const existing = await staffService.findById(Number(id));
  if (!existing) throw new NotFoundError('Staff not found');

  await staffService.deleteStaff(Number(id));
  
  if (existing.photoPath) {
    deletePhotoFile(existing.photoPath);
  }

  return { success: true };
};

/**
 * Upload or replace staff photo
 */
const uploadPhoto = async (id, file) => {
  const staff = await staffService.findById(Number(id));
  if (!staff) throw new NotFoundError('Staff not found');

  if (staff.photoPath) {
    deletePhotoFile(staff.photoPath);
  }

  const newPhotoPath = `staff-photos/${file.filename}`;
  const updatedStaff = await staffService.updateStaff(Number(id), { photoPath: newPhotoPath });

  return updatedStaff;
};

module.exports = {
  createStaff,
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  uploadPhoto,
};
