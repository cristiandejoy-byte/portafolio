require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const usersRouter     = require('./routes/users');
const inventoryRouter = require('./routes/inventory');
const authRouter      = require('./routes/auth');        // ← NUEVO

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares ───────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' })); // Puerto de Vite
app.use(express.json());

// ─── Rutas ────────────────────────────────────
app.use('/api/auth',      authRouter);               // ← NUEVO
app.use('/api/users',     usersRouter);
app.use('/api/inventory', inventoryRouter);

// ─── Health check ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bar System API corriendo ✅' });
});

// ─── 404 ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ─── Inicio ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Bar System API corriendo en http://localhost:${PORT}`);
  console.log(`   Rutas disponibles:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/logout`);
  console.log(`   GET    /api/users`);
  console.log(`   POST   /api/users`);
  console.log(`   PUT    /api/users/:id`);
  console.log(`   PATCH  /api/users/:id/toggle`);
  console.log(`   GET    /api/inventory/products`);
  console.log(`   POST   /api/inventory/products`);
  console.log(`   PUT    /api/inventory/products/:id`);
  console.log(`   GET    /api/inventory/stock/:sedeId`);
  console.log(`   PUT    /api/inventory/stock/:sedeId/:productoId`);
  console.log(`   GET    /api/inventory/audit`);
});