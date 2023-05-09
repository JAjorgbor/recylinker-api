const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { consoleUserService, emailService, tokenService, brandingService } = require('../services');

const getConsoleUsers = catchAsync(async (req, res) => {
  const consoleUsers = await consoleUserService.getConsoleUsers();
  res.send(consoleUsers);
});

const getConsoleUser = catchAsync(async (req, res) => {
  const user = await consoleUserService.getConsoleUser(req.params.consoleUserId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Console User not found');
  }
  res.send(user);
});

const updateConsoleUser = catchAsync(async (req, res) => {
 await consoleUserService.updateConsoleUser(req.params.consoleUserId, req.body);
  res.send(user);
});

const updateConsoleUserStatus = catchAsync(async (req, res) => {
  await consoleUserService.updateConsoleUserStatus(req.params.consoleUserId, req.body.status);
  res.status(httpStatus.NO_CONTENT).send();
});

const inviteConsoleUser = catchAsync(async (req, res) => {
  // check if user with email already exists
  const user = await consoleUserService.getConsoleUserByEmail(req.body.email);
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The workmail provided already exists!');
  }

  const { email, firstName } = req.body;
  const token = await tokenService.generateInviteConsoleUserToken(req.body);
  // get active hostel from currently logged in user
  const activeBranding = await brandingService.getBrandingById(req.user.activeBranding);
  await emailService.InviteConsoleUser({
    token,
    firstName,
    to: email,
    brandName: activeBranding.name,
    consoleUrl: activeBranding.consoleUrl,
    portalUrl: activeBranding.portalUrl,
    logoEmail: activeBranding.brandingSettings.logoEmail,
  });

  res.status(httpStatus.NO_CONTENT).send();
});

const acceptInvite = catchAsync(async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;
  const payload = await tokenService.generateConsoleUserPayloadFromToken(token);
  const user = await consoleUserService.createConsoleUser({ ...payload, password });
  res.send({ user });
});

module.exports = {
  getConsoleUser,
  getConsoleUsers,
  updateConsoleUserStatus,
  updateConsoleUser,
  inviteConsoleUser,
  acceptInvite,
};
