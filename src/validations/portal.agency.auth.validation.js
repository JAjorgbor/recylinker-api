const Joi = require('joi');
const { password } = require('./custom.validation');

const createAccount = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    recyclableCategories: Joi.array().items(Joi.string().required()).required(),
    password: Joi.string().required().custom(password),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match',
    }),
    brandName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.object()
      .keys({
        street: Joi.string().required(),
        state: Joi.string().allow('', null), // Optional field
        city: Joi.string().required(),
        longitude: Joi.number().required(),
        latitude: Joi.number().required(),
      })
      .required(), // Ensure the address object is required
  }),
  files: Joi.object().keys({
    brandLogo: Joi.array()
      .items(
        Joi.object()
          .unknown(true)
          .keys({
            file: Joi.any()
              .meta({ swaggerType: 'file' }) // Specify the type as file for Swagger documentation
              .description('Brand logo to upload'),
          })
      )
      .required(),
    locationPhotos1: Joi.array()
      .items(
        Joi.object()
          .unknown(true)
          .keys({
            file: Joi.any()
              .meta({ swaggerType: 'file' }) // Specify the type as file for Swagger documentation
              .description('Agency location photo to upload'),
          })
      )
      .min(1)
      .max(1)
      .required(),
    locationPhotos2: Joi.array()
      .items(
        Joi.object()
          .unknown(true)
          .keys({
            file: Joi.any()
              .meta({ swaggerType: 'file' }) // Specify the type as file for Swagger documentation
              .description('Agency location photo to upload'),
          })
      )
      .min(1)
      .max(1)
      .required(),
    locationPhotos3: Joi.array()
      .items(
        Joi.object()
          .unknown(true)
          .keys({
            file: Joi.any()
              .meta({ swaggerType: 'file' }) // Specify the type as file for Swagger documentation
              .description('Agency location photo to upload'),
          })
      )
      .min(1)
      .max(1)
      .required(),
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
