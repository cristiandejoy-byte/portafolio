const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const db      = require('../db');

// ─────────────────────────────────────────────
// GET /api/users — Listar todos los usuarios
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.nombre, u.email, u.rol,
              u.sedeId, u.activo,
              DATE_FORMAT(u.createdAt, '%Y-%m-%d') AS createdAt,
              s.nombre AS sedeNombre
       FROM usuarios u
       LEFT JOIN sedes s ON u.sedeId = s.id
       ORDER BY u.createdAt ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ─────────────────────────────────────────────
// POST /api/users — Crear usuario (HU-005)
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { username, nombre, password, email, rol, sedeId, activo = true } = req.body;

  if (!username || !nombre || !password || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO usuarios (username, nombre, password, email, rol, sedeId, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username.toLowerCase(), nombre.trim(), hash, email || null, rol,
       rol === 'ADMINISTRADOR' ? null : (sedeId || null), activo]
    );

    await db.query(
      `INSERT INTO auditoria (tipo, usuario, sedeId, ip, detalle)
       VALUES ('CREAR_USUARIO', ?, ?, '127.0.0.1', ?)`,
      [username, sedeId || null, `Usuario "${username}" creado con rol ${rol}`]
    );

    const [newUser] = await db.query(
      `SELECT id, username, nombre, email, rol, sedeId, activo,
              DATE_FORMAT(createdAt,'%Y-%m-%d') AS createdAt
       FROM usuarios WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newUser[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/users/:id — Editar usuario (HU-006)
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, username, password, email, rol, sedeId, activo } = req.body;

  try {
    // Si viene contraseña nueva, hashearla
    let passwordClause = '';
    const params = [];

    if (nombre)    { params.push(nombre.trim()); }
    if (username)  { params.push(username.toLowerCase()); }
    if (email !== undefined) { params.push(email || null); }
    if (rol)       { params.push(rol); }
    if (sedeId !== undefined) {
      params.push(rol === 'ADMINISTRADOR' ? null : (sedeId || null));
    }
    if (activo !== undefined) { params.push(activo ? 1 : 0); }

    // Construir SET dinámico
    const fields = [];
    const values = [];
    if (nombre    !== undefined) { fields.push('nombre = ?');   values.push(nombre.trim()); }
    if (username  !== undefined) { fields.push('username = ?'); values.push(username.toLowerCase()); }
    if (email     !== undefined) { fields.push('email = ?');    values.push(email || null); }
    if (rol       !== undefined) { fields.push('rol = ?');      values.push(rol); }
    if (sedeId    !== undefined) {
      fields.push('sedeId = ?');
      values.push(rol === 'ADMINISTRADOR' ? null : (sedeId || null));
    }
    if (activo    !== undefined) { fields.push('activo = ?');   values.push(activo ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    await db.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values);

    await db.query(
      `INSERT INTO auditoria (tipo, usuario, sedeId, ip, detalle)
       VALUES ('EDITAR_USUARIO', 'admin', ?, '127.0.0.1', ?)`,
      [sedeId || null, `Usuario #${id} actualizado`]
    );

    const [updated] = await db.query(
      `SELECT u.id, u.username, u.nombre, u.email, u.rol,
              u.sedeId, u.activo,
              DATE_FORMAT(u.createdAt,'%Y-%m-%d') AS createdAt,
              s.nombre AS sedeNombre
       FROM usuarios u LEFT JOIN sedes s ON u.sedeId = s.id
       WHERE u.id = ?`,
      [id]
    );

    if (!updated.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/users/:id/toggle — Activar/Desactivar (HU-007)
// ─────────────────────────────────────────────
router.patch('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const [[user]] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevoEstado = !user.activo;
    await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    await db.query(
      `INSERT INTO auditoria (tipo, usuario, ip, detalle)
       VALUES ('TOGGLE_USUARIO', ?, '127.0.0.1', ?)`,
      [user.username, `Usuario "${user.username}" ${nuevoEstado ? 'reactivado' : 'desactivado'}`]
    );

    res.json({ id: Number(id), activo: nuevoEstado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
});

module.exports = router;
