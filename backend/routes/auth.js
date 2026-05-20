const express = require('express');
const db = require('../db');

const router = express.Router();

// INTENTIONALLY VULNERABLE: Error-Based SQL Injection + Authentication Bypass
// User input is concatenated directly into the SQL string.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  // Single-line query so `-- ` comments out the password check (multiline breaks classic bypass)
  const query = `SELECT id, username, role, email FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log('[VULNERABLE LOGIN QUERY]', query.trim());

  try {
    const [rows] = await db.query(query);

    if (rows.length > 0) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: rows[0],
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
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

// SECURE: Uses prepared statements via db.execute()
router.post('/secure-login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  const query = `
    SELECT id, username, role, email
    FROM users
    WHERE username = ?
    AND password = ?
  `;

  try {
    const [rows] = await db.execute(query, [username, password]);

    if (rows.length > 0) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: rows[0],
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  } catch (error) {
    console.error('[SECURE LOGIN ERROR]', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
});

module.exports = router;
