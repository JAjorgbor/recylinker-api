const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { App } = require('../models');
const {
  cloudinary,
  parseMultipartForm,
  cleanFiles,
  createPublicId,
  cleanFields,
  uploadToCloudinary,
} = require('../utils/imageProcessor');

const { portalAuthService, portalUserService, tokenService, emailService, appService } = require('../services');

const createAccount = catchAsync(async (req, res) => {
  try {
    const [fields, rawFiles] = await parseMultipartForm(req);
    const files = cleanFiles(rawFiles);
    const [avatar, locationPhotos1, locationPhotos2, locationPhotos3] = files;
    const body = cleanFields(fields);
    const { password, confirmPassword } = body;
    if (password !== confirmPassword) throw new ApiError(httpStatus.BAD_REQUEST, 'Passwords must match');

    // Upload brand logo to Cloudinary
    const storedAvatar = await uploadToCloudinary(
      `recylinker/residents/avatars`,
      body.firstName + '-' + body.lastName,
      'avatars',
      avatar
    );
    body.avatar = storedAvatar.secure_url;

    // Upload location photos to Cloudinary
    const storedLocationPhotos = [];

    let storedImage = await uploadToCloudinary(
      `recylinker/residents/location-photos`,
      body.firstName + '-' + body.lastName,
      'location-photo',
      locationPhotos1
    );

    storedLocationPhotos.push(storedImage.secure_url);
    storedImage = await uploadToCloudinary(
      `recylinker/residents/location-photos`,
      body.firstName + '-' + body.lastName,
      'location-photo',
      locationPhotos2
    );
    storedLocationPhotos.push(storedImage.secure_url);

    storedImage = await uploadToCloudinary(
      `recylinker/residents/location-photos`,
      body.firstName + '-' + body.lastName,
      'location-photo',
      locationPhotos3
    );
    storedLocationPhotos.push(storedImage.secure_url);
    // });

    body.address.locationPhotos = storedLocationPhotos;
    // console.log(body);
    const user = await portalUserService.createPortalUser(body);
    const tokens = await tokenService.generateAuthTokens(user);

    res.status(httpStatus.CREATED).send({ user, tokens });
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
});

const updateOtpOption = catchAsync(async (req, res) => {
  const portalUser = await portalAuthService.updateOtpOption(req);
  res.send(portalUser);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await portalAuthService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  // const activeApp = await appService.getApp(user.app);
  let useOtp = user.otpOption;
  // let appOtp = activeApp.portalOtpOption;
  // if (useOtp === 'required') {
  //   // send user OTP
  //   const accessOTP = await tokenService.generateUserAccessOTP(user);

  //   await emailService.PortalVerifyUserAccessWithOTP({
  //     to: user.email,
  //     firstName: user.firstName,
  //     otp: accessOTP,
  //     logoEmail: activeApp?.branding?.logoEmail,
  //     portalUrl: activeApp?.portalUrl ?? process.env.PORTAL_URL,
  //   });
  // }
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await portalAuthService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await portalAuthService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

// Trigger request to enable user set new password
const resetPassword = catchAsync(async (req, res) => {
  const portalUrl = req.app.portalUrl;

  // Call the resetPassword service and await its response
  const result = await portalAuthService.resetPassword(
    {
      email: req.body.email,
    },
    portalUrl
  );

  res.status(httpStatus.OK).json({ message: result.message });
});

// Sets new password after request to reset password
const setNewPassword = catchAsync(async (req, res) => {
  await portalAuthService.setNewPassword(req.params.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

// Trigger email update
const updateEmail = catchAsync(async (req, res) => {
  await portalAuthService.updateEmail(req.user, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

// Verify and confirm request to update email
const confirmUpdateEmail = catchAsync(async (req, res) => {
  await portalAuthService.confirmUpdateEmail(req.params.code, req.body.newEmail);
  res.status(httpStatus.NO_CONTENT).send();
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email, firstName } = req.body;

  // Generate the verification code for email verification
  const emailVerificationCode = await tokenService.generateVerifyEmailCode(req.user);

  // Resend the verification code to the user's email for email verification
  await emailService.PortalUserEmailVerificationCode({
    to: email,
    firstName,
    vCode: emailVerificationCode,
  });

  res.status(httpStatus.NO_CONTENT).send();
});

const resendLoginOTP = catchAsync(async (req, res) => {
  const user = req.user;

  // send user OTP
  const OTP = await tokenService.generateUserAccessOTP(user);

  await emailService.PortalUserVerifyAccessWithOTP({
    to: user.email,
    firstName: user.firstName,
    otp: OTP,
  });

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Verify email after creating new account
 * @param {string} vCode - The verification code received by the user's email.
 * @param {string} userId - The ID of the user to be verified.
 * @returns {Promise}
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { vCode } = req.body;
  const userId = req.user.id;

  try {
    // Call the verifyEmail function from the service layer
    await portalAuthService.verifyEmail(vCode, userId);

    // Email verification successful
    res.status(httpStatus.OK).send({ message: 'Email verification was successful. You can now access your account.' });
  } catch (error) {
    // Handle different errors and return appropriate responses
    if (error instanceof ApiError) {
      if (error.statusCode === httpStatus.BAD_REQUEST && error.message === 'Token expired!') {
        // Token has expired
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ error: 'TOKEN_EXPIRED', message: 'The verification code has expired. Please request a new code.' });
      } else if (error.statusCode === httpStatus.NOT_FOUND && error.message === 'Token not found') {
        // Token with provided vCode not found
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ error: 'TOKEN_NOT_FOUND', message: 'No token found associated with the verification code.' });
      } else if (error.statusCode === httpStatus.NOT_FOUND && error.message === 'User not found') {
        // User not found associated with the token
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ error: 'USER_NOT_FOUND', message: 'No user found associated with the verification code.' });
      } else {
        // Other ApiError instances
        res.status(error.statusCode).send({
          error: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while verifying the email. Please try again later.',
        });
      }
    } else {
      // Handle unexpected errors
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while verifying the email. Please try again later.',
      });
    }
  }
});
const verifyOTP = catchAsync(async (req, res) => {
  await portalAuthService.verifyOTP(req.body.otp, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const updatePassword = catchAsync(async (req, res) => {
  try {
    const { id, email } = req.user;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await portalAuthService.loginUserWithEmailAndPassword(email, currentPassword);
    if (!user) {
      throw new ApiError(400, 'Incorrect password');
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, 'Passwords are not the same.');
    }
    await portalAuthService.updatePassword(id, newPassword);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    // Handle the error appropriately without re-throwing it
    res
      .status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: error.message || 'An unexpected error occurred.' });
  }
});

module.exports = {
  createAccount,
  updateOtpOption,
  login,
  logout,
  refreshTokens,
  resetPassword,
  setNewPassword,
  updateEmail,
  confirmUpdateEmail,
  resendVerificationEmail,
  updatePassword,
  verifyEmail,
  verifyOTP,
  updateEmail,
  confirmUpdateEmail,
  resendLoginOTP,
};
