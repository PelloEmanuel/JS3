/**
 * main.js — Proyecto Pac-Man
 * Módulo principal: controles táctiles, overlays, vista expandida.
 * La lógica del juego (juego.js) no se modifica.
 */

import {
  mostrarElemento,
  establecerTexto,
  obtenerValor,
  establecerValor,
  toggleError,
  actualizarMensajeEstado,
  renderizarVidas,
  renderizarListaJugadores,
  descargarTxt
} from "./dom.js";

import { JuegoPacman } from "./juego.js";

let juegoActual  = null;
let modoActual   = "1jugador";
let partidaActiva = false;
const VIDAS_MAXIMAS = 3;

/* ============================================================
   CRUD
   ============================================================ */

async function obtenerJugadores() {
  try { return await (await fetch("/api/jugadores")).json(); }
  catch { return []; }
}

async function guardarJugador(jugador) {
  try {
    return await (await fetch("/api/jugadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jugador)
    })).json();
  } catch { return null; }
}

async function modificarJugador(id, datos) {
  try {
    return await (await fetch(`/api/jugadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })).json();
  } catch { return null; }
}

async function eliminarJugador(id) {
  try {
    const d = await (await fetch(`/api/jugadores/${id}`, { method: "DELETE" })).json();
    return !!d.mensaje;
  } catch { return false; }
}

/* ============================================================
   INTERFAZ
   ============================================================ */

async function cargarYRenderizarJugadores() {
  const jugadores = await obtenerJugadores();
  renderizarListaJugadores(jugadores, abrirEdicion, manejarEliminar);
}

function abrirEdicion(jugador) {
  establecerValor("editarId", jugador.id);
  establecerValor("editarNombre", jugador.nombre);
  establecerValor("editarPuntaje", jugador.puntaje);
  establecerValor("editarModo", jugador.modo);
  mostrarElemento("cardEditar", true);
  document.getElementById("cardEditar").scrollIntoView({ behavior: "smooth" });
}

async function manejarEliminar(id) {
  const ok = await eliminarJugador(id);
  if (ok) {
    actualizarMensajeEstado("Jugador eliminado correctamente.", "warning");
    await cargarYRenderizarJugadores();
  }
}

function validarNombre(v) { return v.length > 0 && v.length <= 20; }

function toggleTema() {
  const html  = document.documentElement;
  const nuevo = html.getAttribute("data-tema") === "oscuro" ? "claro" : "oscuro";
  html.setAttribute("data-tema", nuevo);
  document.getElementById("btnTema").innerHTML = nuevo === "oscuro"
    ? '<i class="bi bi-sun-fill"></i> Modo Claro'
    : '<i class="bi bi-moon-fill"></i> Modo Oscuro';
}

/* ============================================================
   GESTIÓN DE VISTAS
   Mueve físicamente el nodo <canvas> entre contenedores.
   ============================================================ */

/**
 * Mueve el canvas al contenedor expandido y activa esa vista.
 */
function activarVistaExpandida() {
  const canvas        = document.getElementById("canvasPacman");
  const contenedorExp = document.getElementById("contenedorCanvasExpandido");

  /* Mover físicamente el nodo canvas */
  if (canvas && contenedorExp) {
    contenedorExp.appendChild(canvas);
    canvas.classList.remove("canvas-config", "d-none");
    canvas.classList.add("canvas-expandido");
  }

  ocultarTodosLosOverlays();

  document.getElementById("vistaConfig").classList.add("d-none");
  document.getElementById("vistaJuegoExpandido").classList.remove("d-none");

  mostrarElemento("btnPausarExpandido", true);
  mostrarElemento("btnReiniciarExpandido", true);
  mostrarElemento("bloqueControlesJ2", modoActual === "2jugadores");

  const bloqueJ2 = document.getElementById("marcadorBloqueJ2");
  if (bloqueJ2) bloqueJ2.classList.toggle("d-none", modoActual !== "2jugadores");
}

/**
 * Devuelve el canvas al contenedor config y activa esa vista.
 */
function volverAConfig() {
  const canvas        = document.getElementById("canvasPacman");
  const contenedorCfg = document.getElementById("contenedorCanvasConfig");

  /* Mover físicamente el nodo canvas de vuelta */
  if (canvas && contenedorCfg) {
    contenedorCfg.appendChild(canvas);
    canvas.classList.remove("canvas-expandido");
    canvas.classList.add("canvas-config");
  }

  if (juegoActual) { juegoActual.detener(); juegoActual = null; }
  partidaActiva = false;

  document.getElementById("vistaJuegoExpandido").classList.add("d-none");
  document.getElementById("vistaConfig").classList.remove("d-none");

  establecerTexto("puntajeJ1", "0");
  establecerTexto("puntajeJ2", "0");
  establecerTexto("nivelActual", "1");
  mostrarElemento("mensajeGameOver", false);
  mostrarElemento("btnIniciar", true);
  mostrarElemento("btnPausar", false);
  mostrarElemento("btnReiniciar", false);
  actualizarMensajeEstado("Configurá los jugadores e iniciá la partida.", "info");
}

/* ============================================================
   OVERLAYS
   ============================================================ */

function ocultarTodosLosOverlays() {
  ["overlayPausa", "overlayGameOver", "overlayVictoria"].forEach(id => {
    document.getElementById(id)?.classList.add("d-none");
  });
}

function mostrarOverlay(id) {
  ocultarTodosLosOverlays();
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("d-none");
  el.classList.add("overlay-entrando");
  setTimeout(() => el.classList.remove("overlay-entrando"), 300);
}

function mostrarOverlayGameOver(p1, p2, nivel) {
  let texto;
  if (modoActual === "2jugadores") {
    const nJ1 = obtenerValor("inputNombreJ1") || "J1";
    const nJ2 = obtenerValor("inputNombreJ2") || "J2";
    const g = p1 > p2 ? nJ1 : p2 > p1 ? nJ2 : "¡Empate!";
    texto = g === "¡Empate!"
      ? `¡Empate! ${nJ1}: ${p1} | ${nJ2}: ${p2}`
      : `Ganó ${g} — ${Math.max(p1, p2)} pts`;
  } else {
    texto = `Puntaje final: ${p1}`;
  }
  establecerTexto("overlayPuntajeFinal", texto);
  establecerTexto("overlayNivelFinal", `Nivel alcanzado: ${nivel}`);
  mostrarOverlay("overlayGameOver");
}

function mostrarOverlayVictoria(p1, p2, nivel) {
  const texto = modoActual === "2jugadores"
    ? `${obtenerValor("inputNombreJ1")||"J1"}: ${p1} | ${obtenerValor("inputNombreJ2")||"J2"}: ${p2}`
    : `Puntaje: ${p1}`;
  establecerTexto("overlayPuntajeVictoria", texto);
  establecerTexto("overlayNivelVictoria", `Nivel: ${nivel}`);
  mostrarOverlay("overlayVictoria");
}

/* ============================================================
   CONTROLES TÁCTILES
   Reutilizan moverJ1/moverJ2 del juego, igual que el teclado.
   ============================================================ */

const MAPA_TACTIL = {
  arriba:    { dc: 0,  df: -1 },
  abajo:     { dc: 0,  df:  1 },
  izquierda: { dc: -1, df:  0 },
  derecha:   { dc: 1,  df:  0 }
};

function registrarBotonTactil(idBoton, jugador, dir) {
  const btn = document.getElementById(idBoton);
  if (!btn) return;
  const handler = (e) => {
    e.preventDefault();
    if (!juegoActual || !partidaActiva) return;
    const direccion = MAPA_TACTIL[dir];
    if (!direccion) return;
    if (jugador === 1) juegoActual.moverJ1(direccion);
    else if (jugador === 2) juegoActual.moverJ2(direccion);
  };
  btn.addEventListener("mousedown", handler);
  btn.addEventListener("touchstart", handler, { passive: false });
}

function inicializarControlesTactiles() {
  ["Arriba","Abajo","Izquierda","Derecha"].forEach(d => {
    registrarBotonTactil(`j1${d}`, 1, d.toLowerCase());
    registrarBotonTactil(`j2${d}`, 2, d.toLowerCase());
  });
}

/* ============================================================
   MARCADOR EXPANDIDO
   ============================================================ */

function actualizarMarcadorExpandido(p1, p2, v1, v2, nivel) {
  establecerTexto("marcadorPuntajeJ1", p1);
  establecerTexto("marcadorNivel", nivel);
  renderizarVidas("marcadorVidasJ1", v1, VIDAS_MAXIMAS);
  if (modoActual === "2jugadores") {
    establecerTexto("marcadorPuntajeJ2", p2);
    renderizarVidas("marcadorVidasJ2", v2, VIDAS_MAXIMAS);
  }
}

/* ============================================================
   EVENTOS
   ============================================================ */

function inicializarEventos() {

  document.getElementById("selectModo").addEventListener("change", (e) => {
    modoActual = e.target.value;
    const es2J = modoActual === "2jugadores";
    mostrarElemento("contenedorJ2", es2J);
    mostrarElemento("controlesJ2Info", es2J);
    mostrarElemento("bloqueJ2Estado", es2J);
  });

  document.getElementById("inputNombreJ1").addEventListener("blur", (e) => {
    toggleError("errorNombreJ1", !validarNombre(e.target.value.trim()));
  });

  document.getElementById("inputNombreJ2").addEventListener("blur", (e) => {
    if (modoActual !== "2jugadores") return;
    toggleError("errorNombreJ2", !validarNombre(e.target.value.trim()));
  });

  /* ── Función de inicio (reutilizable desde overlays) ── */
  function iniciarJuego() {
    const nombreJ1 = obtenerValor("inputNombreJ1");
    if (!validarNombre(nombreJ1)) {
      toggleError("errorNombreJ1", true);
      actualizarMensajeEstado("Ingresá un nombre válido para el Jugador 1.", "danger");
      return;
    }
    toggleError("errorNombreJ1", false);

    if (modoActual === "2jugadores") {
      const nJ2 = obtenerValor("inputNombreJ2");
      if (!validarNombre(nJ2)) {
        toggleError("errorNombreJ2", true);
        actualizarMensajeEstado("Ingresá un nombre válido para el Jugador 2.", "danger");
        return;
      }
      toggleError("errorNombreJ2", false);
    }

    if (juegoActual) juegoActual.detener();
    ocultarTodosLosOverlays();

    /* Canvas: puede estar en cualquier contenedor; lo referenciamos por ID */
    const canvas = document.getElementById("canvasPacman");

    const nJ1 = obtenerValor("inputNombreJ1") || "Jugador 1";
    const nJ2 = modoActual === "2jugadores"
      ? (obtenerValor("inputNombreJ2") || "Jugador 2") : "Jugador 2";

    establecerTexto("marcadorNombreJ1", nJ1);
    establecerTexto("marcadorNombreJ2", nJ2);
    establecerTexto("tituloControlesJ1", nJ1);
    establecerTexto("tituloControlesJ2", nJ2);
    establecerTexto("labelJ1", nJ1);
    if (modoActual === "2jugadores") establecerTexto("labelJ2", nJ2);

    juegoActual = new JuegoPacman(canvas, {
      modo: modoActual,

      onPuntaje: (p1, p2, v1, v2, nivel) => {
        establecerTexto("puntajeJ1", p1);
        establecerTexto("nivelActual", nivel);
        renderizarVidas("vidasJ1Container", v1, VIDAS_MAXIMAS);
        if (modoActual === "2jugadores") {
          establecerTexto("puntajeJ2", p2);
          renderizarVidas("vidasJ2Container", v2, VIDAS_MAXIMAS);
        }
        actualizarMarcadorExpandido(p1, p2, v1, v2, nivel);
      },

      onFinJuego: async (p1, p2, nivel) => {
        await guardarJugador({
          nombre: obtenerValor("inputNombreJ1"),
          puntaje: p1, modo: modoActual, nivel
        });
        if (modoActual === "2jugadores") {
          await guardarJugador({
            nombre: obtenerValor("inputNombreJ2"),
            puntaje: p2, modo: modoActual, nivel
          });
        }

        mostrarOverlayGameOver(p1, p2, nivel);

        mostrarElemento("btnIniciar", true);
        mostrarElemento("btnPausar", false);
        mostrarElemento("btnReiniciar", true);
        mostrarElemento("btnPausarExpandido", false);
        partidaActiva = false;

        actualizarMensajeEstado("Partida finalizada. ¡Podés volver a jugar!", "warning");
        await cargarYRenderizarJugadores();
      }
    });

    juegoActual.iniciar();
    partidaActiva = true;

    establecerTexto("puntajeJ1", "0");
    establecerTexto("puntajeJ2", "0");
    establecerTexto("nivelActual", "1");
    establecerTexto("marcadorPuntajeJ1", "0");
    establecerTexto("marcadorPuntajeJ2", "0");
    establecerTexto("marcadorNivel", "1");
    renderizarVidas("vidasJ1Container",  VIDAS_MAXIMAS, VIDAS_MAXIMAS);
    renderizarVidas("marcadorVidasJ1",   VIDAS_MAXIMAS, VIDAS_MAXIMAS);
    if (modoActual === "2jugadores") {
      renderizarVidas("vidasJ2Container", VIDAS_MAXIMAS, VIDAS_MAXIMAS);
      renderizarVidas("marcadorVidasJ2",  VIDAS_MAXIMAS, VIDAS_MAXIMAS);
    }

    mostrarElemento("mensajeGameOver", false);
    mostrarElemento("btnIniciar", false);
    mostrarElemento("btnPausar", true);
    mostrarElemento("btnReiniciar", true);
    actualizarMensajeEstado("¡Juego en curso! Usá las flechas para moverte.", "success");

    /* MUEVE el canvas físicamente a la vista expandida */
    activarVistaExpandida();
  }

  document.getElementById("btnIniciar").addEventListener("click", iniciarJuego);

  /* ── PAUSAR / REANUDAR ── */
  const manejarPausa = () => {
    if (!juegoActual) return;
    const pausado = juegoActual.togglePausa();
    const btnP  = document.getElementById("btnPausar");
    const btnPE = document.getElementById("btnPausarExpandido");
    if (pausado) {
      if (btnP)  btnP.innerHTML  = '<i class="bi bi-play-fill me-1"></i>Reanudar';
      if (btnPE) btnPE.innerHTML = '<i class="bi bi-play-fill"></i> Reanudar';
      actualizarMensajeEstado("Juego pausado.", "warning");
      mostrarOverlay("overlayPausa");
    } else {
      if (btnP)  btnP.innerHTML  = '<i class="bi bi-pause-fill me-1"></i>Pausar';
      if (btnPE) btnPE.innerHTML = '<i class="bi bi-pause-fill"></i> Pausar';
      actualizarMensajeEstado("¡Juego en curso!", "success");
      ocultarTodosLosOverlays();
    }
  };
  document.getElementById("btnPausar").addEventListener("click", manejarPausa);
  document.getElementById("btnPausarExpandido").addEventListener("click", manejarPausa);

  /* ── REINICIAR ── */
  const manejarReiniciar = () => {
    if (juegoActual) juegoActual.detener();
    juegoActual   = null;
    partidaActiva = false;
    establecerTexto("puntajeJ1", "0");
    establecerTexto("puntajeJ2", "0");
    establecerTexto("nivelActual", "1");
    mostrarElemento("mensajeGameOver", false);
    mostrarElemento("btnIniciar", true);
    mostrarElemento("btnPausar", false);
    mostrarElemento("btnReiniciar", false);
    actualizarMensajeEstado("Configurá los jugadores e iniciá la partida.", "info");
    volverAConfig();
  };
  document.getElementById("btnReiniciar").addEventListener("click", manejarReiniciar);
  document.getElementById("btnReiniciarExpandido").addEventListener("click", manejarReiniciar);

  /* ── VOLVER A CONFIG ── */
  document.getElementById("btnVolverConfig").addEventListener("click", volverAConfig);

  /* ── OVERLAY PAUSA ── */
  document.getElementById("btnContinuarOverlay").addEventListener("click", () => {
    if (!juegoActual) return;
    const pausado = juegoActual.togglePausa();
    if (!pausado) {
      ocultarTodosLosOverlays();
      const btnPE = document.getElementById("btnPausarExpandido");
      if (btnPE) btnPE.innerHTML = '<i class="bi bi-pause-fill"></i> Pausar';
      actualizarMensajeEstado("¡Juego en curso!", "success");
    }
  });
  document.getElementById("btnReiniciarOverlay").addEventListener("click", manejarReiniciar);
  document.getElementById("btnMenuOverlay").addEventListener("click", volverAConfig);

  /* ── OVERLAY GAME OVER ── */
  document.getElementById("btnJugarOtraVezOverlay").addEventListener("click", () => {
    ocultarTodosLosOverlays();
    volverAConfig();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btnMenuGameOverOverlay").addEventListener("click", volverAConfig);

  /* ── OVERLAY VICTORIA ── */
  document.getElementById("btnJugarOtraVezVictoria").addEventListener("click", () => {
    ocultarTodosLosOverlays();
    volverAConfig();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btnMenuVictoriaOverlay").addEventListener("click", volverAConfig);

  /* ── TECLADO ── */
  document.addEventListener("keydown", (e) => {
    if (!juegoActual || !partidaActiva) return;
    const mapaJ1 = {
      ArrowUp: {dc:0,df:-1}, ArrowDown: {dc:0,df:1},
      ArrowLeft: {dc:-1,df:0}, ArrowRight: {dc:1,df:0}
    };
    const mapaJ2 = {
      w:{dc:0,df:-1}, s:{dc:0,df:1}, a:{dc:-1,df:0}, d:{dc:1,df:0}
    };
    if (mapaJ1[e.key]) { e.preventDefault(); juegoActual.moverJ1(mapaJ1[e.key]); }
    if (modoActual === "2jugadores" && mapaJ2[e.key]) juegoActual.moverJ2(mapaJ2[e.key]);
  });

  /* ── GUARDAR EDICIÓN ── */
  document.getElementById("btnGuardarEdicion").addEventListener("click", async () => {
    const id      = obtenerValor("editarId");
    const nombre  = obtenerValor("editarNombre");
    const puntaje = parseInt(obtenerValor("editarPuntaje"), 10);
    const modo    = document.getElementById("editarModo").value;
    if (!validarNombre(nombre)) {
      actualizarMensajeEstado("El nombre editado no es válido.", "danger");
      return;
    }
    await modificarJugador(id, { nombre, puntaje, modo });
    mostrarElemento("cardEditar", false);
    actualizarMensajeEstado("Jugador actualizado correctamente.", "success");
    await cargarYRenderizarJugadores();
  });

  document.getElementById("btnCancelarEdicion").addEventListener("click", () => {
    mostrarElemento("cardEditar", false);
  });

  /* ── DESCARGAR TXT ── */
  document.getElementById("btnDescargarTxt").addEventListener("click", async () => {
    const jugadores = await obtenerJugadores();
    const lineas = jugadores
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((j, i) =>
        `${i+1}. ${j.nombre} | Puntaje: ${j.puntaje} | Nivel: ${j.nivel} | Modo: ${j.modo} | Fecha: ${j.fecha}`
      ).join("\n");
    descargarTxt(
      `RANKING PAC-MAN\n${"=".repeat(40)}\n${lineas}\n${"=".repeat(40)}\nTotal: ${jugadores.length}`,
      "ranking_pacman.txt"
    );
  });

  /* ── TOGGLE TEMA ── */
  document.getElementById("btnTema").addEventListener("click", toggleTema);

  /* ── CONTROLES TÁCTILES ── */
  inicializarControlesTactiles();
}

/* ============================================================
   INICIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  await cargarYRenderizarJugadores();
  inicializarEventos();
});