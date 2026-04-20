const router = require('express').Router();
const db     = require('../db');

// ─────────────────────────────────────────────
// GET /api/inventory/products — Todos los productos (HU-009)
// ─────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, categoria, precio, descripcion, activo,
              DATE_FORMAT(createdAt,'%Y-%m-%d') AS createdAt
       FROM productos ORDER BY categoria, nombre`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ─────────────────────────────────────────────
// POST /api/inventory/products — Crear producto (HU-009)
// ─────────────────────────────────────────────
router.post('/products', async (req, res) => {
  const { nombre, categoria, precio, descripcion } = req.body;
  if (!nombre || !categoria || !precio) {
    return res.status(400).json({ error: 'nombre, categoria y precio son obligatorios' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO productos (nombre, categoria, precio, descripcion, activo)
       VALUES (?, ?, ?, ?, TRUE)`,
      [nombre.trim(), categoria, Number(precio), descripcion || null]
    );
    // Crear stock 0 en todas las sedes automáticamente
    const [sedes] = await db.query('SELECT id FROM sedes WHERE activo = TRUE');
    for (const sede of sedes) {
      await db.query(
        `INSERT INTO stock (sedeId, productoId, cantidad, minimo) VALUES (?, ?, 0, 5)`,
        [sede.id, result.insertId]
      );
    }
    await db.query(
      `INSERT INTO auditoria (tipo, usuario, ip, detalle) VALUES ('CREAR_PRODUCTO','admin','127.0.0.1',?)`,
      [`Producto "${nombre}" creado`]
    );
    const [[newProduct]] = await db.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/inventory/products/:id — Editar producto (HU-009)
// ─────────────────────────────────────────────
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, descripcion, activo } = req.body;
  try {
    const fields = [];
    const values = [];
    if (nombre      !== undefined) { fields.push('nombre = ?');      values.push(nombre.trim()); }
    if (categoria   !== undefined) { fields.push('categoria = ?');   values.push(categoria); }
    if (precio      !== undefined) { fields.push('precio = ?');      values.push(Number(precio)); }
    if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
    if (activo      !== undefined) { fields.push('activo = ?');      values.push(activo ? 1 : 0); }

    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' });

    values.push(id);
    await db.query(`UPDATE productos SET ${fields.join(', ')} WHERE id = ?`, values);
    await db.query(
      `INSERT INTO auditoria (tipo, usuario, ip, detalle) VALUES ('EDITAR_PRODUCTO','admin','127.0.0.1',?)`,
      [`Producto #${id} actualizado`]
    );
    const [[updated]] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ─────────────────────────────────────────────
// GET /api/inventory/stock/:sedeId — Stock de una sede (HU-011)
// ─────────────────────────────────────────────
router.get('/stock/:sedeId', async (req, res) => {
  const { sedeId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT s.productoId, p.nombre, p.categoria, p.precio,
              s.cantidad, s.minimo,
              CASE
                WHEN s.cantidad = 0        THEN 'AGOTADO'
                WHEN s.cantidad < s.minimo THEN 'BAJO'
                ELSE 'OK'
              END AS estado
       FROM stock s
       JOIN productos p ON s.productoId = p.id
       WHERE s.sedeId = ? AND p.activo = TRUE
       ORDER BY p.categoria, p.nombre`,
      [sedeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener stock' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/inventory/stock/:sedeId/:productoId — Ajuste manual (HU-013)
// ─────────────────────────────────────────────
router.put('/stock/:sedeId/:productoId', async (req, res) => {
  const { sedeId, productoId } = req.params;
  const { cantidad, minimo, motivo } = req.body;
  try {
    const fields = [];
    const values = [];
    if (cantidad !== undefined) { fields.push('cantidad = ?'); values.push(Math.max(0, Number(cantidad))); }
    if (minimo   !== undefined) { fields.push('minimo = ?');   values.push(Math.max(0, Number(minimo))); }
    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' });

    values.push(sedeId, productoId);
    await db.query(
      `UPDATE stock SET ${fields.join(', ')} WHERE sedeId = ? AND productoId = ?`,
      values
    );
    await db.query(
      `INSERT INTO auditoria (tipo, usuario, sedeId, ip, detalle)
       VALUES ('AJUSTE_STOCK','admin',?,'127.0.0.1',?)`,
      [sedeId, `Producto #${productoId}: ${motivo || 'Ajuste manual'} — Sede #${sedeId}`]
    );
    const [[updated]] = await db.query(
      'SELECT * FROM stock WHERE sedeId = ? AND productoId = ?',
      [sedeId, productoId]
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al ajustar stock' });
  }
});

// ─────────────────────────────────────────────
// GET /api/inventory/audit — Log de auditoría (HU-024)
// ─────────────────────────────────────────────
router.get('/audit', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM auditoria ORDER BY timestamp DESC LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
});

module.exports = router;
