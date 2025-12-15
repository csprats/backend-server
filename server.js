import 'dotenv/config'; 
import express, { response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta para obtener todos los mensajes
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cschat ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});
// Ruta para añadir un nuevo mensaje
app.post('/', async (req, res) => {
  const { user, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cschat (user_name, message) VALUES ($1, $2) RETURNING *',
      [user, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});


app.delete('/:id', async (req, res) => {
  // Extraer el ID del mensaje de los parámetros de la URL
  const { id } = req.params;

  try {
    // Ejecutar la consulta SQL DELETE
    const result = await pool.query('DELETE FROM cschat WHERE id = $1 RETURNING *', [id]);

    // Verificar si se eliminó alguna fila
    if (result.rowCount > 0) {
      // Si se eliminó correctamente, responder con el elemento eliminado
      res.json({
        message: `Mensaje con ID ${id} eliminado exitosamente`,
        deletedMessage: result.rows[0]
      });
    } else {
      // Si no se encontró el ID, responder con estado 404 Not Found
      res.status(404).send(`No se encontró el mensaje con ID ${id}`);
    }

  } catch (err) {
    console.error(err);
    // Manejar errores del servidor
    res.status(500).send('Error del servidor al intentar eliminar el mensaje');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});