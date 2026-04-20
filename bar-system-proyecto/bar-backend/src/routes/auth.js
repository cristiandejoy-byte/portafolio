// bar-backend/src/routes/auth.js

const router = require('express').Router();
const bcrypt = require('bcrypt');
const db     = require('../db');

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.password, u.nombre, u.email,
              u.rol, u.activo, u.sedeId,
              DATE_FORMAT(u.createdAt,'%Y-%m-%d') AS createdAt
       FROM usuarios u
       WHERE u.username = ?
       LIMIT 1`,
      [username.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const user = rows[0];

    if (!user.activo) {
      return res.status(403).json({ error: 'Esta cuenta está desactivada. Contacta al administrador.' });
    }

    // Contraseñas hasheadas con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // IP real
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Auditoría de login
    await db.query(
      `INSERT INTO auditoria (tipo, usuario, sedeId, ip, detalle)
       VALUES ('LOGIN', ?, ?, ?, ?)`,
      [user.username, user.sedeId ?? null, ip, `Inicio de sesión — Rol: ${user.rol}`]
    ).catch(() => {});

    // Devolver usuario sin la contraseña
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });

  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  const { username, sedeId } = req.body;

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  try {
    await db.query(
      `INSERT INTO auditoria (tipo, usuario, sedeId, ip, detalle)
       VALUES ('LOGOUT', ?, ?, ?, 'Cierre de sesión')`,
      [username ?? 'desconocido', sedeId ?? null, ip]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth/logout]', err);
    return res.status(500).json({ error: 'Error al registrar logout.' });
  }
});

module.exports = router;