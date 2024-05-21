const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { portalAgencieservice } = require('../services');

const createPortalAgency = catchAsync(async (req, res) => {
  const user = await portalAgencieservice.createPortalAgency(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getPortalAgencies = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await portalAgencieservice.queryUsers(filter, options);
  res.send(result);
});

const getPortalAgency = catchAsync(async (req, res) => {
  const user = await portalAgencieservice.getPortalAgencyById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});
const getPortalAgencyViaToken = catchAsync(async (req, res) => {
  res.send(req.user);
});

const updatePortalAgency = catchAsync(async (req, res) => {
  const user = await portalAgencieservice.updatePortalAgencyById(req.params.userId, req.body);
  res.send(user);
});

const deletePortalAgency = catchAsync(async (req, res) => {
  await portalAgencieservice.deletePortalAgencyById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPortalAgency,
  getPortalAgencies,
  getPortalAgency,
  updatePortalAgency,
  deletePortalAgency,
  getPortalAgencyViaToken,
};
