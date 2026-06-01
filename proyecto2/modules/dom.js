/**
 * dom.js — Proyecto Pac-Man
 * Funciones reutilizables de manipulación del DOM.
 * No contiene lógica de negocio.
 */

/**
 * Muestra u oculta un elemento por ID.
 * @param {string} id
 * @param {boolean} visible
 */
export function mostrarElemento(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  visible ? el.classList.remove("d-none") : el.classList.add("d-none");
}

/**
 * Establece el texto de un elemento.
 * @param {string} id
 * @param {string} texto
 */
export function establecerTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

/**
 * Obtiene y limpia el valor de un input.
 * @param {string} id
 * @returns {string}
 */
export function obtenerValor(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/**
 * Establece el valor de un input.
 * @param {string} id
 * @param {string|number} valor
 */
export function establecerValor(id, valor) {
  const el = document.getElementById(id);
  if (el) el.value = valor;
}

/**
 * Muestra u oculta un mensaje de error.
 * @param {string} idError
 * @param {boolean} mostrar
 */
export function toggleError(idError, mostrar) {
  const el = document.getElementById(idError);
  if (!el) return;
  mostrar ? el.classList.remove("d-none") : el.classList.add("d-none");
}

/**
 * Actualiza el mensaje de estado del juego.
 * @param {string} mensaje
 * @param {string} tipo - Clase Bootstrap alert
 */
export function actualizarMensajeEstado(mensaje, tipo = "info") {
  const el = document.getElementById("mensajeEstado");
  if (!el) return;
  el.className = `alert alert-${tipo} w-100 text-center mb-2`;
  el.textContent = mensaje;
}

/**
 * Renderiza los íconos de vidas de un jugador.
 * Muestra corazones llenos o vacíos según las vidas restantes.
 * @param {string} idContenedor - ID del div contenedor
 * @param {number} vidasActuales - Vidas restantes
 * @param {number} vidasMaximas - Total de vidas
 */
export function renderizarVidas(idContenedor, vidasActuales, vidasMaximas) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.innerHTML = "";

  for (let i = 0; i < vidasMaximas; i++) {
    const icono = document.createElement("i");
    icono.className = `bi bi-heart-fill vida-icono${i >= vidasActuales ? " perdida" : ""}`;
    contenedor.appendChild(icono);
  }
}

/**
 * Renderiza la lista de jugadores con acciones de editar y eliminar.
 * @param {Array} jugadores
 * @param {Function} onEditar
 * @param {Function} onEliminar
 */
export function renderizarListaJugadores(jugadores, onEditar, onEliminar) {
  const lista = document.getElementById("listaJugadores");
  const sinJugadores = document.getElementById("mensajeSinJugadores");
  const contador = document.getElementById("contadorJugadores");

  if (!lista) return;
  lista.innerHTML = "";
  if (contador) contador.textContent = jugadores.length;

  if (jugadores.length === 0) {
    if (sinJugadores) sinJugadores.classList.remove("d-none");
    return;
  }

  if (sinJugadores) sinJugadores.classList.add("d-none");

  const ordenados = [...jugadores].sort((a, b) => b.puntaje - a.puntaje);

  ordenados.forEach((jugador, idx) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-start py-2 px-2";
    li.dataset.id = jugador.id;

    li.innerHTML = `
      <div>
        <span class="fw-semibold">${idx + 1}. ${jugador.nombre}</span><br/>
        <small class="text-muted">
          Puntaje: <strong>${jugador.puntaje}</strong> |
          Nivel: ${jugador.nivel} | Modo: ${jugador.modo} | ${jugador.fecha}
        </small>
      </div>
      <div class="d-flex gap-1 ms-2">
        <button class="btn btn-outline-primary btn-sm btnEditar" data-id="${jugador.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm btnEliminar" data-id="${jugador.id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    li.querySelector(".btnEditar").addEventListener("click", () => onEditar(jugador));
    li.querySelector(".btnEliminar").addEventListener("click", () => onEliminar(jugador.id));
    lista.appendChild(li);
  });
}

/**
 * Descarga contenido como archivo .txt en el navegador.
 * Usa Blob + URL.createObjectURL() + elemento <a> dinámico.
 * @param {string} contenido
 * @param {string} nombreArchivo
 */
export function descargarTxt(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}