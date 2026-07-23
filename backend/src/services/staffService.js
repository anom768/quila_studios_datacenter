const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Generates a race-condition-safe staff ID inside a transaction.
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string} prefix - 'IN' or 'QS'
 * @returns {Promise<string>}
 */
const generateStaffId = async (tx, prefix) => {
  const counter = await tx.staffIdCounter.upsert({
    where: { prefix },
    update: { lastSequence: { increment: 1 } },
    create: { prefix, lastSequence: 1 },
  });
  return `${prefix}${String(counter.lastSequence).padStart(3, '0')}`;
};

/**
 * Create a new staff with auto-generated staffId
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const createStaff = async (data) => prisma.$transaction(async (tx) => {
    const prefix = data.employmentType === 'Internship' ? 'IN' : 'QS';
    const staffId = await generateStaffId(tx, prefix);
    
    return tx.staff.create({
      data: {
        ...data,
        staffId,
      },
    });
  });

/**
 * Find all staff with pagination and filtering
 * @param {Object} queryOptions 
 * @returns {Promise<{items: Object[], total: number}>}
 */
const findAll = async ({ skip = 0, take = 20, where = {} }) => {
  const [items, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staff.count({ where }),
  ]);
  
  return { items, total };
};

/**
 * Find a single staff by ID
 * @param {number} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => prisma.staff.findUnique({
    where: { id },
  });

/**
 * Update staff details (excluding staffId)
 * @param {number} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const updateStaff = async (id, data) => prisma.staff.update({
    where: { id },
    data,
  });

/**
 * Delete a staff record
 * @param {number} id 
 * @returns {Promise<Object>}
 */
const deleteStaff = async (id) => prisma.staff.delete({
    where: { id },
  });

module.exports = {
  createStaff,
  findAll,
  findById,
  updateStaff,
  deleteStaff,
};
