const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = `
    SELECT id, username, password, role, email, salary
    FROM users
  `;

  try {
    const [rows] = await db.query(query);
    return res.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error('[USERS LIST ERROR]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});

// INTENTIONALLY VULNERABLE: UNION-Based + Error-Based SQL Injection
// User input is concatenated into a LIKE clause without sanitization.
router.get('/search', async (req, res) => {
  const username = req.query.username ?? '';

  const query = `
    SELECT id, username, password, role, email, salary
    FROM users
    WHERE username LIKE '%${username}%'
  `;

  console.log('[VULNERABLE SEARCH QUERY]', query.trim());

  try {
    const [rows] = await db.query(query);

    return res.json({
      success: true,
      query: query.trim(),
      count: rows.length,
      results: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
      query: query.trim(),
    });
  }
});

// SECURE: Parameterized query via db.execute()
router.get('/secure-search', async (req, res) => {
  const username = req.query.username ?? '';

  const query = `
    SELECT id, username, password, role, email, salary
    FROM users
    WHERE username LIKE ?
  `;

  try {
    const [rows] = await db.execute(query, [`%${username}%`]);

    return res.json({
      success: true,
      count: rows.length,
      results: rows,
    });
  } catch (error) {
    console.error('[SECURE SEARCH ERROR]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});

module.exports = router;
