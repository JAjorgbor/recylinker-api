const httpStatus = require('http-status');
const { PortalAgency } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<PortalAgency>}
 */
const createPortalAgency = async (userBody) => {
  if (await PortalAgency.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // create security object
  const security = {
    password: userBody.password,
  };
  userBody.security = security;

  return await PortalAgency.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPortalAgencys = async (filter, options) => {
  const users = await PortalAgency.paginate(filter, options);
  return users;
};

const getPortalAgencys = async () => {
  const users = await PortalAgency.find();
  return users;
};
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<PortalAgency>}
 */
const getPortalAgencyById = async (id) => {
  return await PortalAgency.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<PortalAgency>}
 */
const getPortalAgencyByEmail = async (email) => {
  return await PortalAgency.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<PortalAgency>}
 */
const updatePortalAgencyById = async (userId, updateBody) => {
  const user = await getPortalAgencyById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PortalAgency not found');
  }
  if (updateBody.email && (await PortalAgency.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<PortalAgency>}
 */
const deletePortalAgencyById = async (userId) => {
  const user = await getPortalAgencyById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PortalAgency not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createPortalAgency,
  queryPortalAgencys,
  getPortalAgencyById,
  getPortalAgencys,
  getPortalAgencyByEmail,
  updatePortalAgencyById,
  deletePortalAgencyById,
};
