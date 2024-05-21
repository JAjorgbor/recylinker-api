const express = require('express');
const validate = require('../../middlewares/validate');
const portalAgencyAuthValidation = require('../../validations/portal.agency.auth.validation');
const portalAgencyAuthController = require('../../controllers/portal.agency.auth.controller');
const auth = require('../../middlewares/auth');
// const { multerUploader } = require('../../utils/imageProcessor');

const router = express.Router();
router.post('/create-account', portalAgencyAuthController.createAccount);
router.post('/login', validate(portalAgencyAuthValidation.login), portalAgencyAuthController.login);
router.patch('/update-OTP-option', auth(), portalAgencyAuthController.updateOtpOption);
router.post('/logout', validate(portalAgencyAuthValidation.logout), portalAgencyAuthController.logout);
router.post('/refresh-tokens', validate(portalAgencyAuthValidation.refreshTokens), portalAgencyAuthController.refreshTokens);
router.post('/reset-password', validate(portalAgencyAuthValidation.resetPassword), portalAgencyAuthController.resetPassword);
router.put(
  '/set-new-password/:token',
  validate(portalAgencyAuthValidation.setNewPassword),
  portalAgencyAuthController.setNewPassword
);
router.post(
  '/update-email',
  auth(),
  validate(portalAgencyAuthValidation.updateEmail),
  portalAgencyAuthController.updateEmail
);
router.patch(
  '/update-email/:code',
  validate(portalAgencyAuthValidation.confirmUpdateEmail),
  portalAgencyAuthController.confirmUpdateEmail
);
router.post('/resend-verification-email', auth(), portalAgencyAuthController.resendVerificationEmail);
router.post(
  '/verify-email',
  auth(),
  validate(portalAgencyAuthValidation.verifyEmail),
  portalAgencyAuthController.verifyEmail
);
router.post('/verify-otp', auth(), validate(portalAgencyAuthValidation.verifyOTP), portalAgencyAuthController.verifyOTP);
router.post('/resend-otp', auth(), portalAgencyAuthController.resendLoginOTP);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Portal Agency Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /portal-agency/auth/create-account:
 *   post:
 *     summary: Register as user
 *     tags: [Portal Agency Auth]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: file
 *                 description: User profile avatar
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *               address:
 *                 $ref: '#/components/schemas/portal-agencyUserAddress'
 *           examples:
 *             example:
 *               avatar: (binary data)
 *               firstName: John
 *               lastName: Doe
 *               email: john@example.com
 *               phoneNumber: "090003456"
 *               password: password1
 *               confirmPassword: password1
 *               address:
 *                 street: No 15 Chibok Street
 *                 state: abuja
 *                 longitude: 1000101011
 *                 latitude: 2000201022
 */

/**
 * @swagger
 * /portal-agency/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Portal Agency Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/portal-agencyUser'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /portal-agency/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Portal Agency Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /portal-agency/auth/update-OTP-option:
 *   patch:
 *     summary: sets the use of the portalAgencyUser two factor authentication  to true or false
 *     tags: [Portal Agency Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *              - otpOption
 *             properties:
 *                otpOption:
 *                  type: boolean
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /portal-agency/auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Portal Agency Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /portal-agency/auth/reset-password:
 *   post:
 *     summary: Forgot password
 *     description: An email will be sent to reset password.
 *     tags: [Portal Agency Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: example@haqqman.agency
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /portal-agency/auth/set-new-password/{token}:
 *   put:
 *     summary: Set New Password
 *     tags: [Portal Agency Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Use token to set new password after portalAgency user request to reset password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmNewPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: P@ssword!
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               confirmNewPassword:
 *                 type: string
 *                 format: P@ssword!
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               password: password1
 *               confirmNewPassword: password1
 *     responses:
 *       "200":
 *         description: Password reset successful
 *       "401":
 *         description: Password reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Password reset failed
 */

/**
 * @swagger
 * /portal-agency/auth/update-email:
 *   post:
 *     summary: Trigger Update email
 *     tags: [Portal Agency Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldEmail:
 *                 type: string
 *                 format: email
 *               newEmail:
 *                 type: string
 *                 format: email
 *             example:
 *               oldEmail: oldemail@haqqman.agency
 *               newEmail: newemail@haqqman.agency
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /portal-agency/auth/update-email/{code}:
 *   patch:
 *     summary: Verify and confirm request to update email
 *     tags: [Portal Agency Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The update email confirmation code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *             example:
 *               newEmail: newemail@haqqman.agency
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /portal-agency/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for PortalAgency User
 *     description: Verify the OTP sent to the portalAgency user after successful login.
 *     tags: [Portal Agency Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *             example:
 *               otp: "392920"
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         description: OTP expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: OTP expired!
 *       "401":
 *         description: Access verification with OTP failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Access verification with OTP failed
 */
