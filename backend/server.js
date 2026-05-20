require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'SQL Injection Demo API',
    description:
      'Educational API demonstrating Error-Based and UNION-Based SQL Injection vulnerabilities',
    version: '1.0.0',
    endpoints: {
      info: 'GET /',
      vulnerableLogin: 'POST /api/auth/login',
      secureLogin: 'POST /api/auth/secure-login',
      listUsers: 'GET /api/users',
      vulnerableSearch: 'GET /api/users/search?username=',
      secureSearch: 'GET /api/users/secure-search?username=',
    },
    warning:
      'This API is intentionally vulnerable. Use only in isolated lab environments for education.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log(`SQLi demo API running on http://localhost:${PORT}`);
});
