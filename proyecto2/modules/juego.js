/**
 * juego.js — Proyecto Pac-Man
 */

/* ─── Constantes de layout ───────────────────────────────────────── */

const CELDA = 21;
const FILAS    = 21;
const COLUMNAS = 20;

const PUERTA_COL  = 9;
const PUERTA_FILA = 8;
const CAJA_CENTRO_COL = 9;

/* ─── Mapa base ──────────────────────────────────────────────────── */

const MAPA_BASE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,3,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,3,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,4,4,4,4,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,4,4,4,4,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,4,4,4,4,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

/* ─── Definición de los 4 fantasmas ──────────────────────────────── */

const DEFINICION_FANTASMAS = [
  {
    nombre:       "Blinky",
    color:        "#ff0000",
    colInicio:    PUERTA_COL,
    filaInicio:   PUERTA_FILA,
    umbralBase:   0,
    saleInmediato: true,
    fueraDeCaja:  true
  },
  {
    nombre:       "Pinky",
    color:        "#ffb8ff",
    colInicio:    CAJA_CENTRO_COL,
    filaInicio:   10,
    umbralBase:   0,
    saleInmediato: true,
    fueraDeCaja:  false
  },
  {
    nombre:       "Inky",
    color:        "#00ffff",
    colInicio:    8,
    filaInicio:   10,
    umbralBase:   30,
    saleInmediato: false,
    fueraDeCaja:  false
  },
  {
    nombre:       "Clyde",
    color:        "#ffb852",
    colInicio:    10,
    filaInicio:   10,
    umbralBase:   60,
    saleInmediato: false,
    fueraDeCaja:  false
  }
];

/* ─── Utilidades generales ────────────────────────────────────────── */

function clonarMapa() {
  return MAPA_BASE.map(fila => [...fila]);
}

function umbralAjustado(umbralBase, nivel) {
  if (umbralBase === 0) return 0;
  return Math.max(1, Math.floor(umbralBase * Math.pow(0.6, nivel - 1)));
}

function esCeldaLibreFantasma(mapa, col, fila) {
  if (fila < 0 || fila >= FILAS || col < 0 || col >= COLUMNAS) return false;
  return mapa[fila][col] !== 1;
}

function esCeldaLibrePacman(mapa, col, fila) {
  if (fila < 0 || fila >= FILAS || col < 0 || col >= COLUMNAS) return false;
  const c = mapa[fila][col];
  return c !== 1 && c !== 4;
}

/* ─── Pac-Man ─────────────────────────────────────────────────────── */

function crearPacman(col, fila, color) {
  return {
    col,
    fila,
    direccion:        { dc: 0,  df: 0 },
    proximaDireccion: { dc: 1,  df: 0 },
    color,
    vidas:            3,
    puntaje:          0,
    poderActivo:      false,
    tiempoPoder:      0,
    vivo:             true,
    anguloApertura:   0,
    abriendoBoca:     true,
    colRespawn:       col,
    filaRespawn:      fila
  };
}

/* ─── Fantasma ────────────────────────────────────────────────────── */

function crearFantasma(def) {
  return {
    nombre:         def.nombre,
    color:          def.color,
    colorOriginal:  def.color,
    col:            def.colInicio,
    fila:           def.filaInicio,
    direccion:      { dc: 0, df: 0 },
    fueraDeCaja:    def.fueraDeCaja,
    estadoSalida:   def.fueraDeCaja ? 'libre' : 'esperando',
    umbralPuntos:   def.umbralBase,
    saleInmediato:  def.saleInmediato,
    ticksMovimiento: 0,
    asustado:       false,
    tiempoAsustado: 0,
    dirProhibida:   { dc: 0, df: 0 }
  };
}

/* ─── Clase principal ─────────────────────────────────────────────── */

export class JuegoPacman {

  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.config = config;

    this.mapa             = clonarMapa();
    this.nivel            = 1;
    this.intervalo        = null;
    this.pausado          = false;
    this.tick             = 0;

    this.puntosComidos    = 0;
    this.ticksSinComer    = 0;
    this.TIMER_INACTIVIDAD = 40;

    this.totalPuntos      = this._contarPuntos();
    this.puntosRestantes  = this.totalPuntos;

    this.pacman1 = crearPacman(10, 16, '#FFD700');
    this.pacman2 = config.modo === '2jugadores'
      ? crearPacman(9, 16, '#FF69B4')
      : null;

    this.fantasmas = DEFINICION_FANTASMAS.map(def => crearFantasma(def));

    this._ajustarUmbrales();
    this._iniciarSalidaInmediata();
  }

  /* ── Inicialización ──────────────────────────────────────────────── */

  _ajustarUmbrales() {
    for (const f of this.fantasmas) {
      const def = DEFINICION_FANTASMAS.find(d => d.nombre === f.nombre);
      f.umbralPuntos = umbralAjustado(def.umbralBase, this.nivel);
    }
  }

  _iniciarSalidaInmediata() {
    for (const f of this.fantasmas) {
      if (f.saleInmediato && !f.fueraDeCaja) {
        f.estadoSalida = 'centrando';
      }
    }
  }

  _contarPuntos() {
    let total = 0;
    for (const fila of MAPA_BASE) {
      for (const celda of fila) {
        if (celda === 0 || celda === 3) total++;
      }
    }
    return total;
  }

  /* ── Control del bucle ───────────────────────────────────────────── */

  iniciar() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.intervalo = setInterval(() => this.actualizar(), 100);
  }

  togglePausa() {
    if (this.pausado) {
      this.intervalo = setInterval(() => this.actualizar(), 100);
      this.pausado   = false;
    } else {
      clearInterval(this.intervalo);
      this.pausado = true;
    }
    return this.pausado;
  }

  detener() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  /* ── Dirección deseada de los Pac-Men ────────────────────────────── */

  moverJ1(dir) { this.pacman1.proximaDireccion = dir; }
  moverJ2(dir) { if (this.pacman2) this.pacman2.proximaDireccion = dir; }

  /* ── Ciclo principal ─────────────────────────────────────────────── */

  actualizar() {
    this.tick++;
    this.ticksSinComer++;

    if (this.tick % 2 === 0) {
      this._moverPacman(this.pacman1);
      if (this.pacman2) this._moverPacman(this.pacman2);
    }

    this._procesarFantasmas();
    this._verificarTimerInactividad();
    this._detectarColisiones();

    this.config.onPuntaje(
      this.pacman1.puntaje,
      this.pacman2 ? this.pacman2.puntaje : 0,
      this.pacman1.vidas,
      this.pacman2 ? this.pacman2.vidas : 0,
      this.nivel
    );

    const pm1Muerto = !this.pacman1.vivo;
    const pm2Muerto = this.pacman2 ? !this.pacman2.vivo : true;
    const juegoTerminado = this.pacman2
      ? (pm1Muerto && pm2Muerto)
      : pm1Muerto;

    if (juegoTerminado) {
      this.detener();
      this.renderizar();
      this.config.onFinJuego(
        this.pacman1.puntaje,
        this.pacman2 ? this.pacman2.puntaje : 0,
        this.nivel
      );
      return;
    }

    if (this.puntosRestantes <= 0) this._avanzarNivel();

    this.renderizar();
  }

  /* ── Pac-Man: movimiento y consumo de puntos ─────────────────────── */

  _moverPacman(pm) {
    if (!pm.vivo) return;

    const { dc, df } = pm.proximaDireccion;
    if (esCeldaLibrePacman(this.mapa, pm.col + dc, pm.fila + df)) {
      pm.direccion = { ...pm.proximaDireccion };
    }

    const nc = pm.col + pm.direccion.dc;
    const nf = pm.fila + pm.direccion.df;

    if (esCeldaLibrePacman(this.mapa, nc, nf)) {
      pm.col = nc;
      pm.fila = nf;

      if (pm.col < 0)         pm.col = COLUMNAS - 1;
      if (pm.col >= COLUMNAS) pm.col = 0;
    }

    const celda = this.mapa[pm.fila][pm.col];
    if (celda === 0) {
      pm.puntaje += 10;
      this.mapa[pm.fila][pm.col] = 2;
      this.puntosRestantes--;
      this.puntosComidos++;
      this.ticksSinComer = 0;
      this._verificarUmbralesFantasmas();
    } else if (celda === 3) {
      pm.puntaje += 50;
      this.mapa[pm.fila][pm.col] = 2;
      this.puntosRestantes--;
      this.puntosComidos++;
      this.ticksSinComer = 0;
      this._activarPoder(pm);
      this._verificarUmbralesFantasmas();
    }

    /* Animación de la boca */
    if (pm.abriendoBoca) {
      pm.anguloApertura += 0.15;
      if (pm.anguloApertura >= 0.35) pm.abriendoBoca = false;
    } else {
      pm.anguloApertura -= 0.15;
      if (pm.anguloApertura <= 0) pm.abriendoBoca = true;
    }

    /* Decrementar poder — aquí es el único lugar que lo gestiona */
    if (pm.poderActivo) {
      pm.tiempoPoder--;
      if (pm.tiempoPoder <= 0) {
        pm.poderActivo = false;
        this._desactivarAsustar();
      }
    }
  }

  /* ── Poder ───────────────────────────────────────────────────────── */

  /**
   * Activa el poder de Pac-Man y austa a todos los fantasmas libres.
   * El tiempoAsustado de cada fantasma se sincroniza exactamente
   * con el tiempoPoder del Pac-Man para evitar desincronizaciones.
   */
  _activarPoder(pm) {
    pm.poderActivo  = true;
    pm.tiempoPoder  = 50;

    for (const f of this.fantasmas) {
      if (f.estadoSalida === 'libre') {
        f.asustado       = true;
        f.color          = '#2222ff';
        /* Sincronizar con el contador del Pac-Man */
        f.tiempoAsustado = pm.tiempoPoder;
        /* Resetear dirección prohibida para que recalcule ruta huyendo */
        f.dirProhibida   = { dc: 0, df: 0 };
        f.ticksMovimiento = 0;
      }
    }
  }

  /**
   * Desactiva el estado asustado de TODOS los fantasmas.
   * Resetea dirProhibida y ticksMovimiento para que retomen
   * la persecución desde el primer tick sin comportamiento residual.
   */
  _desactivarAsustar() {
    for (const f of this.fantasmas) {
      if (f.asustado) {
        f.asustado        = false;
        f.color           = f.colorOriginal;
        f.tiempoAsustado  = 0;
        /* Crítico: resetear para evitar que queden atrapados en esquinas */
        f.dirProhibida    = { dc: 0, df: 0 };
        f.ticksMovimiento = 0;
      }
    }
  }

  /* ── Umbrales y timer de inactividad ─────────────────────────────── */

  _verificarUmbralesFantasmas() {
    for (const f of this.fantasmas) {
      if (
        f.estadoSalida === 'esperando' &&
        this.puntosComidos >= f.umbralPuntos
      ) {
        f.estadoSalida = 'centrando';
      }
    }
  }

  _verificarTimerInactividad() {
    if (this.ticksSinComer < this.TIMER_INACTIVIDAD) return;

    const siguiente = this.fantasmas.find(f => f.estadoSalida === 'esperando');
    if (siguiente) {
      siguiente.estadoSalida = 'centrando';
    }
    this.ticksSinComer = 0;
  }

  /* ── Animación de salida de la caja ──────────────────────────────── */

  _procesarSalidaCaja(f) {
    if (f.estadoSalida === 'centrando') {
      if (f.col < CAJA_CENTRO_COL) {
        f.col++;
        f.direccion = { dc: 1, df: 0 };
      } else if (f.col > CAJA_CENTRO_COL) {
        f.col--;
        f.direccion = { dc: -1, df: 0 };
      } else {
        f.estadoSalida = 'subiendo';
        f.direccion    = { dc: 0, df: -1 };
      }
      return;
    }

    if (f.estadoSalida === 'subiendo') {
      if (f.fila > PUERTA_FILA) {
        f.fila--;
        f.direccion = { dc: 0, df: -1 };
      } else {
        f.estadoSalida  = 'libre';
        f.fueraDeCaja   = true;
        f.direccion     = { dc: -1, df: 0 };
        f.dirProhibida  = { dc: 1,  df: 0 };
        f.ticksMovimiento = 0;
      }
    }
  }

  /* ── Movimiento de fantasmas libres ──────────────────────────────── */

  /**
   * Mueve un fantasma libre usando IA de persecución/huida.
   * NOTA: el tiempoAsustado ya NO se decrementa aquí.
   * Lo gestiona exclusivamente _moverPacman → _desactivarAsustar.
   * Esto evita la desincronización que dejaba a los fantasmas
   * escapando o quietos en esquinas después del poder.
   */
  _moverFantasmaLibre(f, indice) {
    f.ticksMovimiento++;

    const intervalo = f.asustado ? 3 : Math.max(1, 3 - Math.floor(this.nivel / 3));
    if (f.ticksMovimiento < intervalo) return;
    f.ticksMovimiento = 0;

    const direcciones = [
      { dc:  1, df:  0 },
      { dc: -1, df:  0 },
      { dc:  0, df:  1 },
      { dc:  0, df: -1 }
    ];

    /* Objetivo: perseguir al Pac-Man más cercano (o alejarse si asustado) */
    let objetivo = this.pacman1;
    if (this.pacman2 && this.pacman2.vivo) {
      const d1 = Math.abs(f.col - this.pacman1.col) + Math.abs(f.fila - this.pacman1.fila);
      const d2 = Math.abs(f.col - this.pacman2.col) + Math.abs(f.fila - this.pacman2.fila);
      if (d2 < d1) objetivo = this.pacman2;
    }

    /* Ordenar direcciones por distancia al objetivo */
    const dirOrdenadas = [...direcciones].sort((a, b) => {
      const distA = Math.abs(f.col + a.dc - objetivo.col) + Math.abs(f.fila + a.df - objetivo.fila);
      const distB = Math.abs(f.col + b.dc - objetivo.col) + Math.abs(f.fila + b.df - objetivo.fila);
      return f.asustado ? distB - distA : distA - distB;
    });

    /* Elegir la primera dirección válida */
    for (const dir of dirOrdenadas) {
      const nc = f.col + dir.dc;
      const nf = f.fila + dir.df;

      if (dir.dc === f.dirProhibida.dc && dir.df === f.dirProhibida.df) continue;
      if (!esCeldaLibreFantasma(this.mapa, nc, nf)) continue;

      const ocupadaPorOtro = this.fantasmas.some((otro, i) => {
        if (i === indice) return false;
        if (otro.estadoSalida !== 'libre') return false;
        return otro.col === nc && otro.fila === nf;
      });
      if (ocupadaPorOtro) continue;

      f.col          = nc;
      f.fila         = nf;
      f.dirProhibida = { dc: -dir.dc, df: -dir.df };
      f.direccion    = dir;
      break;
    }

    /*
     * Si el fantasma quedó completamente bloqueado (ninguna dirección válida),
     * liberamos la dirección prohibida para que pueda escapar.
     * Esto resuelve el bug de fantasmas pegados en esquinas.
     */
    const puedeMover = direcciones.some(dir => {
      if (dir.dc === f.dirProhibida.dc && dir.df === f.dirProhibida.df) return false;
      return esCeldaLibreFantasma(this.mapa, f.col + dir.dc, f.fila + dir.df);
    });
    if (!puedeMover) {
      f.dirProhibida = { dc: 0, df: 0 };
    }
  }

  /* ── Orquestador de fantasmas ─────────────────────────────────────── */

  _procesarFantasmas() {
    this.fantasmas.forEach((f, indice) => {
      if (f.estadoSalida === 'libre') {
        this._moverFantasmaLibre(f, indice);
      } else if (
        f.estadoSalida === 'centrando' ||
        f.estadoSalida === 'subiendo'
      ) {
        if (this.tick % 2 === 0) {
          this._procesarSalidaCaja(f);
        }
      }
    });
  }

  /* ── Colisiones Pac-Man ↔ Fantasmas ──────────────────────────────── */

  _detectarColisiones() {
    const pacmans = this.pacman2
      ? [this.pacman1, this.pacman2]
      : [this.pacman1];

    for (const pm of pacmans) {
      if (!pm.vivo) continue;

      for (let i = 0; i < this.fantasmas.length; i++) {
        const f = this.fantasmas[i];

        if (f.estadoSalida !== 'libre') continue;

        if (f.col === pm.col && f.fila === pm.fila) {
          if (pm.poderActivo && f.asustado) {
            pm.puntaje += 200;
            this._regresarFantasmaCaja(i);
          } else if (!f.asustado) {
            /* Solo daña si el fantasma NO está asustado */
            pm.vidas--;
            if (pm.vidas <= 0) {
              pm.vivo = false;
            } else {
              pm.col  = pm.colRespawn;
              pm.fila = pm.filaRespawn;
              pm.direccion        = { dc: 0, df: 0 };
              pm.proximaDireccion = { dc: 1, df: 0 };
            }
          }
        }
      }
    }
  }

  /**
   * Regresa un fantasma comido a la caja.
   * Al volver, retoma la animación de salida (estado 'centrando')
   * y se garantiza que no queda en estado asustado ni con
   * dirección prohibida residual.
   */
  _regresarFantasmaCaja(indice) {
    const def = DEFINICION_FANTASMAS[indice];
    const f   = this.fantasmas[indice];

    f.col           = def.colInicio === PUERTA_COL ? CAJA_CENTRO_COL : def.colInicio;
    f.fila          = def.filaInicio === PUERTA_FILA ? 10 : def.filaInicio;
    f.asustado      = false;
    f.color         = f.colorOriginal;
    f.tiempoAsustado = 0;
    f.fueraDeCaja   = false;
    f.estadoSalida  = 'centrando';
    f.direccion     = { dc: 0, df: 0 };
    f.dirProhibida  = { dc: 0, df: 0 };
    f.ticksMovimiento = 0;
  }

  /* ── Avanzar de nivel ─────────────────────────────────────────────── */

  _avanzarNivel() {
    this.nivel++;
    this.mapa           = clonarMapa();
    this.puntosRestantes = this._contarPuntos();
    this.puntosComidos  = 0;
    this.ticksSinComer  = 0;

    this.pacman1.col  = this.pacman1.colRespawn;
    this.pacman1.fila = this.pacman1.filaRespawn;
    this.pacman1.direccion        = { dc: 0, df: 0 };
    this.pacman1.proximaDireccion = { dc: 1, df: 0 };
    this.pacman1.poderActivo      = false;
    this.pacman1.tiempoPoder      = 0;

    if (this.pacman2) {
      this.pacman2.col  = this.pacman2.colRespawn;
      this.pacman2.fila = this.pacman2.filaRespawn;
      this.pacman2.direccion        = { dc: 0, df: 0 };
      this.pacman2.proximaDireccion = { dc: 1, df: 0 };
      this.pacman2.poderActivo      = false;
      this.pacman2.tiempoPoder      = 0;
    }

    this.fantasmas = DEFINICION_FANTASMAS.map(def => crearFantasma(def));
    this._ajustarUmbrales();
    this._iniciarSalidaInmediata();
  }

  /* ── Renderizado ──────────────────────────────────────────────────── */

  renderizar() {
    const ctx   = this.ctx;
    const ancho = this.canvas.width;
    const alto  = this.canvas.height;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ancho, alto);

    for (let f = 0; f < FILAS; f++) {
      for (let c = 0; c < COLUMNAS; c++) {
        const celda = this.mapa[f][c];
        const x     = c * CELDA;
        const y     = f * CELDA;

        if (celda === 1) {
          ctx.fillStyle   = '#1a1aff';
          ctx.fillRect(x, y, CELDA, CELDA);
          ctx.strokeStyle = '#0000aa';
          ctx.lineWidth   = 1;
          ctx.strokeRect(x + 1, y + 1, CELDA - 2, CELDA - 2);

        } else if (celda === 0) {
          ctx.fillStyle = '#ffddaa';
          ctx.beginPath();
          ctx.arc(x + CELDA / 2, y + CELDA / 2, 2, 0, Math.PI * 2);
          ctx.fill();

        } else if (celda === 3) {
          if (Math.floor(this.tick / 5) % 2 === 0) {
            ctx.fillStyle    = '#ffffff';
            ctx.shadowColor  = '#ffffff';
            ctx.shadowBlur   = 8;
            ctx.beginPath();
            ctx.arc(x + CELDA / 2, y + CELDA / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    this.fantasmas.forEach(f => this._dibujarFantasma(ctx, f));

    this._dibujarPacman(ctx, this.pacman1);
    if (this.pacman2) this._dibujarPacman(ctx, this.pacman2);
  }

  /* ── Dibujo de personajes ─────────────────────────────────────────── */

  _dibujarPacman(ctx, pm) {
    if (!pm.vivo) return;

    const x     = pm.col * CELDA + CELDA / 2;
    const y     = pm.fila * CELDA + CELDA / 2;
    const radio = CELDA / 2 - 1;

    let angBase = 0;
    if      (pm.direccion.dc === -1) angBase = Math.PI;
    else if (pm.direccion.df ===  1) angBase = Math.PI / 2;
    else if (pm.direccion.df === -1) angBase = -Math.PI / 2;

    const ap = pm.anguloApertura;

    ctx.fillStyle   = pm.color;
    ctx.shadowColor = pm.color;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radio, angBase + ap, angBase + Math.PI * 2 - ap);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _dibujarFantasma(ctx, f) {
    const x     = f.col  * CELDA;
    const y     = f.fila * CELDA;
    const radio = CELDA / 2 - 1;

    let colorRelleno;
    if (f.asustado) {
      const parpadeando = f.tiempoAsustado < 15 && Math.floor(this.tick / 3) % 2 === 0;
      colorRelleno = parpadeando ? '#ffffff' : '#2222ff';
    } else {
      colorRelleno = f.color;
    }

    ctx.globalAlpha = (f.estadoSalida === 'libre') ? 1.0 : 0.6;

    ctx.fillStyle   = colorRelleno;
    ctx.shadowColor = colorRelleno;
    ctx.shadowBlur  = 5;

    ctx.beginPath();
    ctx.arc(x + CELDA / 2, y + radio + 1, radio, Math.PI, 0);
    ctx.lineTo(x + CELDA - 1, y + CELDA - 3);

    const numOndas  = 3;
    const anchoOnda = (CELDA - 2) / numOndas;
    for (let i = numOndas; i >= 0; i--) {
      const xBase = x + 1 + i * anchoOnda - anchoOnda / 2;
      ctx.arc(xBase, y + CELDA - 3, anchoOnda / 2, 0, Math.PI, i % 2 === 0);
    }
    ctx.lineTo(x + 1, y + radio + 1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (!f.asustado) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + CELDA / 2 - 4, y + radio, 3, 0, Math.PI * 2);
      ctx.arc(x + CELDA / 2 + 4, y + radio, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000088';
      ctx.beginPath();
      ctx.arc(x + CELDA / 2 - 3, y + radio, 1.5, 0, Math.PI * 2);
      ctx.arc(x + CELDA / 2 + 5, y + radio, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + CELDA / 2 - 3, y + radio, 2, 0, Math.PI * 2);
      ctx.arc(x + CELDA / 2 + 3, y + radio, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1.0;
  }
}