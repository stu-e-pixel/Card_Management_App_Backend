const express = require("express");
const router = express.Router();
const CardController = require("../../controller/Apis/CardController");
const upload = require("../../utils/multer");
const Validation = require('../../validation/index');
const CardSchemaValidation = require('../../validation/CardSchemaValidation');
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");


/**
 * @swagger
 * /v1/api/createcard:
 *   post:
 *     summary: Create Card
 *     tags:
 *       - Card
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Card title
 *       - in: formData
 *         name: card_holder_name
 *         type: string
 *         required: true
 *         description: Card holder name
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: Card description
 *       - in: formData
 *         name: category
 *         type: string
 *         required: true
 *         description: Card category
 *       - in: formData
 *         name: phone
 *         type: string
 *         required: true
 *         description: Phone number
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Email address
 *       - in: formData
 *         name: website
 *         type: string
 *         required: true
 *         description: Website URL
 *       - in: formData
 *         name: address
 *         type: string
 *         required: true
 *         description: Card holder address
 *       - in: formData
 *         name: social_links
 *         type: string
 *         required: false
 *         description: Social media links
 *       - in: formData
 *         name: image
 *         type: file
 *         required: false
 *         description: Card image
 *       - in: formData
 *         name: cover_image
 *         type: file
 *         required: false
 *         description: Card cover image
 *       - in: formData
 *         name: status
 *         type: string
 *         required: false
 *         description: Card status
 *         enum:
 *           - active
 *     responses:
 *       200:
 *         description: Card data added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */


// /**
//  * @swagger
//  * /v1/api/createcard:
//  *   post:
//  *     summary: Create Card
//  *     tags:
//  *       - Card
//  *     consumes:
//  *       - application/json
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: body
//  *         name: card
//  *         description: Add card to MongoDB.
//  *         required: true
//  *         schema:
//  *           type: object
//  *           required:
//  *             - title
//  *             - card_holder_name
//  *             - description
//  *             - category
//  *             - phone
//  *             - email
//  *             - website
//  *             - address
//  *           properties:
//  *             title:
//  *               type: string
//  *             card_holder_name:
//  *               type: string
//  *             description:
//  *               type: string
//  *             category:
//  *               type: string
//  *             phone:
//  *               type: number
//  *             email:
//  *               type: string
//  *             website:
//  *               type: string
//  *             address:
//  *               type: string
//  *             social_links:
//  *               type: string
//  *             image:
//  *               type: object
//  *               properties:
//  *                 url:
//  *                   type: string
//  *                   default: https://placehold.co/600x400?text=Default+Image
//  *                 public_id:
//  *                   type: string
//  *                   default: default_image
//  *             cover_image:
//  *               type: object
//  *               properties:
//  *                 url:
//  *                   type: string
//  *                   default: https://placehold.co/1200x400?text=Default+Cover
//  *                 public_id:
//  *                   type: string
//  *                   default: default_cover_image
//  *             status:
//  *               type: string
//  *               enum:
//  *                 - active
//  *                 - inactive
//  *               default: active
//  *     responses:
//  *       200:
//  *         description: Card data added successfully.
//  *       400:
//  *         description: Bad request.
//  *       500:
//  *         description: Server error.
//  */

router.post(
  "/createcard",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),AuthMiddleware.verifyToken,roleMiddleware("admin"),CardController.createCard,
);

/**
 * @swagger
 * /v1/api/getCard:
 *   get:
 *     summary: Get all cards from the database
 *     tags:
 *       - Card
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Fetched card data successfully
 *       '500':
 *         description: Internal server error
 */

router.get("/getCard",AuthMiddleware.verifyToken,CardController.getCard);

/**
 * @swagger
 * /v1/api/getCardById/{id}:
 *   get:
 *     summary: Get card by ID
 *     tags:
 *       - Card
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: Card ID
 *     responses:
 *       '200':
 *         description: Card fetched successfully
 *       '400':
 *         description: Invalid card ID
 *       '404':
 *         description: Card not found
 *       '500':
 *         description: Internal server error
 */

router.get("/getCardById/:id",AuthMiddleware.verifyToken,CardController.getCardById);


// /**
//  * @swagger
//  * /v1/api/updateCard/{id}:
//  *   put:
//  *     summary: Update card by ID
//  *     tags:
//  *       - Card
//  *     consumes:
//  *       - application/json
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         type: string
//  *         description: Card ID
//  *       - in: body
//  *         name: card
//  *         required: true
//  *         description: Updated card details
//  *         schema:
//  *           type: object
//  *           properties:
//  *             title:
//  *               type: string
//  *             card_holder_name:
//  *               type: string
//  *             description:
//  *               type: string
//  *             category:
//  *               type: string
//  *             phone:
//  *               type: number
//  *             email:
//  *               type: string
//  *             website:
//  *               type: string
//  *             address:
//  *               type: string
//  *             social_links:
//  *               type: string
//  *             image:
//  *               type: object
//  *               properties:
//  *                 url:
//  *                   type: string
//  *                 public_id:
//  *                   type: string
//  *             cover_image:
//  *               type: object
//  *               properties:
//  *                 url:
//  *                   type: string
//  *                 public_id:
//  *                   type: string
//  *             status:
//  *               type: string
//  *               enum:
//  *                 - active
//  *                 - inactive
//  *     responses:
//  *       '200':
//  *         description: Card updated successfully
//  *       '400':
//  *         description: Invalid card ID or request data
//  *       '404':
//  *         description: Card not found
//  *       '500':
//  *         description: Internal server error
//  */

/**
 * @swagger
 * /v1/api/updateCard/{id}:
 *   put:
 *     summary: Update card by ID
 *     tags:
 *       - Card
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: Card ID
 *
 *       - in: formData
 *         name: title
 *         type: string
 *         description: Card title
 *
 *       - in: formData
 *         name: card_holder_name
 *         type: string
 *         description: Card holder name
 *
 *       - in: formData
 *         name: description
 *         type: string
 *         description: Card description
 *
 *       - in: formData
 *         name: category
 *         type: string
 *         description: Card category
 *
 *       - in: formData
 *         name: phone
 *         type: string
 *         description: Phone number
 *
 *       - in: formData
 *         name: email
 *         type: string
 *         description: Email address
 *
 *       - in: formData
 *         name: website
 *         type: string
 *         description: Website URL
 *
 *       - in: formData
 *         name: address
 *         type: string
 *         description: Card address
 *
 *       - in: formData
 *         name: social_links
 *         type: string
 *         description: Social media links
 *
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Upload card image
 *
 *       - in: formData
 *         name: cover_image
 *         type: file
 *         description: Upload card cover image
 *
 *       - in: formData
 *         name: status
 *         type: string
 *         enum:
 *           - active
 *           - inactive
 *         description: Card status
 *
 *     responses:
 *       '200':
 *         description: Card updated successfully
 *       '400':
 *         description: Invalid card ID or request data
 *       '404':
 *         description: Card not found
 *       '500':
 *         description: Internal server error
 */


router.put("/updateCard/:id",upload.fields([
  {name:'image',maxCount:1},
  {name:'cover_image',maxCount:1}
]),AuthMiddleware.verifyToken,roleMiddleware("admin"),CardController.updateCard);

/**
 * @swagger
 * /v1/api/softdelete/{id}:
 *  delete:
 *    summary: Soft delete Card
 *    tags:
 *      - Card
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Card Id
 *    responses:
 *       '200': 
 *          description: Card soft deleted succesfully
 *       '400':
 *          description: Invalid card Id
 *       '404':
 *          description: Card not found
 *       '500':
 *          description: Internal server error
 *      
 */

router.delete("/softdelete/:id",AuthMiddleware.verifyToken,roleMiddleware("admin"),CardController.softDeleteCard);

/**
 * @swagger
 * /v1/api/retrivedelete/{id}:
 *  patch:
 *    summary: retrive deleted Card
 *    tags: 
 *      - Card
 *    produces: 
 *      - application/json
 *    parameters: 
 *      - in: path
 *        name: id
 *        required: true
 *        description: Card Id
 *    responses:
 *      '200':
 *        description: Card retrive succesfully
 *      '400':
 *        description: Invalid card Id
 *      '404':
 *        description: Card not found
 *      '500':
 *        description: Internal server error
 */

router.patch("/retrivedelete/:id",AuthMiddleware.verifyToken,roleMiddleware("admin"),CardController.retriveDeletedCard);

/**
 * @swagger
 * /v1/api/forcedelete/{id}:
 *  delete:
 *    summary: delete permanent card
 *    tags:
 *      - Card
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Card Id
 *    responses:
 *      '200':
 *        description: Card deleted parmanently
 *      '400':
 *        description: Invalid Card Id
 *      '404':
 *        description: Card not found
 *      '500':
 *        description: Internal server error
 */

router.delete("/forcedelete/:id",AuthMiddleware.verifyToken,roleMiddleware("admin"),CardController.forceDeleteCard)

module.exports = router;
