const { Router } = require('express');
const { promptChatBot } = require('../../services/chatbot.service');
const { cloudinary, multerUploader, createPublicId, deleteMulterUpload } = require('../../utils/imageProcessor');

const router = Router();

router.get('/', (req, res) => {
  res.send("What's up danger");
});

router.post('/image', multerUploader.single('dummyImage'), (req, res) => {
  console.log(req.body);
  res.send({ image: req.file.path });
  deleteMulterUpload(req.file.path);
});

router.post('/chat', async (req, res) => {
  const botResponse = await promptChatBot(req.body);
  res.send(botResponse);
});

module.exports = router;

/**
 * @swagger
 * tags:
 *    name:"Dummy Routes"
 *    description:Testing Routes
 */
/**
 * @swagger
 * /dummy:
 *    get:
 *        summary: First description for dummy route
 *        description: Lorem ipsum.
 *        tags: [Dummy Routes]
 *
 */
