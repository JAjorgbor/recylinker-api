const jwt = require('jsonwebtoken');
const moment = require('moment');
const shortid = require('shortid');
const httpStatus = require('http-status');
const config = require('../config/config');
const portalUserService = require('./portal.user.service');
const consoleUserService = require('./console.user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const _ = require('lodash');

/**
 * Check if token has expired
 * @returns {boolean}
 */
const hasExpired = (tokenDoc) => {
  const expiresIn = moment().diff(tokenDoc.createdAt, 'minutes');
  return expiresIn >= config.jwt.verifyEmailExpirationMinutes;
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  // if (type === tokenTypes.VERIFY_EMAIL) aco;
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Verify code and return token doc (or throw an error if it is not valid)
 * @param {string} code
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyCode = async (code, userId) => {
  const tokenDoc = await Token.findOne({ token: code, type: tokenTypes.VERIFY_EMAIL, user: userId, blacklisted: false });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  if (hasExpired(tokenDoc)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token expired!');
  }
  await Token.deleteOne({ user: userId, type: tokenTypes.VERIFY_EMAIL });
  return tokenDoc;
};

/**
 * Verify update email code and return token doc (or throw an error if it is not valid)
 * @param {string} code
 * @returns {Promise<Token>}
 */
const verifyUpdateEmailCode = async (code) => {
  const tokenDoc = await Token.findOne({ token: code, type: tokenTypes.UPDATE_EMAIL });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  if (hasExpired(tokenDoc)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token expired!');
  }
  await Token.deleteOne({ token: code, type: tokenTypes.UPDATE_EMAIL });
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @param { string } userModel
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email, userModel) => {
  if (!userModel) {
    userModel = 'PortalUser';
  }

  let user;
  if (userModel == 'PortalUser') {
    user = await portalUserService.getPortalUserByEmail(email);
  } else {
    user = await consoleUserService.getConsoleUserByWorkmail(email);
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email!');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate invite console user token
 * @param {object} payload (contains role, firstName, lastName, email)
 * @returns {Promise<string>}
 */
const generateConsoleUserInviteToken = async (payload) => {
  const JWTPayload = {
    ...payload,
    iat: moment().unix(),
    exp: moment().add(72, 'hours').unix(),
    type: tokenTypes.INVITE_CONSOLE_USER,
    consoleUserId: shortid.generate(),
  };
  return jwt.sign(JWTPayload, config.jwt.secret);
};

/**
 * Generate verify email code
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailCode = async (user) => {
  // delete previous verify email code to invalidate it
  await Token.deleteOne({ user: user.id, type: tokenTypes.VERIFY_EMAIL });

  const code = _.random(100000, 999999);
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  await saveToken(code, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return code;
};

//Start of OTP user  related methods
/**
 * Check if otp has expired
 * @returns {boolean}
 */
const hasOTPExpired = (otpDoc) => {
  const expiresIn = moment().diff(otpDoc.createdAt, 'minutes');
  return expiresIn >= config.jwt.verifyOTPExpirationMinutes;
};

/**
 * Generate update email code
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateUpdateEmailCode = async (user) => {
  // delete previous update email code to invalidate it
  await Token.deleteOne({ user: user.id, type: tokenTypes.UPDATE_EMAIL });
  const code = _.random(100000, 999999);
  const expires = moment().add(config.jwt.updateEmailExpirationMinutes, 'minutes');
  await saveToken(code, user.id, expires, tokenTypes.UPDATE_EMAIL);
  return code;
};

// Method to generate  OTP
/**
 * Generate verify access otp
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateUserAccessOTP = async (user) => {
  // delete previous otp to invalidate it
  await Token.deleteOne({ user: user.id, type: tokenTypes.VERIFY_OTP });
  const otp = _.random(100000, 999999);
  const expires = moment().add(config.jwt.verifyOTPExpirationMinutes, 'minutes');
  await saveToken(otp, user.id, expires, tokenTypes.VERIFY_OTP);
  return otp;
};

/**
 * Verify OTP and return OTP doc (or throw an error if it is not valid)
 * @param {string} userOTP
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyAccessOTP = async (userOTP, userId) => {
  const otpDoc = await Token.findOne({ token: userOTP, type: tokenTypes.VERIFY_OTP, user: userId, blacklisted: false });
  if (!otpDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found');
  }
  if (hasOTPExpired(otpDoc)) throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired!');
  // delete now invalid otp
  await Token.deleteOne({ _id: otpDoc.id });
  return otpDoc;
};

// Start of Console User Token
/**
 * Generate invite console user token
 * @param {object} payload (contains role, firstName, lastName, email)
 * @returns {Promise<string>}
 */
const generateInviteConsoleUserToken = async (payload) => {
  const JWTPayload = {
    ...payload,
    iat: moment().unix(),
    exp: moment().add(72, 'hours'),
    type: tokenTypes.INVITE_CONSOLE_USER,
  };
  return jwt.sign(payload, config.jwt.secret);
};

/**
 * Generate invite console user token
 * @param {string} token (token from accept invite)
 * @returns {Promise<object>} (containing role, firstName, lastName, email...)
 */
const generateConsoleUserPayloadFromToken = async (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  verifyCode,
  verifyUpdateEmailCode,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailCode,
  generateUpdateEmailCode,
  generateUserAccessOTP,
  generateUpdateEmailCode,
  verifyAccessOTP,
  generateInviteConsoleUserToken,
  generateConsoleUserPayloadFromToken,
  generateConsoleUserInviteToken,
};
