/**
 * Rutas Express para CRUD completo de jugadores del juego Pac-Man.
 * Persiste los datos en /data/jugadores.txt usando fs (ES Modules).
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaArchivo = path.join(__dirname, "../data/jugadores.txt");

/**
 * Asegura que el directorio /data y el archivo .txt existan.
 */
function asegurarArchivo() {
  const dir = path.join(__dirname, "../data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(rutaArchivo)) {
    fs.writeFileSync(rutaArchivo, JSON.stringify([]), "utf-8");
  }
}

/**
 * Lee y parsea la lista de jugadores desde el archivo .txt.
 * @returns {Array}
 */
function leerJugadores() {
  asegurarArchivo();
  try {
    return JSON.parse(fs.readFileSync(rutaArchivo, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * Escribe la lista de jugadores en el archivo .txt.
 * @param {Array} jugadores
 */
function escribirJugadores(jugadores) {
  asegurarArchivo();
  fs.writeFileSync(rutaArchivo, JSON.stringify(jugadores, null, 2), "utf-8");
}

/* GET: obtener todos los jugadores */
router.get("/", (req, res) => {
  res.json(leerJugadores());
});

/* GET: descargar archivo .txt */
router.get("/archivo", (req, res) => {
  asegurarArchivo();
  res.download(rutaArchivo, "jugadores_pacman.txt");
});

/**
 * POST: agregar jugador nuevo.
 * Recibe: { nombre, puntaje, modo, nivel }
 */
router.post("/", (req, res) => {
  const { nombre, puntaje, modo, nivel } = req.body;
  if (!nombre || puntaje === undefined || !modo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const jugadores = leerJugadores();
  const nuevoJugador = {
    id: Date.now().toString(),
    nombre: nombre.trim(),
    puntaje: Number(puntaje),
    modo,
    nivel: nivel || 1,
    fecha: new Date().toLocaleDateString("es-AR")
  };

  jugadores.push(nuevoJugador);
  escribirJugadores(jugadores);
  res.status(201).json(nuevoJugador);
});

/**
 * PUT: modificar jugador por ID.
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, puntaje, modo } = req.body;
  const jugadores = leerJugadores();
  const idx = jugadores.findIndex((j) => j.id === id);

  if (idx === -1) return res.status(404).json({ error: "No encontrado" });

  if (nombre !== undefined) jugadores[idx].nombre = nombre.trim();
  if (puntaje !== undefined) jugadores[idx].puntaje = Number(puntaje);
  if (modo !== undefined) jugadores[idx].modo = modo;

  escribirJugadores(jugadores);
  res.json(jugadores[idx]);
});

/**
 * DELETE: eliminar jugador por ID.
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const jugadores = leerJugadores();
  const nueva = jugadores.filter((j) => j.id !== id);

  if (nueva.length === jugadores.length) {
    return res.status(404).json({ error: "No encontrado" });
  }

  escribirJugadores(nueva);
  res.json({ mensaje: "Jugador eliminado correctamente" });
});

export default router;