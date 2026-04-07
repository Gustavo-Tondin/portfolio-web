/* ========================================
   PORTFOLIO GUSTAVO TONDIN — index.js
   Vanilla JS, sin frameworks
======================================== */


/* ========================================
   MENU TOGGLE (abrir / cerrar overlay)
======================================== */

var openBtnHeader  = document.getElementById('openMenuHeader');
var openBtnHero    = document.getElementById('openMenuHero');
var closeBtn       = document.getElementById('closeMenu');
var navigation     = document.getElementById('navigation');

function openMenu() {
  navigation.classList.add('is-open');
  document.body.classList.add('menu-open');
  closeBtn.focus();
  // Limpiar transforms inline para que CSS retome el posicionamiento inicial
  resetInlineTransforms();
}

function closeMenu() {
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  // Devolver foco al botón que disparó la acción (si está disponible)
  if (openBtnHeader) openBtnHeader.focus();
  resetClickState();
}

// Dos botones abren el mismo overlay
if (openBtnHeader) openBtnHeader.addEventListener('click', openMenu);
if (openBtnHero)   openBtnHero.addEventListener('click', openMenu);
if (closeBtn)      closeBtn.addEventListener('click', closeMenu);

// ESC cierra el menú
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
  }
});

// Links secundarios dentro del overlay también cierran el menú
navigation.querySelectorAll('.nav-secondary a, .nav-top a').forEach(function(link) {
  link.addEventListener('click', closeMenu);
});


/* ========================================
   HEADER SHOW/HIDE EN EL SCROLL
======================================== */

var header          = document.getElementById('siteHeader');
var scrollThreshold = 200;

window.addEventListener('scroll', function() {
  if (window.scrollY > scrollThreshold) {
    header.classList.add('is-visible');
  } else {
    header.classList.remove('is-visible');
  }
}, { passive: true });


/* ========================================
   SCROLL SUAVE PARA LINKS INTERNOS (#section)
======================================== */

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var targetId = link.getAttribute('href');

    // Ignorar hrefs que son solo "#" (sin destino real)
    if (!targetId || targetId === '#') return;

    var target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // Si el menú está abierto, cerrarlo antes de scrollar
    if (navigation.classList.contains('is-open')) {
      closeMenu();
    }

    // Pequeño delay para que la animación de cierre del menú no interfiera
    setTimeout(function() {
      target.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  });
});


/* ========================================
   ABAS SOBREPOSTAS - HOVER POR POSICIÓN DEL MOUSE
======================================== */

var mainLinks        = document.querySelector('.main-links');
var items            = Array.from(document.querySelectorAll('.main-link-item'));
var total            = items.length;
var hoveredIndex     = -1;
var isClickAnimating = false;

// Altura del nav-top del overlay (logo + botón cerrar)
// Valor reducido respecto al modelo de referencia porque este menú no tiene nav-secondary
var NAV_OFFSET = 70;

/**
 * Calcula los límites de cada franja de hover dentro del contenedor .main-links.
 * @returns {{ top, containerH, usableH, stripH, navOffset }}
 */
function getStripBounds() {
  var rect    = mainLinks.getBoundingClientRect();
  var usableH = rect.height - NAV_OFFSET;
  var stripH  = usableH / total;
  return {
    top:        rect.top,
    containerH: rect.height,
    usableH:    usableH,
    stripH:     stripH,
    navOffset:  NAV_OFFSET
  };
}

/**
 * Elimina todos los transforms inline, devolviendo el control al CSS.
 */
function resetInlineTransforms() {
  items.forEach(function(item) {
    item.style.transform = '';
  });
}

/**
 * Aplica el efecto de hover posicional:
 * - El ítem hovered "sube" (se despega del stack)
 * - Los ítems por debajo se empujan ligeramente hacia abajo
 * - Los ítems por arriba mantienen su posición base
 *
 * @param {number} index - Índice del ítem que recibe el hover
 */
function applyHover(index) {
  if (isClickAnimating) return;

  var bounds     = getStripBounds();
  var liftAmount = bounds.stripH * 0.75;
  var pushAmount = bounds.stripH * 0.12;

  items.forEach(function(item, i) {
    var baseY = bounds.navOffset + i * bounds.stripH;

    if (i === index) {
      // Ítem hovered: sube, revelando el título completo
      item.style.transform = 'translateY(' + (baseY - liftAmount) + 'px)';
    } else if (i > index) {
      // Ítems debajo: se empujan un poco hacia abajo
      item.style.transform = 'translateY(' + (baseY + pushAmount) + 'px)';
    } else {
      // Ítems arriba: mantienen posición base
      item.style.transform = 'translateY(' + baseY + 'px)';
    }
  });
}

/* — mousemove: detectar franja activa según posición Y del cursor — */
mainLinks.addEventListener('mousemove', function(e) {
  if (isClickAnimating) return;

  var bounds = getStripBounds();
  var mouseY = e.clientY - bounds.top - bounds.navOffset;

  // Si el mouse está sobre el nav-top, limpiar hover
  if (mouseY < 0) {
    hoveredIndex = -1;
    resetInlineTransforms();
    return;
  }

  var index = Math.floor(mouseY / bounds.stripH);
  index = Math.max(0, Math.min(index, total - 1));

  // Aplicar solo si cambió el ítem hovered (evita recálculos innecesarios)
  if (index !== hoveredIndex) {
    hoveredIndex = index;
    applyHover(index);
  }
});

/* — mouseleave: el mouse salió del contenedor, resetear — */
mainLinks.addEventListener('mouseleave', function() {
  if (isClickAnimating) return;
  hoveredIndex = -1;
  resetInlineTransforms();
});


/* ========================================
   EFECTO DE CLIC EN LAS ABAS
======================================== */

/**
 * Al hacer clic en una aba:
 * 1. El ítem clicado se expande a Y=0 (ocupa toda la pantalla)
 * 2. Los ítems por encima salen hacia arriba
 * 3. Los ítems por debajo salen hacia abajo
 * 4. Fade out de todos
 * 5. Cierra el menú y hace scroll suave al destino del link
 */
mainLinks.addEventListener('click', function(e) {
  if (isClickAnimating) return;

  // Detectar qué ítem fue clicado según posición Y del cursor
  var bounds       = getStripBounds();
  var mouseY       = e.clientY - bounds.top - bounds.navOffset;
  if (mouseY < 0) return;

  var clickedIndex = Math.floor(mouseY / bounds.stripH);
  clickedIndex = Math.max(0, Math.min(clickedIndex, total - 1));

  // Capturar el href del link dentro del ítem clicado (para scroll posterior)
  var clickedItem = items[clickedIndex];
  var clickedLink = clickedItem ? clickedItem.querySelector('a') : null;
  var targetHref  = clickedLink ? clickedLink.getAttribute('href') : null;

  isClickAnimating = true;

  // Agregar clase de transición a todos los ítems
  items.forEach(function(item) {
    item.classList.add('is-transitioning');
  });

  // Fase 1: expansión — el clicado sube a Y=0, los demás salen de cuadro
  items.forEach(function(item, i) {
    if (i === clickedIndex) {
      item.style.zIndex    = total;
      item.style.transform = 'translateY(0px)';
    } else if (i < clickedIndex) {
      // Ítems arriba: salen hacia arriba
      item.style.zIndex    = i;
      var upY = -(total - i) * bounds.stripH * 0.3;
      item.style.transform = 'translateY(' + upY + 'px)';
    } else {
      // Ítems abajo: salen hacia abajo
      item.style.zIndex    = total + i;
      var downY = bounds.containerH + (i - clickedIndex) * 20;
      item.style.transform = 'translateY(' + downY + 'px)';
    }
  });

  // Fase 2: fade out de todos los ítems (a los 500ms)
  setTimeout(function() {
    items.forEach(function(item) {
      item.classList.add('is-fading');
    });
  }, 500);

  // Fase 3: cerrar menú y hacer scroll suave al destino (a los 1000ms)
  setTimeout(function() {
    resetClickState();
    closeMenu();

    // Scroll suave hacia la sección destino del link
    if (targetHref && targetHref !== '#') {
      var targetEl = document.querySelector(targetHref);
      if (targetEl) {
        setTimeout(function() {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, 1000);
});

/**
 * Restaura el estado inicial de todos los ítems:
 * elimina clases de animación y limpia estilos inline.
 */
function resetClickState() {
  isClickAnimating = false;
  items.forEach(function(item) {
    item.classList.remove('is-transitioning', 'is-fading');
    item.style.zIndex    = '';
    item.style.transform = '';
  });
}
