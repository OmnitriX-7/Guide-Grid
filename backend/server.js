const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// -----------------------------------------------
// Middleware
// -----------------------------------------------
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

app.use(express.json());

const ALLOWED_TYPES = ['all', 'academic', 'sports', 'music', 'dance', 'arts'];

// -----------------------------------------------
// 1. Search API Endpoint (Finds nearby centres)
// -----------------------------------------------
app.post('/api/search', async (req, res) => {
  try {
    const { lat, lng, radius_km, type } = req.body;

    if (!lat || !lng || !radius_km) {
      return res.status(400).json({ success: false, error: 'Latitude, longitude, and radius are required.' });
    }

    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid coaching type provided.' });
    }

    let queryText = `
      SELECT 
        id, name, type, address, phone_number, fee_range, batch_timings, language_medium, verified,
        ST_Distance(location, ST_MakePoint($1, $2)::geography) / 1000 AS distance_km,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM coaching_centres
      WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3 * 1000)
    `;

    const queryParams = [lng, lat, radius_km];

    if (type && type !== 'all') {
      queryParams.push(type);
      queryText += ` AND type = $${queryParams.length}`;
    }

    queryText += ` ORDER BY distance_km ASC LIMIT 50`;

    const { rows } = await db.query(queryText, queryParams);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });

  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error while searching locations.' });
  }
});

// -----------------------------------------------
// 2. Single Centre API Endpoint (Gets one centre's details)
// -----------------------------------------------
app.get('/api/centre/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT id, name, type, address, phone_number, fee_range, batch_timings, language_medium, verified 
      FROM coaching_centres 
      WHERE id = $1
    `;

    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Centre not found.' });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.error('Single Centre API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching centre details.' });
  }
});

// -----------------------------------------------
// 3. Registration API Endpoint (Full with all fields)
// -----------------------------------------------
app.post('/api/register', async (req, res) => {
  try {
    const {
      centre_id,
      student_name,
      phone,
      email,
      age,
      gender,
      grade,
      parent_name,
      parent_phone,
      school_name,
      address,
      preferred_timing,
      course_interest,
      learning_mode,
      previous_coaching,
      special_requirements,
      heard_from,
    } = req.body;

    // Required field validation
    if (!centre_id || !student_name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Centre ID, student name, and phone are required.',
      });
    }
    if (!parent_name || !parent_phone) {
      return res.status(400).json({
        success: false,
        error: 'Parent name and parent phone are required.',
      });
    }
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required.',
      });
    }

    // Phone validations
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Student phone must be exactly 10 digits.',
      });
    }
    if (!/^\d{10}$/.test(parent_phone)) {
      return res.status(400).json({
        success: false,
        error: 'Parent phone must be exactly 10 digits.',
      });
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    // Age validation
    if (age !== null && age !== undefined) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 3 || ageNum > 80) {
        return res.status(400).json({
          success: false,
          error: 'Age must be between 3 and 80.',
        });
      }
    }

    // learning_mode validation
    const ALLOWED_MODES = ['Offline', 'Online', 'Hybrid'];
    if (learning_mode && !ALLOWED_MODES.includes(learning_mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid learning mode provided.',
      });
    }

    // previous_coaching must be boolean or null
    if (previous_coaching !== null && previous_coaching !== undefined &&
        typeof previous_coaching !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'previous_coaching must be true or false.',
      });
    }

    const queryText = `
      INSERT INTO registrations (
        centre_id, student_name, phone, email, age, gender, grade,
        parent_name, parent_phone, school_name, address,
        preferred_timing, course_interest, learning_mode,
        previous_coaching, special_requirements, heard_from
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, created_at
    `;

    const { rows } = await db.query(queryText, [
      centre_id,
      student_name,
      phone,
      email                || null,
      age                  ? parseInt(age) : null,
      gender               || null,
      grade                || null,
      parent_name,
      parent_phone,
      school_name          || null,
      address,
      preferred_timing     || null,
      course_interest      || null,
      learning_mode        || null,
      previous_coaching    ?? null,
      special_requirements || null,
      heard_from           || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: rows[0],
    });

  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration.',
    });
  }
});

// -----------------------------------------------
// Server Initialization
// -----------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});