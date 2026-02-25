/**
 * meActivityIndicator
 *
 * Componente de notificaciones tipo "Dynamic Island" para la web.
 * Muestra indicadores de actividad animados con soporte para colas con prioridad,
 * agrupacion inteligente, temas (dark/light/system), barras de progreso,
 * botones de accion y animaciones basadas en simulacion de muelles (spring physics).
 *
 * @author  Marcos Esperon
 * @url     https://github.com/marcosesperon
 * @donate  https://buymeacoffee.com/marcosesperon
 * @license MIT
 * @version 2.0.0
 */

class meActivityIndicator {

  // ──────────────────────────────────────────────
  //  CONFIGURACION Y CONSTRUCTOR
  // ──────────────────────────────────────────────

  /**
   * Crea una nueva instancia del indicador de actividad.
   * Inicializa las propiedades, inyecta los estilos CSS, construye el DOM
   * y arranca el bucle de animacion.
   *
   * @param {Object} [options={}] - Opciones de configuracion.
   * @param {string} [options.position='top-center'] - Posicion en pantalla
   *   ('top-left'|'top-center'|'top-right'|'center'|'bottom-left'|'bottom-center'|'bottom-right').
   * @param {string} [options.theme='dark'] - Tema visual ('dark'|'light'|'system').
   */
  constructor(options = {}) {
    // Dimensiones minimas y maximas de la isla
    this.minWidth = 52; this.minHeight = 52; this.maxWidth = 420;

    // Configuracion del muelle (spring) para las animaciones elasticas
    this.springCfg = { stiffness: 0.15, damping: 0.82, mass: 1, dt: 1 };

    // Posicion y tema
    this.position = options.position || 'top-center';
    this.theme = options.theme || 'dark';
    this.activeThemeName = 'dark';
    this.stackStyle = options.stackStyle || '3d'; // '3d', 'fan', 'counter'
    this.islandWidth = options.islandWidth || 'normal'; // 'compact', 'normal', 'wide' o valor CSS
    this.autoConfetti = options.autoConfetti || false;

    // Mapa de prioridades: las actividades de mayor valor se muestran primero
    this.priorityMap = { 'low': 0, 'normal': 1, 'high': 2 };

    // Animacion por defecto segun tipo de actividad
    this.defaultAnimations = {
      success: 'pulse', error: 'shake', info: 'glow',
      warning: 'bounce', thinking: 'breathe',
      loading: null, generic: null
    };

    // Colores resueltos por tipo (para morphing suave con transiciones CSS)
    this.typeColors = {
      success: '#22c55e', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b'
    };

    // Lista de todas las clases de animacion (para limpieza en batch)
    this.allAnimClasses = [
      'anim-shake', 'anim-pulse', 'anim-bounce', 'anim-glow', 'anim-breathe',
      'anim-heartbeat', 'anim-wobble', 'anim-ripple', 'anim-swing'
    ];
    this.allExitClasses = ['exit-fade', 'exit-slide-down', 'exit-slide-up', 'exit-shrink-bounce'];

    // Iconos SVG integrados para los distintos tipos de actividad
    this.icons = {
      success: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      info: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="12" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      warning: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      upload: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
      download: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
      loading: `<svg aria-hidden="true" class="is-spinning" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.21-8.56"></path></svg>`,
      thinking: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4.16Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4.16Z"></path></svg>`,
      speaking: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
      listening: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
      typingDots: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle class="me-ai-dot" cx="6" cy="12" r="2.5" fill="currentColor" stroke="none"></circle><circle class="me-ai-dot" cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle><circle class="me-ai-dot" cx="18" cy="12" r="2.5" fill="currentColor" stroke="none"></circle></svg>`,
      progressOrbit: `<svg aria-hidden="true" viewBox="0 0 24 24"><g class="me-ai-orbit-group"><circle cx="12" cy="3" r="2" fill="currentColor" stroke="none" opacity="1"></circle><circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" opacity="0.6" transform="rotate(120 12 12)"></circle><circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" opacity="0.3" transform="rotate(240 12 12)"></circle></g></svg>`
    };

    // Cola de actividades y estado
    this.activities = [];
    this.activeId = null;
    this.timers = new Map();
    this.timerMeta = new Map();
    this.resolvers = new Map();
    this.isPaused = false;

    // Estado de animacion: dimensiones actuales, objetivo y velocidades
    this.width = this.minWidth; this.height = this.minHeight;
    this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;
    this.vw = 0; this.vh = 0;

    // Flags de visibilidad
    this.isVisible = false;
    this.isClosing = false;
    this.stackCount = 0;

    // Inicializacion
    this._injectStyles();
    this._createDOM();
    this._initThemeListener();
    this.setPosition(this.position);
    this.setTheme(this.theme);
    this._startLoop();
  }

  // ──────────────────────────────────────────────
  //  INYECCION DE ESTILOS CSS
  // ──────────────────────────────────────────────

  /**
   * Inyecta el bloque de estilos CSS del componente en el <head> del documento.
   * Solo se ejecuta una vez: si el <style> ya existe, no lo duplica.
   * Incluye variables CSS para temas, layout de la isla, capas de stack,
   * contenido, barra de progreso, botones de accion y animaciones.
   *
   * @private
   */
  _injectStyles() {
    if (document.getElementById('me-activity-indicator-styles')) return;
    const style = document.createElement('style');
    style.id = 'me-activity-indicator-styles';
    style.textContent = `
      /* OVERLAY BLOQUEANTE - Capa semitransparente que impide interaccion con el fondo */
      #me-ai-blocking-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.05);
        z-index: 9998;
        display: none;
        pointer-events: auto;
      }
      #me-ai-blocking-overlay.is-active {
        display: block;
      }

      /* Variables para Tema Oscuro */
      .me-ai-theme-dark {
        --me-ai-island-bg: rgba(0, 0, 0, 0.9);
        --me-ai-island-border: rgba(255, 255, 255, 0.15);
        --me-ai-text-main: #ffffff;
        --me-ai-text-sub: rgba(255, 255, 255, 0.7);
        --me-ai-btn-bg: rgba(255, 255, 255, 0.1);
        --me-ai-btn-hover: rgba(255, 255, 255, 0.2);
        --me-ai-color-generic: var(--me-ai-color-generic-dark);
        --me-ai-accent: var(--me-ai-color-generic);
        --me-ai-accent-contrast: #000000;
      }

      /* Variables para Tema Claro */
      .me-ai-theme-light {
        --me-ai-island-bg: rgba(255, 255, 255, 0.8);
        --me-ai-island-border: rgba(0, 0, 0, 0.1);
        --me-ai-text-main: #1d1d1f;
        --me-ai-text-sub: rgba(0, 0, 0, 0.6);
        --me-ai-btn-bg: rgba(0, 0, 0, 0.05);
        --me-ai-btn-hover: rgba(0, 0, 0, 0.1);
        --me-ai-color-generic: var(--me-ai-color-generic-light);
        --me-ai-accent: #3b82f6;
        --me-ai-accent-contrast: #ffffff;
      }

      /* ROOT CONTAINER - Contenedor principal fijo en pantalla */
      #me-ai-island-root {
        --me-ai-island-blur: 18px;
        --me-ai-island-radius: 18px;

        /* Colores semanticos de estado */
        --me-ai-color-generic-dark: #ffffff;
        --me-ai-color-generic-light: #1d1d1f;
        --me-ai-color-success: #22c55e;
        --me-ai-color-error: #ef4444;
        --me-ai-color-info: #3b82f6;
        --me-ai-color-warning: #f59e0b;

        position: fixed;
        z-index: 9999;
        perspective: 1000px;
        display: flex;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Posiciones predefinidas */
      #me-ai-island-root.top-left { top: 24px; left: 24px; justify-content: flex-start; }
      #me-ai-island-root.top-center { top: 24px; left: 50%; transform: translateX(-50%); justify-content: center; }
      #me-ai-island-root.top-right { top: 24px; right: 24px; justify-content: flex-end; }
      #me-ai-island-root.center { top: 50%; left: 50%; transform: translate(-50%, -50%); justify-content: center; }
      #me-ai-island-root.bottom-left { bottom: 24px; left: 24px; justify-content: flex-start; }
      #me-ai-island-root.bottom-center { bottom: 24px; left: 50%; transform: translateX(-50%); justify-content: center; }
      #me-ai-island-root.bottom-right { bottom: 24px; right: 24px; justify-content: flex-end; }

      /* STACK LAYERS - Capas apiladas detras de la isla que indican elementos en cola */
      .me-ai-stack-container { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100%; height: 100%; pointer-events: none; }
      .me-ai-stack-layer {
        position: absolute; top: 0; left: 50%; background: var(--me-ai-island-bg);
        backdrop-filter: blur(var(--me-ai-island-blur)); transform: translateX(-50%);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; z-index: -1; border: 1px solid var(--me-ai-island-border);
      }

      .me-ai-stack-badge {
        position: absolute; top: -8px; right: -8px; background: var(--me-ai-accent);
        color: var(--me-ai-accent-contrast); padding: 2px 6px; border-radius: 10px;
        font-size: 10px; font-weight: 800; opacity: 0; transform: scale(0.5);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 20;
      }
      .me-ai-stack-badge.is-visible { opacity: 1; transform: scale(1); }

      /* MAIN ISLAND BUBBLE - Burbuja principal de la isla */
      .me-ai-island {
        position: relative;
        overflow: hidden;
        pointer-events: auto;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        transform: scale(0);
        opacity: 0;
        z-index: 10;
        outline: none;
      }

      .me-ai-island:focus-visible {
        box-shadow: 0 0 0 3px var(--me-ai-accent);
      }

      .me-ai-island.is-visible {
        transform: scale(1);
        opacity: 1;
      }

      .me-ai-island.is-clickable { cursor: pointer; }
      .me-ai-island.is-clickable:active { transform: scale(0.95); }

      /* ANIMACIONES DE ISLA ─────────────────────────── */

      /* Shake: vibracion lateral agresiva (error) */
      @keyframes me-ai-shake {
        0%, 100% { transform: scale(1) translateX(0); }
        10% { transform: scale(1.04) translateX(-8px); }
        30% { transform: scale(1.04) translateX(8px); }
        50% { transform: scale(1.02) translateX(-6px); }
        70% { transform: scale(1.02) translateX(6px); }
        90% { transform: scale(1.01) translateX(-2px); }
      }
      .anim-shake { animation: me-ai-shake 0.2s ease-in-out 3; }

      /* Pulse: escala suave (exito) */
      @keyframes me-ai-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .anim-pulse { animation: me-ai-pulse 0.4s ease-in-out; }

      /* Bounce: rebote vertical (warning) */
      @keyframes me-ai-bounce {
        0%, 100% { transform: scale(1) translateY(0); }
        30% { transform: scale(1) translateY(-8px); }
        50% { transform: scale(1) translateY(0); }
        70% { transform: scale(1) translateY(-3px); }
      }
      .anim-bounce { animation: me-ai-bounce 0.5s ease-in-out; }

      /* Glow: resplandor pulsante del borde (info) */
      @keyframes me-ai-glow {
        0%, 100% { box-shadow: 0 0 0 0 var(--me-ai-accent); }
        50% { box-shadow: 0 0 16px 4px var(--me-ai-accent); }
      }
      .anim-glow { animation: me-ai-glow 0.8s ease-in-out 2; }

      /* Breathe: respiracion lenta con opacidad (thinking) */
      @keyframes me-ai-breathe {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.03); opacity: 0.85; }
      }
      .anim-breathe { animation: me-ai-breathe 2s ease-in-out infinite; }

      /* Heartbeat: doble pulso agresivo (urgente) */
      @keyframes me-ai-heartbeat {
        0%, 100% { transform: scale(1); }
        12% { transform: scale(1.18); }
        24% { transform: scale(0.95); }
        36% { transform: scale(1.14); }
        48% { transform: scale(1); }
      }
      .anim-heartbeat { animation: me-ai-heartbeat 0.6s ease-in-out 2; }

      /* Wobble: deformacion elastica pronunciada tipo gelatina */
      @keyframes me-ai-wobble {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        15% { transform: scaleX(1.12) scaleY(0.88); }
        30% { transform: scaleX(0.88) scaleY(1.12); }
        50% { transform: scaleX(1.08) scaleY(0.92); }
        70% { transform: scaleX(0.95) scaleY(1.05); }
        85% { transform: scaleX(1.02) scaleY(0.98); }
      }
      .anim-wobble { animation: me-ai-wobble 0.6s ease-in-out; }

      /* Ripple: onda expansiva desde el borde */
      @keyframes me-ai-ripple {
        0% { box-shadow: 0 0 0 0 var(--me-ai-accent); opacity: 0.6; }
        100% { box-shadow: 0 0 0 16px var(--me-ai-accent); opacity: 0; }
      }
      .anim-ripple { animation: me-ai-ripple 0.8s ease-out 2; }

      /* Swing: oscilacion tipo pendulo */
      @keyframes me-ai-swing {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(6deg); }
        40% { transform: rotate(-5deg); }
        60% { transform: rotate(3deg); }
        80% { transform: rotate(-2deg); }
      }
      .anim-swing { animation: me-ai-swing 0.6s ease-in-out; transform-origin: top center; }

      /* ICONOS ANIMADOS ──────────────────────────────── */

      /* Typing dots: tres puntos rebotando secuencialmente */
      @keyframes me-ai-dot-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-5px); opacity: 1; }
      }
      .me-ai-icon .me-ai-dot { animation: me-ai-dot-bounce 1.2s ease-in-out infinite; }
      .me-ai-icon .me-ai-dot:nth-child(2) { animation-delay: 0.15s; }
      .me-ai-icon .me-ai-dot:nth-child(3) { animation-delay: 0.3s; }

      /* Progress orbit: puntos orbitando */
      @keyframes me-ai-orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .me-ai-icon .me-ai-orbit-group { animation: me-ai-orbit 1.5s linear infinite; transform-origin: 12px 12px; }

      /* ENTRADA ALTERNATIVA ───────────────────────────── */

      /* Slide-spring: entrada deslizante con rebote elastico */
      @keyframes me-ai-slide-spring-left {
        0% { transform: translateX(-120%) scale(0.8); opacity: 0; }
        60% { transform: translateX(8%) scale(1.02); opacity: 1; }
        80% { transform: translateX(-3%) scale(1); }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes me-ai-slide-spring-right {
        0% { transform: translateX(120%) scale(0.8); opacity: 0; }
        60% { transform: translateX(-8%) scale(1.02); opacity: 1; }
        80% { transform: translateX(3%) scale(1); }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes me-ai-slide-spring-down {
        0% { transform: translateY(-120%) scale(0.8); opacity: 0; }
        60% { transform: translateY(8%) scale(1.02); opacity: 1; }
        80% { transform: translateY(-3%) scale(1); }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      .me-ai-island.entry-slide-spring-left { animation: me-ai-slide-spring-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      .me-ai-island.entry-slide-spring-right { animation: me-ai-slide-spring-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      .me-ai-island.entry-slide-spring-down { animation: me-ai-slide-spring-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

      /* ANIMACIONES DE SALIDA ───────────────────────── */
      @keyframes me-ai-exit-fade { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
      @keyframes me-ai-exit-slide-down { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
      @keyframes me-ai-exit-slide-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
      @keyframes me-ai-exit-shrink-bounce { 0% { transform: scale(1); opacity: 1; } 30% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }
      .exit-fade { animation: me-ai-exit-fade 0.3s ease-out forwards; }
      .exit-slide-down { animation: me-ai-exit-slide-down 0.3s ease-out forwards; }
      .exit-slide-up { animation: me-ai-exit-slide-up 0.3s ease-out forwards; }
      .exit-shrink-bounce { animation: me-ai-exit-shrink-bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

      /* SVG DE FORMA - Fondo con bordes redondeados dinamicos */
      .me-ai-island-shape-svg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }

      .me-ai-island-shape-svg path {
        fill: var(--me-ai-island-bg);
        stroke: var(--me-ai-island-border);
        stroke-width: 1.5px;
        backdrop-filter: blur(var(--me-ai-island-blur));
        transition: fill 0.3s ease, stroke 0.3s ease;
      }

      /* CONTENT CONTAINER - Contenido interior de la isla */
      .me-ai-content {
        position: relative;
        padding: 12px 16px;
        max-width: none;
        opacity: 0;
        color: var(--me-ai-text-main);
        transform: translateY(8px);
        transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        pointer-events: none;
        box-sizing: border-box;
        z-index: 11;
      }

      .me-ai-content.is-active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .me-ai-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .me-ai-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 20px;
        color: var(--me-ai-accent);
        flex-shrink: 0;
        transition: color 0.3s ease;
      }

      .me-ai-icon svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Multimedia: Avatar */
      .me-ai-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid var(--me-ai-island-border);
      }

      /* ACCIONES RAPIDAS - Botones de accion dentro de la notificacion */
      .me-ai-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
        justify-content: flex-end;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.3s ease, transform 0.4s ease;
        pointer-events: none;
      }

      .me-ai-content.is-active .me-ai-actions {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        transition-delay: 0.25s;
      }

      .me-ai-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--me-ai-btn-bg);
        border: none;
        color: var(--me-ai-text-main);
        padding: 6px 12px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.1s ease;
      }

      .me-ai-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; flex-shrink: 0; }
      .me-ai-btn-icon svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

      .me-ai-action-btn:hover { background: var(--me-ai-btn-hover); }
      .me-ai-action-btn:active { transform: scale(0.92); }

      .me-ai-action-btn.primary {
        background: var(--me-ai-accent);
        color: var(--me-ai-accent-contrast);
      }

      @keyframes me-ai-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .is-spinning { animation: me-ai-spin 1s linear infinite; }

      .me-ai-title {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
      }

      .me-ai-subtitle {
        font-size: 12px;
        color: var(--me-ai-text-sub);
        white-space: nowrap;
      }

      .me-ai-subtitle a { color: var(--me-ai-accent); text-decoration: underline; text-underline-offset: 2px; }
      .me-ai-subtitle strong, .me-ai-subtitle b { font-weight: 700; color: var(--me-ai-text-main); }
      .me-ai-subtitle code { font-family: monospace; font-size: 11px; background: var(--me-ai-btn-bg); padding: 1px 4px; border-radius: 4px; }

      /* BARRA DE PROGRESO */
      .me-ai-progress {
        margin-top: 10px;
        height: 4px;
        background: rgba(128, 128, 128, 0.15);
        border-radius: 4px;
        overflow: hidden;
      }

      .me-ai-progress-bar {
        height: 100%;
        background: var(--me-ai-accent);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
      }

      /* COUNTDOWN VISUAL - Barra inferior que se consume durante el duration */
      .me-ai-countdown {
        position: absolute;
        bottom: 0; left: 0;
        height: 3px;
        background: var(--me-ai-accent);
        z-index: 12;
        opacity: 0.7;
        width: 100%;
      }
      .me-ai-countdown.is-running { animation: me-ai-countdown-shrink linear forwards; }
      @keyframes me-ai-countdown-shrink { from { width: 100%; } to { width: 0%; } }
      .me-ai-island.is-paused .me-ai-countdown { animation-play-state: paused; }

    `;
    document.head.appendChild(style);
  }

  // ──────────────────────────────────────────────
  //  CREACION DEL DOM
  // ──────────────────────────────────────────────

  /**
   * Construye la estructura DOM del componente:
   * - Overlay bloqueante (fondo semitransparente para actividades bloqueantes)
   * - Root container (contenedor principal posicionado en pantalla)
   * - Stack layers (capas visuales que simulan elementos en cola)
   * - Isla principal (burbuja con SVG de forma dinamica + contenido)
   * Registra tambien los eventos de click y teclado (accesibilidad) sobre la isla.
   *
   * @private
   */
   _createDOM() {

    // Overlay bloqueante: impide interaccion con el resto de la pagina
    this.overlay = document.getElementById("me-ai-blocking-overlay");
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.id = "me-ai-blocking-overlay";
      document.body.appendChild(this.overlay);
    }

    // Root container: elemento fijo que aloja la isla y las capas de stack
    this.root = document.getElementById("me-ai-island-root");
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.id = "me-ai-island-root";
      document.body.appendChild(this.root);
    }

    // Atributos ARIA para accesibilidad
    if (this.root) {
      this.root.setAttribute('role', 'region');
      this.root.setAttribute('aria-label', 'Notificaciones del sistema');
    }

    // Stack layers: hasta 5 capas apiladas que indican cuantas actividades hay en cola
    this.stackContainer = document.createElement("div");
    this.stackContainer.className = "me-ai-stack-container";
    this.stackContainer.setAttribute('aria-hidden', 'true');

    this.stackLayers = [];
    for(let i=0; i<5; i++){
      const l = document.createElement("div");
      l.className = "me-ai-stack-layer";
      this.stackContainer.appendChild(l);
      this.stackLayers.push(l);
    }

    // Generar Badge de contador
    this.stackBadge = document.createElement("div");
    this.stackBadge.className = "me-ai-stack-badge";
    this.root.appendChild(this.stackBadge);

    // Isla principal: burbuja interactiva con soporte de click y teclado
    this.island = document.createElement("div");
    this.island.className = "me-ai-island";
    this.island.setAttribute('tabindex', '-1');
    this.island.addEventListener('click', (e) => this._handleIslandClick(e));
    this.island.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._handleIslandClick(e);
      }
    });

    // Escape cierra la notificacion activa
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible && !this.isClosing && this.activeId) {
        this.remove(this.activeId);
      }
    });

    // Pause on hover: pausar timer y countdown al pasar el raton
    this.island.addEventListener('mouseenter', () => {
      if (this.activeId && this.timers.has(this.activeId)) {
        this.isPaused = true;
        this._pauseTimer(this.activeId);
        this.island.classList.add('is-paused');
      }
    });
    this.island.addEventListener('mouseleave', () => {
      if (this.isPaused && this.activeId) {
        this.isPaused = false;
        this._resumeTimer(this.activeId);
        this.island.classList.remove('is-paused');
      }
    });

    // Resize: recalcular ancho en modos relativos (wide, %, vw, etc.)
    window.addEventListener('resize', () => {
      if (this.isVisible && this.activeId) this._measure();
    });

    // SVG de forma: genera el fondo con bordes redondeados que se adaptan al tamano
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "me-ai-island-shape-svg");
    this.svg.setAttribute("aria-hidden", "true");
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.svg.appendChild(this.path);
    this.island.appendChild(this.svg);

    // Contenedor del contenido (titulo, subtitulo, progreso, acciones)
    this.content = document.createElement("div");
    this.content.className = "me-ai-content";
    this.island.appendChild(this.content);

    if (this.root) {
      this.root.appendChild(this.stackContainer);
      this.root.appendChild(this.island);
    }

  }

  // ──────────────────────────────────────────────
  //  SISTEMA DE TEMAS
  // ──────────────────────────────────────────────

  /**
   * Registra un listener en la media query `prefers-color-scheme` del sistema.
   * Cuando el tema esta configurado como 'system', reacciona automaticamente
   * a los cambios de preferencia del usuario (modo oscuro/claro del SO).
   *
   * @private
   */
  _initThemeListener() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', () => {
      if (this.theme === 'system') this._applyTheme();
    });
  }

  /**
   * Establece el tema visual del componente.
   *
   * @param {string} theme - Tema a aplicar ('dark'|'light'|'system').
   */
  setTheme(theme) {
    this.theme = theme;
    this._applyTheme();
  }

  /**
   * Aplica el tema visual activo al DOM.
   * Si el tema es 'system', resuelve automaticamente a 'dark' o 'light'
   * segun la preferencia del sistema operativo.
   * Actualiza las clases CSS del root y refresca el contenido visible.
   *
   * @private
   */
  _applyTheme() {
    let activeTheme = this.theme;
    if (this.theme === 'system') {
      activeTheme = this.mediaQuery.matches ? 'dark' : 'light';
    }
    this.activeThemeName = activeTheme;
    if (this.root) {
      this.root.classList.remove('me-ai-theme-light', 'me-ai-theme-dark');
      this.root.classList.add(`me-ai-theme-${activeTheme}`);
    }
    document.body.classList.remove('system-dark');
    if (activeTheme === 'dark') document.body.classList.add('system-dark');
    this._refresh();
  }

  // ──────────────────────────────────────────────
  //  POSICIONAMIENTO
  // ──────────────────────────────────────────────

  /**
   * Establece la posicion de la isla en la pantalla.
   * Actualiza las clases CSS del root container para reflejar la nueva posicion.
   *
   * @param {string} pos - Posicion deseada
   *   ('top-left'|'top-center'|'top-right'|'center'|'bottom-left'|'bottom-center'|'bottom-right').
   */
  setPosition(pos) {
    this.position = pos;
    if (this.root) {
        this.root.className = `${pos} me-ai-theme-${this.activeThemeName}`;
    }
  }

  setStackStyle(style) {
    this.stackStyle = style;
    this._refresh();
  }

  /**
   * Cambia el ancho por defecto de la isla en runtime.
   * @param {string} width - 'compact', 'normal', 'wide' o valor CSS arbitrario.
   */
  setIslandWidth(width) {
    this.islandWidth = width;
    if (this.isVisible && this.activeId) this._measure();
  }

  // ──────────────────────────────────────────────
  //  API PUBLICA: COLA DE ACTIVIDADES
  // ──────────────────────────────────────────────

  /**
   * Anade una nueva actividad a la cola de notificaciones.
   *
   * Si la actividad tiene un `groupId` y ya existe otra con el mismo grupo,
   * se agrupan: se incrementa el contador, se calcula el promedio de progreso
   * y se actualiza la actividad existente en lugar de crear una nueva.
   *
   * @param {Object} config - Configuracion de la actividad.
   * @param {string} [config.id] - ID unico. Se genera automaticamente si no se proporciona.
   * @param {string} [config.type] - Tipo de actividad ('success'|'error'|'info'|'warning'|'loading'|'thinking'|'generic').
   * @param {string} [config.title] - Titulo principal.
   * @param {string} [config.subtitle] - Texto secundario.
   * @param {string} [config.icon] - HTML del icono personalizado (sobrescribe el icono del tipo).
   * @param {string} [config.avatarUrl] - URL de imagen de avatar (reemplaza al icono).
   * @param {number} [config.progress] - Progreso de 0 a 1 para mostrar barra de progreso.
   * @param {number} [config.duration] - Duracion en ms antes de auto-eliminar la actividad.
   * @param {string} [config.priority='normal'] - Prioridad en la cola ('low'|'normal'|'high').
   * @param {boolean} [config.closeOnClick] - Si true, la isla se cierra al hacer click.
   * @param {boolean} [config.isBlocking] - Si true, muestra el overlay bloqueante.
   * @param {boolean} [config.waitToDisplay] - Si true, el temporizador no arranca hasta que la actividad se muestre.
   * @param {boolean} [config.enableAnimations=true] - Si false, desactiva las animaciones de la isla.
   * @param {string} [config.animation] - Override de animacion de la isla
   *   ('pulse'|'shake'|'bounce'|'glow'|'breathe'|'heartbeat'|'wobble'|'ripple'|'swing'|'none').
   *   Si no se indica, se usa la animacion por defecto del tipo.
   * @param {string} [config.entryAnimation] - Animacion de entrada alternativa ('slide-spring').
   * @param {string} [config.soundUrl] - URL de un sonido a reproducir cuando la actividad se muestre.
   * @param {string} [config.groupId] - ID de grupo para agrupar actividades similares.
   * @param {string} [config.groupTitle] - Plantilla de titulo para el grupo. Usa {n} como placeholder del contador.
   * @param {Array<Object>} [config.actions] - Botones de accion [{label, type, onClick}].
   * @returns {Promise} Promesa que se resuelve cuando la actividad se cierra, con {id, status: 'closed'}. La promesa tiene una propiedad `id` con el identificador asignado.
   */
  add(config) {
    // Logica de agrupacion: si ya existe una actividad con el mismo groupId,
    // se actualiza en lugar de crear una nueva
    if (config.groupId) {
      const existing = this.activities.find(a => a.groupId === config.groupId);
      if (existing) {
        existing.groupCount = (existing.groupCount || 1) + 1;

        // Calculo de promedio de progreso del grupo
        if (config.progress !== undefined) {
            if (!existing._groupProgresses) {
                existing._groupProgresses = [existing.progress !== undefined ? existing.progress : 0];
            }
            existing._groupProgresses.push(config.progress);
            const sum = existing._groupProgresses.reduce((a, b) => a + b, 0);
            existing.progress = sum / existing._groupProgresses.length;
        }

        const patch = {
          title: config.groupTitle ? config.groupTitle.replace('{n}', existing.groupCount) : config.title,
          subtitle: config.subtitle,
          progress: existing.progress,
          duration: config.duration,
          enableAnimations: config.enableAnimations !== undefined ? config.enableAnimations : existing.enableAnimations
        };
        this.update(existing.id, patch);
        return this.resolvers.get(existing.id);
      }
    }

    // Crear nueva actividad con ID unico
    const id = config.id || "me-ai-" + Date.now() + Math.random().toString(16).slice(2);
    const activity = {
      ...config,
      id,
      priority: config.priority || 'normal',
      enableAnimations: config.enableAnimations !== false,
      addedAt: Date.now()
    };

    // Inicializar array de promedios si tiene grupo y progreso
    if (activity.groupId && activity.progress !== undefined) {
        activity._groupProgresses = [activity.progress];
    }

    this.activities.push(activity);
    this._sortQueue();

    // Devolver promesa que se resolvera cuando la actividad se cierre
    const promise = new Promise(resolve => this.resolvers.set(id, resolve));
    promise.id = id;
    if (activity.duration && !activity.waitToDisplay) this._setTimer(id, activity.duration);
    this._refresh();
    return promise;
  }

  /**
   * Actualiza las propiedades de una actividad existente.
   * Si se cambia la prioridad, reordena la cola.
   * Si se cambia la duracion, reinicia el temporizador.
   *
   * @param {string} id - ID de la actividad a actualizar.
   * @param {Object} patch - Propiedades a modificar (mismas que en add()).
   */
  update(id, patch) {
    const a = this.activities.find(x => x.id === id);
    if (a) {
      Object.assign(a, patch);
      if (patch.priority) this._sortQueue();
      if (patch.duration && (!a.waitToDisplay || this.activeId === id)) this._setTimer(id, patch.duration);
      this._refresh();
    }
  }

  /**
   * Elimina una actividad de la cola, limpia su temporizador
   * y resuelve su promesa asociada con estado 'closed'.
   *
   * @param {string} id - ID de la actividad a eliminar.
   */
  remove(id) {
    const activity = this.activities.find(a => a.id === id);
    // Callback onHide: se dispara antes de resolver la promesa
    if (activity && activity.onHide) activity.onHide({ id, type: activity.type });
    this._lastExitAnimation = activity?.exitAnimation || null;
    if (this.timers.has(id)) { clearTimeout(this.timers.get(id)); this.timers.delete(id); }
    this.timerMeta.delete(id);
    if (this.resolvers.has(id)) {
      this.resolvers.get(id)({ id, status: 'closed' });
      this.resolvers.delete(id);
    }
    this.activities = this.activities.filter(a => a.id !== id);
    this.activeId = this.activities.length ? this.activities[0].id : null;
    this._refresh();
  }

  /**
   * Patron Undo: muestra una notificacion con boton Deshacer y countdown.
   * Si el usuario pulsa Deshacer, llama onUndo(). Si el timer expira, llama onConfirm().
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {string} [config.undoLabel='Deshacer'] - Texto del boton de deshacer.
   * @param {number} [config.undoDuration=5000] - Duracion del countdown en ms.
   * @param {Function} [config.onUndo] - Callback si el usuario deshace.
   * @param {Function} [config.onConfirm] - Callback si el timer expira (accion confirmada).
   * @returns {Promise<{id, status: 'undone'|'confirmed'}>}
   */
  addUndo(config) {
    const undoLabel = config.undoLabel || 'Deshacer';
    const undoDuration = config.undoDuration || 5000;
    let undone = false;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        duration: undoDuration,
        showCountdown: true,
        actions: [
          {
            label: undoLabel,
            type: 'primary',
            icon: config.undoIcon || null,
            onClick: (ctx) => {
              undone = true;
              if (config.onUndo) config.onUndo();
              this.remove(ctx.activityId);
            }
          },
          ...(config.actions || [])
        ]
      };

      delete actConfig.undoLabel;
      delete actConfig.undoDuration;
      delete actConfig.onUndo;
      delete actConfig.onConfirm;
      delete actConfig.undoIcon;

      const task = this.add(actConfig);

      // Interceptar el resolver para distinguir undo vs confirmacion
      this.resolvers.set(task.id, () => {
        if (undone) {
          resolve({ id: task.id, status: 'undone' });
        } else {
          if (config.onConfirm) config.onConfirm();
          resolve({ id: task.id, status: 'confirmed' });
        }
      });
    });
  }

  /**
   * Ejecuta una secuencia de pasos de notificacion en orden.
   * Cada paso se muestra tras completar el anterior (morphing suave via update).
   *
   * @param {Array<Object>} steps - Pasos de la cadena. Cada paso acepta las mismas propiedades que add(), mas:
   * @param {Promise} [step.until] - Esperar a esta promesa antes de avanzar al siguiente paso.
   * @returns {Promise<{id, status: 'chain-complete'|'chain-interrupted'}>}
   */
  async chain(steps) {
    if (!steps || steps.length === 0) return { status: 'chain-complete' };

    // Primer paso: crear la actividad (sin auto-remove si hay mas pasos)
    const firstStep = { ...steps[0] };
    if (steps.length > 1) delete firstStep.duration;
    delete firstStep.until;
    const task = this.add(firstStep);
    const chainId = task.id;

    // Pasos intermedios: usar update() para morphing suave
    for (let i = 1; i < steps.length; i++) {
      const prevStep = steps[i - 1];

      if (prevStep.until) {
        await prevStep.until;
      } else if (prevStep.duration) {
        await new Promise(r => setTimeout(r, prevStep.duration));
      }

      // Si la actividad fue eliminada externamente, interrumpir
      if (!this.activities.find(a => a.id === chainId)) {
        return { id: chainId, status: 'chain-interrupted' };
      }

      const patch = { ...steps[i] };
      const isLast = i === steps.length - 1;
      if (!isLast) delete patch.duration;
      delete patch.until;
      this.update(chainId, patch);
    }

    // Esperar a que la actividad se cierre (por timer del ultimo paso o manualmente)
    return new Promise((resolve) => {
      this.resolvers.set(chainId, () => {
        resolve({ id: chainId, status: 'chain-complete' });
      });
    });
  }

  /**
   * Lanza manualmente el efecto de confetti sobre la isla.
   */
  confetti() {
    this._spawnConfetti();
  }

  // ──────────────────────────────────────────────
  //  GESTION INTERNA DE COLA
  // ──────────────────────────────────────────────

  /**
   * Ordena la cola de actividades por prioridad (descendente) y por orden de llegada (FIFO).
   * Establece como activa la primera actividad de la cola ordenada.
   *
   * @private
   */
  _sortQueue() {
    this.activities.sort((a, b) => {
      const pA = this.priorityMap[a.priority];
      const pB = this.priorityMap[b.priority];
      if (pA !== pB) return pB - pA;
      return a.addedAt - b.addedAt;
    });
    if (this.activities.length) this.activeId = this.activities[0].id;
  }

  /**
   * Refresca el estado visual de la isla segun la actividad activa.
   * Si no hay actividades, cierra la isla.
   * Si la actividad tiene sonido y aun no se ha reproducido, lo reproduce.
   *
   * @private
   */
  _refresh() {
    const active = this.activities.find(a => a.id === this.activeId);
    if (!active) { this._closeIsland(this._lastExitAnimation); this._lastExitAnimation = null; return; }
    if (active.duration && active.waitToDisplay && !this.timers.has(active.id)) {
      this._setTimer(active.id, active.duration);
      if (this.isPaused) this._pauseTimer(active.id);
    }
    if (active.soundUrl && !active.soundPlayed) { new Audio(active.soundUrl).play().catch(() => {}); active.soundPlayed = true; }
    this._updateIslandState(active, this.activities.length - 1);
  }

  /**
   * Establece o reinicia el temporizador de auto-eliminacion de una actividad.
   *
   * @param {string} id - ID de la actividad.
   * @param {number} ms - Milisegundos antes de eliminar la actividad automaticamente.
   * @private
   */
  _setTimer(id, ms) {
    if (this.timers.has(id)) clearTimeout(this.timers.get(id));
    this.timers.set(id, setTimeout(() => this.remove(id), ms));
    this.timerMeta.set(id, { startTime: Date.now(), remainingTime: ms, originalDuration: ms });
  }

  /**
   * Pausa el temporizador de una actividad, guardando el tiempo restante.
   * @param {string} id
   * @private
   */
  _pauseTimer(id) {
    if (!this.timers.has(id) || !this.timerMeta.has(id)) return;
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    const meta = this.timerMeta.get(id);
    meta.remainingTime = Math.max(0, meta.remainingTime - (Date.now() - meta.startTime));
  }

  /**
   * Reanuda el temporizador de una actividad con el tiempo restante.
   * @param {string} id
   * @private
   */
  _resumeTimer(id) {
    const meta = this.timerMeta.get(id);
    if (!meta || meta.remainingTime <= 0) return;
    this.timers.set(id, setTimeout(() => this.remove(id), meta.remainingTime));
    meta.startTime = Date.now();
  }

  /**
   * Gestiona el click o pulsacion de tecla sobre la isla.
   * Si se pulsa un boton de accion, ejecuta su callback onClick.
   * Si la actividad tiene closeOnClick, se elimina de la cola.
   *
   * @param {Event} e - Evento de click o teclado.
   * @private
   */
  _handleIslandClick(e) {
    const active = this.activities.find(a => a.id === this.activeId);
    if (!active) return;
    const actionBtn = e.target.closest('.me-ai-action-btn');
    if (actionBtn) {
      const actionIndex = parseInt(actionBtn.dataset.index);
      const action = active.actions?.[actionIndex];
      if (action && action.onClick) action.onClick({ activityId: active.id });
      return;
    }
    if (active.closeOnClick) this.remove(active.id);
  }

  // ──────────────────────────────────────────────
  //  RENDERIZADO DE CONTENIDO
  // ──────────────────────────────────────────────

  /**
   * Actualiza el estado visual completo de la isla para la actividad indicada.
   * Gestiona: overlay bloqueante, accesibilidad (role, aria-label),
   * color de acento segun tipo, animaciones (shake/pulse) y transicion de visibilidad.
   *
   * @param {Object} data - Datos de la actividad activa.
   * @param {number} queueCount - Numero de actividades pendientes en cola (sin contar la activa).
   * @private
   */
  _updateIslandState(data, queueCount) {
    if (!this.island) return;
    this.isClosing = false;
    this.stackCount = Math.min(queueCount, 5);

    // Gestionar overlay bloqueante
    if (this.overlay) {
      if (data.isBlocking) this.overlay.classList.add('is-active');
      else if (this.stackCount === 0) this.overlay.classList.remove('is-active');
    }

    // Gestión del Contador de Apilamiento (Badge)
    if (this.stackBadge) {
      if (this.stackStyle === 'counter' && queueCount > 0) {
        this.stackBadge.innerText = `+${queueCount}`;
        this.stackBadge.classList.add('is-visible');
      } else {
        this.stackBadge.classList.remove('is-visible');
      }
    }

    // Accesibilidad: configurar role y aria-label segun tipo de interaccion
    if (data.closeOnClick) {
      this.island.classList.add('is-clickable');
      this.island.setAttribute('role', 'button');
      this.island.setAttribute('aria-label', `Notificación: ${data.title}. Pulse para cerrar.`);
    } else {
      this.island.classList.remove('is-clickable');
      this.island.removeAttribute('role');
      this.island.setAttribute('aria-label', `Notificación: ${data.title}`);
    }

    // Color de acento segun el tipo de actividad (colores hex resueltos para morphing suave)
    const accentColor = this.typeColors[data.type] || (this.activeThemeName === 'dark' ? '#ffffff' : '#1d1d1f');
    const isGeneric = !this.typeColors[data.type];

    if (this.root) {
        this.root.style.setProperty('--me-ai-accent', accentColor);
        let contrastColor = "#ffffff";
        if (isGeneric && this.activeThemeName === 'dark') contrastColor = "#000000";
        this.root.style.setProperty('--me-ai-accent-contrast', contrastColor);
    }

    // Animaciones: sistema de lookup con soporte para override via propiedad 'animation'
    this.island.classList.remove(...this.allAnimClasses);
    if (data.enableAnimations) {
      const anim = data.animation === 'none' ? null : (data.animation || this.defaultAnimations[data.type] || null);
      if (anim) {
        void this.island.offsetWidth; // Forzar reflow para reiniciar animacion
        this.island.classList.add(`anim-${anim}`);
      }
    }

    // Si la isla no es visible, mostrarla primero y luego aplicar contenido
    if (!this.isVisible) {
      this.isVisible = true;
      this.island.setAttribute('tabindex', '0');
      this.width = this.minWidth; this.height = this.minHeight;
      this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;

      // Limpiar clases de entrada previas
      this.island.classList.remove('entry-slide-spring-left', 'entry-slide-spring-right', 'entry-slide-spring-down');

      if (data.entryAnimation === 'slide-spring') {
        // Determinar direccion segun posicion de la isla
        let dir = 'down';
        if (this.position.includes('left')) dir = 'left';
        else if (this.position.includes('right')) dir = 'right';
        this.island.style.transform = 'none';
        this.island.style.opacity = '0';
        this.island.classList.add('is-visible');
        void this.island.offsetWidth;
        this.island.classList.add(`entry-slide-spring-${dir}`);
      } else {
        this.island.classList.add('is-visible');
      }

      setTimeout(() => {
        this._applyContent(data);
        if (data.confetti || (this.autoConfetti && data.type === 'success')) {
          setTimeout(() => this._spawnConfetti(), 200);
        }
      }, 400);
    } else {
      this._applyContent(data);
      if (data.confetti || (this.autoConfetti && data.type === 'success')) {
        setTimeout(() => this._spawnConfetti(), 200);
      }
    }
  }

  /**
   * Aplica el contenido HTML dentro de la isla (icono/avatar, titulo, subtitulo,
   * barra de progreso, botones de accion).
   * Si el titulo no ha cambiado, actualiza solo los campos dinamicos (progreso, subtitulo)
   * para evitar parpadeos. Si el titulo es nuevo, realiza una transicion completa.
   *
   * @param {Object} data - Datos de la actividad a renderizar.
   * @private
   */
  _applyContent(data) {
    if (!this.content) return;
    const existingTitle = this.content.querySelector('.me-ai-title')?.innerText;

    // Determinar si mostrar avatar o icono
    let mediaHTML = "";
    if (data.avatarUrl) {
      mediaHTML = `<img src="${data.avatarUrl}" class="me-ai-avatar" alt="${data.title}">`;
    } else {
      mediaHTML = `<div class="me-ai-icon">${data.icon || this.icons[data.type] || "🔔"}</div>`;
    }

    // Atributos ARIA segun prioridad: 'alert' (assertive) para alta prioridad, 'status' (polite) para el resto
    const isHighPriority = data.priority === 'high' || data.type === 'error';
    this.content.setAttribute('role', isHighPriority ? 'alert' : 'status');
    this.content.setAttribute('aria-live', isHighPriority ? 'assertive' : 'polite');
    this.content.setAttribute('aria-atomic', 'true');

    // Generar HTML de botones de accion
    let actionsHTML = '';
    if (data.actions && data.actions.length > 0) {
      actionsHTML = `<div class="me-ai-actions" role="group" aria-label="Acciones de la notificación">
        ${data.actions.map((act, i) => `<button class="me-ai-action-btn ${act.type || ''}" data-index="${i}">${act.icon ? `<span class="me-ai-btn-icon">${act.icon}</span>` : ''}${act.label}</button>`).join('')}
      </div>`;
    }

    // Actualizacion parcial: si el titulo no cambio, solo actualizar campos dinamicos
    if (this.content.classList.contains('is-active') && existingTitle === data.title) {
      const bar = this.content.querySelector('.me-ai-progress-bar');
      if (bar) {
        bar.style.width = `${(data.progress || 0) * 100}%`;
        bar.setAttribute('aria-valuenow', Math.round((data.progress || 0) * 100));
      }
      const sub = this.content.querySelector('.me-ai-subtitle');
      if (sub) sub.innerHTML = data.subtitle || '';

      const mediaContainer = this.content.querySelector('.me-ai-header-media');
      if (mediaContainer && mediaContainer.innerHTML !== mediaHTML) {
        // Crossfade del icono para morphing suave entre tipos
        mediaContainer.style.transition = 'opacity 0.2s ease';
        mediaContainer.style.opacity = '0';
        setTimeout(() => {
          mediaContainer.innerHTML = mediaHTML;
          mediaContainer.style.opacity = '1';
        }, 200);
      }

      const actionsDiv = this.content.querySelector('.me-ai-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = data.actions ? data.actions.map((act, i) => `<button class="me-ai-action-btn ${act.type || ''}" data-index="${i}">${act.icon ? `<span class="me-ai-btn-icon">${act.icon}</span>` : ''}${act.label}</button>`).join('') : '';
      } else if (actionsHTML) {
        this.content.insertAdjacentHTML('beforeend', actionsHTML);
      }
      this._measure(); return;
    }

    // Transicion completa: ocultar contenido actual, reemplazar y mostrar con animacion
    this.content.classList.remove('is-active');
    setTimeout(() => {
      if (this.isClosing || !this.content) return;
      this.content.innerHTML = `
        <div class="me-ai-header">
          <div class="me-ai-header-media">${mediaHTML}</div>
          <div>
            <div class="me-ai-title">${data.title || ''}</div>
            <div class="me-ai-subtitle">${data.subtitle || ''}</div>
          </div>
        </div>
        ${data.progress != null ? `
          <div class="me-ai-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(data.progress * 100)}">
            <div class="me-ai-progress-bar" style="width:0%"></div>
          </div>` : ""}
        ${actionsHTML}
      `;
      this._measure();
      setTimeout(() => {
        if (this.isClosing || !this.content) return;
        this.content.classList.add('is-active');
        const bar = this.content.querySelector('.me-ai-progress-bar');
        if (bar) bar.style.width = `${(data.progress || 0) * 100}%`;
        // Callback onShow: se dispara una sola vez cuando la actividad se muestra por primera vez
        if (data.onShow && !data._onShowFired) {
          data._onShowFired = true;
          data.onShow({ id: data.id, type: data.type });
        }
        // Countdown visual: barra que se consume durante el duration
        this._updateCountdown(data);
      }, 50);
    }, 150);
  }

  /**
   * Crea o actualiza la barra de countdown visual en la isla.
   * @param {Object} data - Datos de la actividad.
   * @private
   */
  _updateCountdown(data) {
    const existing = this.island?.querySelector('.me-ai-countdown');
    if (existing) existing.remove();
    if (data.duration && data.showCountdown === true && this.island) {
      const el = document.createElement('div');
      el.className = 'me-ai-countdown';
      this.island.appendChild(el);
      requestAnimationFrame(() => {
        el.style.animationDuration = `${data.duration}ms`;
        el.classList.add('is-running');
        if (this.isPaused) this.island.classList.add('is-paused');
      });
    }
  }

  /**
   * Mide las dimensiones naturales del contenido usando un nodo clon invisible.
   * Calcula el tamano objetivo (targetWidth/targetHeight) al que la isla
   * debe animar, respetando los limites minimo y maximo.
   *
   * @private
   */
  _measure() {
    if (!this.content) return;
    const active = this.activities.find(a => a.id === this.activeId);
    const widthMode = active?.islandWidth || this.islandWidth;
    const resolved = this._resolveWidth(widthMode);
    const ghost = this.content.cloneNode(true);
    ghost.classList.add('is-active');
    if (resolved !== null) {
      ghost.style.cssText = `position:absolute;visibility:hidden;display:block;width:${resolved}px;`;
      document.body.appendChild(ghost);
      const rect = ghost.getBoundingClientRect();
      this.targetWidth = resolved;
      this.targetHeight = Math.max(this.minHeight, Math.ceil(rect.height));
    } else {
      ghost.style.cssText = "position:absolute;visibility:hidden;display:inline-block;width:max-content;";
      document.body.appendChild(ghost);
      const rect = ghost.getBoundingClientRect();
      this.targetWidth = Math.max(this.minWidth, Math.min(Math.ceil(rect.width) + 2, this.maxWidth));
      this.targetHeight = Math.max(this.minHeight, Math.ceil(rect.height));
    }
    ghost.remove();
  }

  /**
   * Resuelve un valor de islandWidth a pixeles.
   * @param {string} val - 'compact', 'normal', 'wide' o valor CSS.
   * @returns {number|null} Pixeles resueltos, o null para modo compact.
   * @private
   */
  _resolveWidth(val) {
    if (val === 'compact') return null;
    if (val === 'normal') return 400;
    if (val === 'wide') return window.innerWidth - 32;
    const tmp = document.createElement('div');
    tmp.style.cssText = `position:absolute;visibility:hidden;width:${val};`;
    document.body.appendChild(tmp);
    const w = tmp.getBoundingClientRect().width;
    tmp.remove();
    return Math.max(this.minWidth, w);
  }

  /**
   * Comprueba si la isla esta en su tamano minimo (forma circular colapsada).
   *
   * @returns {boolean} True si el ancho y alto estan en el minimo (con tolerancia de 1px).
   */
  isAtMinSize() { return Math.abs(this.width - this.minWidth) < 1 && Math.abs(this.height - this.minHeight) < 1; }

  /**
   * Inicia la secuencia de cierre de la isla:
   * oculta el contenido, colapsa la isla a su tamano minimo
   * y limpia el overlay bloqueante.
   *
   * @private
   */
  _closeIsland(exitAnimation) {
    this.isClosing = true;
    if (this.content) this.content.classList.remove('is-active');
    const countdown = this.island?.querySelector('.me-ai-countdown');
    if (countdown) countdown.remove();
    if (this.island) {
      this.island.setAttribute('tabindex', '-1');
      // Detener animaciones infinitas y limpiar clases de entrada/salida
      this.island.classList.remove('anim-breathe', 'entry-slide-spring-left', 'entry-slide-spring-right', 'entry-slide-spring-down', ...this.allExitClasses);
      this.island.style.transform = '';
      this.island.style.opacity = '';

      if (exitAnimation && exitAnimation !== 'none') {
        void this.island.offsetWidth;
        this.island.classList.add(`exit-${exitAnimation}`);
        const dur = exitAnimation === 'shrink-bounce' ? 400 : 300;
        setTimeout(() => {
          if (this.isClosing && this.island) {
            this.island.classList.remove(...this.allExitClasses);
            this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;
          }
        }, dur);
      } else {
        setTimeout(() => { if (this.isClosing) { this.targetWidth = this.minWidth; this.targetHeight = this.minHeight; } }, 200);
      }
    }
    this.stackCount = 0;
  }

  /**
   * Genera una explosion de particulas tipo confetti sobre la isla.
   * Canvas temporal con fisica simple (gravedad, friccion, fade).
   * @private
   */
  _spawnConfetti() {
    if (!this.island) return;
    const rect = this.island.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width + 100;
    canvas.height = rect.height + 140;
    canvas.style.cssText = `position:fixed;left:${rect.left - 50}px;top:${rect.top - 30}px;pointer-events:none;z-index:10000;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899','#06b6d4','#facc15'];
    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 40,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 7 - 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.014;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
      else canvas.remove();
    };
    animate();
    setTimeout(() => { cancelAnimationFrame(frame); if (canvas.parentNode) canvas.remove(); }, 2500);
  }

  // ──────────────────────────────────────────────
  //  MOTOR DE ANIMACION (SPRING PHYSICS)
  // ──────────────────────────────────────────────

  /**
   * Arranca el bucle principal de animacion con requestAnimationFrame.
   *
   * En cada frame:
   * 1. Calcula la posicion del muelle (spring) para ancho y alto hacia las dimensiones objetivo.
   *    Primero anima el ancho; cuando converge, anima el alto (efecto secuencial suave).
   * 2. Si la isla se esta cerrando y llega al tamano minimo, la oculta completamente.
   * 3. Actualiza las dimensiones del elemento DOM y del SVG de forma.
   * 4. Calcula el radio de borde dinamico: circular cuando esta colapsada, redondeado cuando esta expandida.
   * 5. Posiciona y escala las capas de stack segun el numero de actividades en cola.
   *
   * @private
   */
  _startLoop() {
    /**
     * Calcula un paso de simulacion de muelle (spring).
     * Aplica fuerza de rigidez (stiffness) y amortiguacion (damping).
     *
     * @param {number} cur - Valor actual.
     * @param {number} tar - Valor objetivo.
     * @param {number} vel - Velocidad actual.
     * @param {Object} cfg - Configuracion del muelle {stiffness, damping, mass, dt}.
     * @returns {{v: number, vel: number}} Nuevo valor y nueva velocidad.
     */
    const spring = (cur, tar, vel, cfg) => {
      const f = -cfg.stiffness * (cur - tar); const d = -cfg.damping * vel; const a = (f + d) / cfg.mass;
      vel += a * cfg.dt; cur += vel * cfg.dt;
      return { v: cur, vel };
    };

    const loop = () => {
      if (!this.island || !this.svg) return;

      // Animar dimensiones con spring: primero ancho, luego alto
      if (Math.abs(this.width - this.targetWidth) > 0.1 || Math.abs(this.height - this.targetHeight) > 0.1) {
        if (Math.abs(this.width - this.targetWidth) > 0.5) {
          const res = spring(this.width, this.targetWidth, this.vw, this.springCfg);
          this.width = res.v; this.vw = res.vel;
        } else {
          const res = spring(this.height, this.targetHeight, this.vh, this.springCfg);
          this.height = res.v; this.vh = res.vel;
        }
      }

      // Completar cierre cuando la isla llega al tamano minimo
      if (this.isClosing && this.isAtMinSize()) {
          this.isClosing = false; this.isVisible = false;
          this.island.classList.remove('is-visible');
          if (this.overlay) this.overlay.classList.remove('is-active');
      }

      // Aplicar dimensiones al DOM
      this.island.style.width = `${this.width}px`; this.island.style.height = `${this.height}px`;
      this.svg.setAttribute("width", this.width); this.svg.setAttribute("height", this.height);

      // Radio de borde dinamico: circular (minimo) o redondeado (expandido)
      const r = this.isAtMinSize() ? this.height / 2 : Math.min(22, this.height * 0.4);
      this.path.setAttribute("d", `M ${r},0 H ${this.width-r} Q ${this.width},0 ${this.width},${r} V ${this.height-r} Q ${this.width},${this.height} ${this.width-r},${this.height} H ${r} Q 0,${this.height} 0,${this.height-r} V ${r} Q 0,0 ${r},0 Z`);
      this.island.style.borderRadius = `${r}px`;

      this.stackLayers.forEach((layer, i) => {
        if (i < this.stackCount && this.isVisible && !this.isClosing && this.stackStyle !== 'counter') {
          let transform = "";
          if (this.stackStyle === '3d') {
            const sc = 1 - (i + 1) * 0.05;
            transform = `translateX(-50%) translateY(${(i + 1) * 6}px) scaleX(${sc})`;
          } else if (this.stackStyle === 'fan') {
            const offY = (i + 1) * 4; const offX = (i + 1) * 8; const rot = (i + 1) * 5;
            transform = `translateX(calc(-50% + ${offX}px)) translateY(${offY}px) rotate(${rot}deg)`;
          }
          layer.style.opacity = (0.6 / (i + 1)).toString();
          layer.style.width = `${this.width}px`; layer.style.height = `${this.height}px`;
          layer.style.borderRadius = `${r}px`; layer.style.transform = transform;
        } else layer.style.opacity = "0";
      });

      requestAnimationFrame(loop);
    };
    loop();
  }
}
