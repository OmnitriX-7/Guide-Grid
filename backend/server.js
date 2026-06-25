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
// 1. Search API — now includes avg_rating & review_count
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
        c.id, c.name, c.type, c.address, c.phone_number,
        c.fee_range, c.batch_timings, c.language_medium, c.verified,
        ST_Distance(c.location, ST_MakePoint($1, $2)::geography) / 1000 AS distance_km,
        ST_Y(c.location::geometry) AS lat,
        ST_X(c.location::geometry) AS lng,
        ROUND(COALESCE(AVG(r.rating), 0)::numeric, 2) AS avg_rating,
        COUNT(r.id)::integer AS review_count
      FROM coaching_centres c
      LEFT JOIN reviews r ON r.centre_id = c.id
      WHERE ST_DWithin(c.location, ST_MakePoint($1, $2)::geography, $3 * 1000)
    `;

    const queryParams = [lng, lat, radius_km];

    if (type && type !== 'all') {
      queryParams.push(type);
      queryText += ` AND c.type = $${queryParams.length}`;
    }

    queryText += `
      GROUP BY c.id
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    const { rows } = await db.query(queryText, queryParams);

    res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error while searching locations.' });
  }
});

// -----------------------------------------------
// 2. Single Centre — now includes avg_rating & review_count
// -----------------------------------------------
app.get('/api/centre/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        c.id, c.name, c.type, c.address, c.phone_number,
        c.fee_range, c.batch_timings, c.language_medium, c.verified,
        ROUND(COALESCE(AVG(r.rating), 0)::numeric, 2) AS avg_rating,
        COUNT(r.id)::integer AS review_count
      FROM coaching_centres c
      LEFT JOIN reviews r ON r.centre_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Centre not found.' });
    }

    res.json({ success: true, data: rows[0] });

  } catch (error) {
    console.error('Single Centre API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching centre details.' });
  }
});

// -----------------------------------------------
// 3. Registration API
// -----------------------------------------------
app.post('/api/register', async (req, res) => {
  try {
    const {
      centre_id, student_name, phone, email, age, gender, grade,
      parent_name, parent_phone, school_name, address,
      preferred_timing, course_interest, learning_mode,
      previous_coaching, special_requirements, heard_from,
    } = req.body;

    if (!centre_id || !student_name || !phone)
      return res.status(400).json({ success: false, error: 'Centre ID, student name, and phone are required.' });
    if (!parent_name || !parent_phone)
      return res.status(400).json({ success: false, error: 'Parent name and parent phone are required.' });
    if (!address)
      return res.status(400).json({ success: false, error: 'Address is required.' });
    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, error: 'Student phone must be exactly 10 digits.' });
    if (!/^\d{10}$/.test(parent_phone))
      return res.status(400).json({ success: false, error: 'Parent phone must be exactly 10 digits.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    if (age !== null && age !== undefined) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 3 || ageNum > 80)
        return res.status(400).json({ success: false, error: 'Age must be between 3 and 80.' });
    }

    const ALLOWED_MODES = ['Offline', 'Online', 'Hybrid'];
    if (learning_mode && !ALLOWED_MODES.includes(learning_mode))
      return res.status(400).json({ success: false, error: 'Invalid learning mode provided.' });

    const queryText = `
      INSERT INTO registrations (
        centre_id, student_name, phone, email, age, gender, grade,
        parent_name, parent_phone, school_name, address,
        preferred_timing, course_interest, learning_mode,
        previous_coaching, special_requirements, heard_from
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id, created_at
    `;

    const { rows } = await db.query(queryText, [
      centre_id, student_name, phone,
      email || null, age ? parseInt(age) : null,
      gender || null, grade || null,
      parent_name, parent_phone,
      school_name || null, address,
      preferred_timing || null, course_interest || null,
      learning_mode || null, previous_coaching ?? null,
      special_requirements || null, heard_from || null,
    ]);

    res.status(201).json({ success: true, message: 'Registration successful.', data: rows[0] });

  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// -----------------------------------------------
// 4. Get Reviews for a Centre
// -----------------------------------------------
app.get('/api/reviews/:centre_id', async (req, res) => {
  try {
    const { centre_id } = req.params;

    const queryText = `
      SELECT id, reviewer_name, rating, comment, created_at
      FROM reviews
      WHERE centre_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await db.query(queryText, [centre_id]);

    res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching reviews.' });
  }
});

// -----------------------------------------------
// 5. Submit a Review
// -----------------------------------------------
app.post('/api/reviews', async (req, res) => {
  try {
    const { centre_id, reviewer_name, rating, comment } = req.body;

    if (!centre_id || !reviewer_name || !rating)
      return res.status(400).json({ success: false, error: 'Centre ID, name, and rating are required.' });

    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, error: 'Rating must be a whole number between 1 and 5.' });

    if (comment && comment.length > 500)
      return res.status(400).json({ success: false, error: 'Comment must be under 500 characters.' });

    const queryText = `
      INSERT INTO reviews (centre_id, reviewer_name, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;

    const { rows } = await db.query(queryText, [
      centre_id,
      reviewer_name.trim(),
      rating,
      comment?.trim() || null,
    ]);

    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: rows[0] });

  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error submitting review.' });
  }
});

// -----------------------------------------------
// Server Initialization
// -----------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});