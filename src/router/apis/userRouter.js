
const express = require("express");
const router = express.Router();
const AuthController = require("../../controller/Apis/AuthController");
const Validation = require("../../validation/index");
const UserSchemaValidation = require("../../validation/UserSchemaValidation");
const upload = require("../../utils/multer");
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and management APIs
 */

/**
 * @swagger
 * /v2/api/createuser:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: phone
 *         type: number
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *       - in: formData
 *         name: image
 *         type: file
 *         required: false
 *     responses:
 *       200:
 *         description: User created successfully. OTP sent to email.
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/createuser",
  upload.single("image"),
  Validation.validate(UserSchemaValidation.signup),
  AuthController.createUSer
);

/**
 * @swagger
 * /v2/api/verify:
 *   post:
 *     summary: Verify user email using OTP
 *     tags: [Auth]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: verification
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - otp
 *           properties:
 *             email:
 *               type: string
 *               example: user@gmail.com
 *             otp:
 *               type: string
 *               example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       404:
 *         description: User or OTP not found
 *       500:
 *         description: Server error
 */
router.post("/verify", AuthController.verify);

/**
 * @swagger
 * /v2/api/resendotp:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Auth]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: email
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: user@gmail.com
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *       400:
 *         description: Email required or already verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to resend OTP
 */
router.post("/resendotp", AuthController.resendEmailOTP);

/**
 * @swagger
 * /v2/api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: login
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: user@gmail.com
 *             password:
 *               type: string
 *               example: Password@123
 *     responses:
 *       200:
 *         description: Login successful. Returns access token and refresh token.
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
  "/login",
  Validation.validate(UserSchemaValidation.login),
  AuthController.login
);

/**
 * @swagger
 * /v2/api/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *         description: User secret key returned during login
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invalid secret key
 *       500:
 *         description: Logout failed
 */
router.get(
  "/logout",
  AuthMiddleware.verifyToken,
  AuthController.logout
);

/**
 * @swagger
 * /v2/api/refresh-token:
 *   get:
 *     summary: Generate new access token using refresh token
 *     tags: [Auth]
 *     description: Requires refreshToken cookie.
 *     responses:
 *       200:
 *         description: New access token generated
 *       404:
 *         description: Invalid refresh token or user not found
 *       500:
 *         description: Server error
 */
router.get("/refresh-token", AuthController.refreshToken);

/**
 * @swagger
 * /v2/api/getprofile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invalid secret key
 *       500:
 *         description: Server error
 */
router.get(
  "/getprofile",
  AuthMiddleware.verifyToken,
  AuthController.userProfile
);

/**
 * @swagger
 * /v2/api/getAllUsers:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         type: string
 *         required: false
 *       - in: query
 *         name: email
 *         type: string
 *         required: false
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         type: integer
 *         default: 5
 *       - in: header
 *         name: x-secret-key
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invalid secret key
 *       500:
 *         description: Server error
 */
router.get(
  "/getAllUsers",
  AuthMiddleware.verifyToken,
  roleMiddleware("admin"),
  AuthController.getAllUsers
);

/**
 * @swagger
 * /v2/api/reset-password/link:
 *   post:
 *     summary: Send password reset link to email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *       - in: body
 *         name: email
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: user@gmail.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found or invalid secret key
 *       500:
 *         description: Server error
 */
router.post(
  "/reset-password/link",
  Validation.validate(UserSchemaValidation.forgetPassword),
  AuthController.resetPasswordLink
);

/**
 * @swagger
 * /v2/api/resetpassword/{id}/{token}:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: path
 *         name: token
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *       - in: body
 *         name: password
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - password
 *             - comformpassword
 *           properties:
 *             password:
 *               type: string
 *               example: NewPassword@123
 *             comformpassword:
 *               type: string
 *               example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: Invalid user or password
 *       500:
 *         description: Server error
 */
router.post("/resetpassword/:id/:token", AuthController.resetPassword);

/**
 * @swagger
 * /v2/api/update/profile/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         type: string
 *       - in: formData
 *         name: phone
 *         type: number
 *       - in: formData
 *         name: image
 *         type: file
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put(
  "/update/profile/:id",
  AuthMiddleware.verifyToken,
  AuthController.updateprofile
);

/**
 * @swagger
 * /v2/api/updatepassword/{id}:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *       - in: body
 *         name: password
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             currentPassword:
 *               type: string
 *               example: OldPassword@123
 *             newPassword:
 *               type: string
 *               example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or same password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/updatepassword/:id",
  AuthMiddleware.verifyToken,
  AuthController.changePassword
);

/**
 * @swagger
 * /v2/api/deleteuser/{id}:
 *   delete:
 *     summary: Soft delete user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User soft deleted successfully
 *       404:
 *         description: User not found or invalid secret key
 *       500:
 *         description: Server error
 */
router.delete(
  "/deleteuser/:id",
  AuthMiddleware.verifyToken,
  AuthController.deleteUser
);

/**
 * @swagger
 * /v2/api/retrivedeleteduser/{id}:
 *   patch:
 *     summary: Restore soft-deleted user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found or invalid secret key
 *       500:
 *         description: Server error
 */
router.patch(
  "/retrivedeleteduser/:id",
  AuthMiddleware.verifyToken,
  AuthController.retriveDeletedUser
);

/**
 * @swagger
 * /v2/api/forcedeleteduser/{id}:
 *   delete:
 *     summary: Permanently delete user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User permanently deleted
 *       404:
 *         description: User not found or invalid secret key
 *       500:
 *         description: Server error
 */
router.delete(
  "/forcedeleteduser/:id",
  AuthMiddleware.verifyToken,
  roleMiddleware("admin"),
  AuthController.forceDeleteUser
);

/**
 * @swagger
 * /v2/api/updateuserstatus/{id}:
 *   post:
 *     summary: Update user status (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: header
 *         name: x-secret-key
 *         required: true
 *         type: string
 *       - in: body
 *         name: status
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - status
 *           properties:
 *             status:
 *               type: string
 *               enum:
 *                 - active
 *                 - inactive
 *               example: active
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: Invalid user ID, status or secret key
 *       500:
 *         description: Server error
 */
router.post(
  "/updateuserstatus/:id",
  AuthMiddleware.verifyToken,
  roleMiddleware("admin"),
  AuthController.updateUserStatus
);

module.exports = router;
