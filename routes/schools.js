import express from 'express';
import Joi from 'joi';
import { addSchool, getSchoolsSortedByDistance } from '../database.js';

const router = express.Router();


const schoolSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  address: Joi.string().required().min(1).max(200),
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180)
});

// Add school endpoint
router.post('/schools', async (req, res) => {
  const { error, value } = schoolSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newSchool = await addSchool(value);
    res.status(201).json(newSchool);
  } catch (err) {
    console.error('Failed to add school:', err);
    res.status(500).json({ error: 'Failed to add school' });
  }
});

// List schools endpoint
router.get('/schools', async (req, res) => {
  const { latitude, longitude } = req.query;
  
  // Validate coordinates
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ 
      error: 'Valid latitude and longitude are required as query parameters' 
    });
  }

  try {
    const schools = await getSchoolsSortedByDistance(
      parseFloat(latitude), 
      parseFloat(longitude)
    );
    res.json(schools);
  } catch (err) {
    console.error('Failed to fetch schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

export { router as schoolRoutes };