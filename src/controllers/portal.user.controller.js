const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { portalUserService } = require('../services');

const createPortalUser = catchAsync(async (req, res) => {
  const user = await portalUserService.createPortalUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getPortalUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await portalUserService.queryUsers(filter, options);
  res.send(result);
});

const getPortalUser = catchAsync(async (req, res) => {
  const user = await portalUserService.getPortalUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});
const getPortalUserViaToken = catchAsync(async (req, res) => {
  res.send(req.user);
});

const updatePortalUser = catchAsync(async (req, res) => {
  const user = await portalUserService.updatePortalUserById(req.params.userId, req.body);
  res.send(user);
});

const deletePortalUser = catchAsync(async (req, res) => {
  await portalUserService.deletePortalUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPortalUser,
  getPortalUsers,
  getPortalUser,
  updatePortalUser,
  deletePortalUser,
  getPortalUserViaToken,
};
