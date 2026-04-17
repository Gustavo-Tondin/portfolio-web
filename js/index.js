/*------------------------------------------------------------*\
    portfolio.js

    Script organizado en IIFEs para evitar conflictos entre módulos.

    Estructura:
        1. Elementos globales compartidos
        2. Hero Scroll  — morphing de imagen al hacer scroll
        3. Menu         — toggle con animación de la píldora
        4. Main Links   — cascada animada al navegar
        5. Next Section — barra de navegación al pie de página
        6. Spotlight    — cursor-tracking con rotación de imágenes
        7. Reveal       — aparición de elementos con IntersectionObserver
        8. Showcase     — layout de dos columnas de branding.html
\*------------------------------------------------------------*/

/* ==================================================================================
   Módulos 1–7: lógica global del portfolio
================================================================================== */
(function () {
    /* 1. Elementos globales compartidos ====================================================== */

    const header     = document.getElementById("siteHeader");
    const navigation = document.getElementById("navigation");

    /* 2. Hero Scroll ====================================================== */

    const scrollImage  = document.getElementById("scrollImage");
    const imageTarget  = document.getElementById("aboutImageTarget");
    const aboutContent = document.querySelector(".about__content");
    const heroContent  = document.querySelector(".hero");

    /* el efecto scroll solo se activa si todos los elementos necesarios están en el DOM */
    if (scrollImage && imageTarget && heroContent && aboutContent) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;
            const vh      = window.innerHeight;
            const vw      = document.documentElement.clientWidth;

            /* cálculo del progreso de la animación en relación con la altura de la pantalla */
            const progress = Math.min(scrollY / (vh * 0.8), 1);
            const target   = imageTarget.getBoundingClientRect();

            /* ip: la imagen termina antes de que finalice la animación completa */
            const ip = Math.min(progress / 0.8, 1);

            if (ip < 1) {
                /* estado en transición */
                scrollImage.style.cssText = `
                    position: fixed;
                    top: ${target.top * ip}px;
                    left: ${target.left * ip}px;
                    width: ${vw + (target.width - vw) * ip}px;
                    height: ${vh + (target.height - vh) * ip}px;
                `;
            } else {
                /* estado final: la imagen queda en su posición definitiva */
                scrollImage.style.cssText = `
                    position: absolute;
                    top: ${target.top + scrollY}px;
                    left: ${target.left}px;
                    width: ${target.width}px;
                    height: ${target.height}px;
                `;
            }

            /* multiplicación para agilizar la salida del contenido del hero */
            const fade = Math.max(1 - progress * 6, 0);
            heroContent.style.opacity   = fade;
            heroContent.style.transform = `translateY(${-progress * 200}px)`;

            header?.classList.toggle("is-visible", progress > 0.4);
            aboutContent.classList.toggle("is-visible", progress > 0.8);

            /* ap: el contenido del about empieza a moverse en 0.8 */
            const ap = Math.max((progress - 0.8) / 0.2, 0);
            aboutContent.style.transform = `translateY(${(1 - ap) * 50}px) translateX(${(1 - ap) * 200}px)`;
        });
    }

    /* 3. Menu ====================================================== */

    const menuBtn  = document.getElementById("menuButton");
    const btnText  = menuBtn?.querySelector(".nav-link__text");
    const mainLinks = document.querySelector(".main-links");
    const linkItems = Array.from(document.querySelectorAll(".main-link-item"));

    /* 3.1. Abrir/Cerrar Menu */
    const toggleMenu = () => {
        const isOpen = header?.classList.toggle("is-menu-open");
        if (btnText) btnText.textContent = isOpen ? "Cerrar" : "Menu";

        /* sincronizamos el estado ARIA para garantir la accesibilidad */
        menuBtn?.setAttribute("aria-expanded", String(!!isOpen));
        navigation?.setAttribute("aria-hidden", String(!isOpen));
    };

    menuBtn?.addEventListener("click", toggleMenu);

    document.addEventListener("keydown", (e) => {
        /* cerrar el menu con ESC */
        if (e.key === "Escape" && header?.classList.contains("is-menu-open"))
            toggleMenu();
    });

    let isNavigating = false; /* estado de animación para evitar la repetición de animaciones */

    /* 4. Main Links: salida organizada de los enlaces ====================================================== */
    mainLinks?.addEventListener("click", (e) => {
        /* obtiene el enlace y el elemento de la lista correspondiente al clic */
        const link = e.target.closest("a");
        const item = link?.closest(".main-link-item");

        if (!item || isNavigating) return;

        e.preventDefault(); /* impide el avance automático a la página siguiente */
        isNavigating = true;

        const href       = link.getAttribute("href");
        const clickedIdx = parseInt(item.style.getPropertyValue("--index"), 10);

        /* Paso 1: el ítem sube y los demás se sumergen en cascada */
        item.classList.add("is-focused");
        linkItems.forEach((el, i) => {
            if (i === clickedIdx) return;
            el.querySelector("a").style.transitionDelay =
                `${Math.abs(i - clickedIdx) * 0.2}s`; /* retraso por distancia del item clicado */
            el.classList.add("is-diving");
        });

        /* Paso 2: esperamos para cerrar el menu */
        setTimeout(() => {
            /* Paso 3: cerrar overlay */
            header?.classList.remove("is-menu-open");

            /* Paso 4: el item enfocado sale de pantalla */
            setTimeout(() => {
                item.classList.add("is-leaving");

                /* Paso 5: navegar a la página destino */
                setTimeout(() => {
                    window.location.href = href;
                }, 1000);
            }, 300);
        }, 800);
    });

    /* 5. Next Section ====================================================== */
    const nextSections = document.querySelectorAll("[data-next-section]");
    if (!nextSections.length || !("IntersectionObserver" in window)) return;

    let isNextNavigating = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (
                    target.classList.contains("is-rising") ||
                    target.classList.contains("is-dropping")
                )
                    return;
                target.classList.toggle("is-ready", isIntersecting);
            });
        },
        { threshold: 0 },
    );

    nextSections.forEach((section) => {
        observer.observe(section);
        section.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            if (!link || isNextNavigating) return;
            e.preventDefault();
            isNextNavigating = true;
            const href = link.getAttribute("href");
            section.classList.add("is-rising");
            setTimeout(
                () => section.classList.replace("is-rising", "is-dropping"),
                950,
            );
            setTimeout(() => (window.location.href = href), 1600);
        });
    });

    /* 6. Spotlight ====================================================== */

    const spotlights = document.querySelectorAll("[data-spotlight]");
    const projects   = window.PROJECTS || [];

    if (spotlights.length && projects.length) {
        /* agrupa las imágenes de portada por categoría */
        const catImages = projects.reduce((acc, p) => {
            if (p?.category && p?.cover) {
                (acc[p.category] ??= []).push(
                    p.cover.placeholder || `${p.cover.base}.webp`,
                );
            }
            return acc;
        }, {});

        spotlights.forEach((container) => {
            const wrap  = container.querySelector("[data-spotlight-wrap]");
            const layer = container.querySelector("[data-spotlight-layer]");
            if (!wrap || !layer) return;

            let rotateId, ticking;

            /* actualiza la posición del cursor via CSS custom properties.
               requestAnimationFrame optimiza la renderización */
            container.addEventListener(
                "mousemove",
                (e) => {
                    if (ticking) return;
                    ticking = true;
                    requestAnimationFrame(() => {
                        const r = wrap.getBoundingClientRect();
                        wrap.style.setProperty("--cursor-x", `${e.clientX - r.left}px`);
                        wrap.style.setProperty("--cursor-y", `${e.clientY - r.top}px`);
                        ticking = false;
                    });
                },
                { passive: true },
            );

            container
                .querySelectorAll("[data-spotlight-trigger]")
                .forEach((trigger) => {
                    trigger.addEventListener("mouseenter", () => {
                        container.classList.add("is-hover");
                        const imgs = catImages[trigger.dataset.category] || [];
                        if (!imgs.length) return;

                        let i = 0;
                        layer.style.backgroundImage = `url("${imgs[0]}")`;

                        if (imgs.length > 1) {
                            rotateId = setInterval(() => {
                                layer.style.backgroundImage = `url("${imgs[++i % imgs.length]}")`;
                            }, 1400);
                        }
                    });

                    trigger.addEventListener("mouseleave", () => {
                        container.classList.remove("is-hover");
                        clearInterval(rotateId);
                    });
                });
        });
    }

    /* 7. Reveal on Scroll ====================================================== */

    const revealEls = document.querySelectorAll(".reveal");

    /* IntersectionObserver evita problemas de performance en el scroll */
    if (revealEls.length && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    e.target.classList.add("is-visible");
                    obs.unobserve(e.target);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    }
})();


/* ==================================================================================
   Módulo 8: Showcase — lógica del layout de dos columnas (branding.html)
   Se activa solo si el elemento [data-showcase] está presente en el DOM.
================================================================================== */
(function () {
    'use strict';

    /* referencias — se leen una sola vez al cargar el DOM */
    const showcaseEl = document.querySelector('[data-showcase]');
    if (!showcaseEl) return;

    const listItems  = showcaseEl.querySelectorAll('.showcase__list-item');
    const linkEls    = showcaseEl.querySelectorAll('.showcase__list-link');
    const sections   = showcaseEl.querySelectorAll('.showcase__section');
    const scroller   = showcaseEl.querySelector('[data-showcase-scroller]');
    const counterEl  = showcaseEl.querySelector('[data-showcase-counter]');
    const progressEl = showcaseEl.querySelector('[data-showcase-progress]');
    const hintEl     = showcaseEl.querySelector('[data-showcase-hint]');
    const total      = sections.length;

    /* estado mínimo de interacción */
    let hasScrolled = false;

    /* setActiveHandler — marca el proyecto activo en los 4 sitios:
       lista izquierda, sección (para la animación del scale), contador
       y altura de la línea de progreso. ====================================================== */
    function setActiveHandler(index) {
        const safeIndex = Math.max(0, Math.min(total - 1, index));

        listItems.forEach(function (el, i) {
            el.classList.toggle('is-active', i === safeIndex);
        });
        sections.forEach(function (el, i) {
            el.classList.toggle('is-in-view', i === safeIndex);
        });

        if (counterEl) {
            counterEl.textContent =
                String(safeIndex + 1).padStart(2, '0') +
                ' / ' +
                String(total).padStart(2, '0');
        }
        if (progressEl) {
            progressEl.style.height = ((safeIndex + 1) / total) * 100 + '%';
        }
    }

    /* clickHandler — clic sobre un proyecto de la lista: scroll suave
       a la sección correspondiente (si existe). ====================================================== */
    function clickHandler(event) {
        event.preventDefault();
        const idx = parseInt(this.getAttribute('data-index'), 10) || 0;
        if (sections[idx]) {
            sections[idx].scrollIntoView({ behavior: 'smooth' });
        }
    }

    /* scrollHandler — primera interacción con el scroller → esconde
       la pista animada (solo ocurre una vez por carga). ====================================================== */
    function scrollHandler() {
        if (hasScrolled) return;
        hasScrolled = true;
        if (hintEl) hintEl.classList.add('is-hidden');
    }

    /* keyHandler — navegación por teclado (↑/↓) entre secciones ====================================================== */
    function keyHandler(event) {
        const active  = showcaseEl.querySelector('.showcase__list-item.is-active');
        const current = active
            ? parseInt(active.getAttribute('data-index'), 10)
            : 0;

        if (event.key === 'ArrowDown' && current < total - 1) {
            sections[current + 1].scrollIntoView({ behavior: 'smooth' });
        }
        if (event.key === 'ArrowUp' && current > 0) {
            sections[current - 1].scrollIntoView({ behavior: 'smooth' });
        }
    }

    /* observer — la sección visible >= 50 % dispara el cambio de estado ====================================================== */
    if ('IntersectionObserver' in window && scroller) {
        const sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setActiveHandler(
                        parseInt(entry.target.getAttribute('data-index'), 10)
                    );
                }
            });
        }, { root: scroller, threshold: 0.5 });

        sections.forEach(function (section) {
            sectionObserver.observe(section);
        });
    }

    /* enlaces del listado + eventos globales */
    linkEls.forEach(function (link) {
        link.addEventListener('click', clickHandler);
    });

    if (scroller) {
        scroller.addEventListener('scroll', scrollHandler, { passive: true });
    }

    /* delegação de wheel — scroll funciona em qualquer parte da tela,
       não só sobre as imagens da direita */
    window.addEventListener('wheel', function (event) {
        if (!scroller) return;
        /* evita conflito se o evento já aconteceu dentro do próprio scroller */
        if (scroller.contains(event.target)) return;
        event.preventDefault();
        scroller.scrollBy({ top: event.deltaY, behavior: 'auto' });
    }, { passive: false });

    document.addEventListener('keydown', keyHandler);

    /* estado inicial explícito */
    setActiveHandler(0);
})();