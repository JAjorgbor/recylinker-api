const Joi = require('joi');
const { password } = require('./custom.validation');

const createAccount = {
  body: Joi.object().keys({
    avatar: Joi.object({
      file: Joi.any()
        .meta({ swaggerType: 'file' }) // Specify the type as file for Swagger documentation
        .description('Profile avatar to upload'),
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    confirmPassword: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.object().keys({
      street: Joi.string().required(),
      state: Joi.string(),
      city: Joi.string().required(),
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const setNewPassword = {
  params: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    confirmNewPassword: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    vCode: Joi.string().required(),
  }),
};
const verifyOTP = {
  body: Joi.object().keys({
    otp: Joi.string().min(6).max(6).required(),
  }),
};

const updateEmail = {
  body: Joi.object().keys({
    oldEmail: Joi.string().email().required(),
    newEmail: Joi.string().email().required(),
  }),
};

const confirmUpdateEmail = {
  params: Joi.object().keys({
    code: Joi.string().required(),
  }),
  body: Joi.object().keys({
    newEmail: Joi.string().email().required(),
  }),
};

module.exports = {
  createAccount,
  login,
  logout,
  refreshTokens,
  resetPassword,
  setNewPassword,
  updateEmail,
  confirmUpdateEmail,
  verifyEmail,
  verifyOTP,
};
