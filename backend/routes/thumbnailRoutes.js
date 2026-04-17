import express from 'express';
import { generateThumbnailDesigns, generateThumbnailImage } from '../controllers/thumbnailController.js';

const router = express.Router();

router.post('/designs', generateThumbnailDesigns);
router.post('/generate-image', generateThumbnailImage);

export default router;
