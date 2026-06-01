/**
 * Servidor principal del proyecto Pac-Man.
 * Utiliza Express con ES Modules.
 * Sirve archivos estáticos y expone rutas CRUD para jugadores.
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jugadoresRouter from "./routes/jugadores.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = 3002;

app.use(express.json());

app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/style", express.static(path.join(__dirname, "style")));
app.use("/modules", express.static(path.join(__dirname, "modules")));

app.use("/api/jugadores", jugadoresRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PUERTO, () => {
  console.log(`Servidor Pac-Man corriendo en http://localhost:${PUERTO}`);
});