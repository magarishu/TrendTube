import express from 'express';

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  res.json({ 
    message: 'Get all categories',
    data: [] 
  });
});

// Get category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: `Get category ${id}`,
    data: {} 
  });
});

// Get videos by category
router.get('/:id/videos', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: `Get videos in category ${id}`,
    data: [] 
  });
});

export default router;
