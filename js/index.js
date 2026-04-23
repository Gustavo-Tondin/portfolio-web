/*------------------------------------------------------------*\
        portfolio.js

        Script organizado en un único IIFE para evitar conflictos entre módulos.

        Estructura:
            1. Elementos globales compartidos
            2. Hero Scroll  — morphing de imagen al hacer scroll
            3. Menu         — toggle con animación de la píldora
            4. Main Links   — cascada animada al navegar
            5. Next Section — card fixo de próxima secção (main-links__item--next)
            6. Spotlight    — cursor-tracking con rotación de imágenes
            7. Reveal       — aparición de elementos con IntersectionObserver
            8. Showcase     — layout de dos columnas de branding.html
    \*------------------------------------------------------------*/

(function () {
    /* ==================================================================================
        1. Elementos globales compartidos
    ================================================================================== */

    const header = document.getElementById("siteHeader");
    const navigation = document.getElementById("navigation");
    const nextCard = document.querySelector(".main-links__item--next");
    const nextLink = nextCard?.querySelector("a");

    /* ==================================================================================
        2. Hero Scroll: Animación de imagen al hacer scroll
    ================================================================================== */

    const scrollImage = document.getElementById("scrollImage");
    const imageTarget = document.getElementById("aboutImageTarget");
    const aboutContent = document.querySelector(".about__content");
    const heroContent = document.querySelector(".hero");

    /* el efecto scroll solo se activa si todos los elementos necesarios están en la página */
    if (scrollImage && imageTarget && heroContent && aboutContent) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const vw = document.documentElement.clientWidth;

            const isMobile = vw <= 720;

            const progress = Math.min(scrollY / (vh * 0.8), 1);
            const target = imageTarget.getBoundingClientRect();
            const ip = Math.min(progress / 0.8, 1);

            if (ip < 1) {
                scrollImage.style.cssText = `
                        top: ${(target.top + scrollY) * ip}px;
                        left: ${target.left * ip}px;
                        width: ${vw + (target.width - vw) * ip}px;
                        height: ${vh + (target.height - vh) * ip}px;
                    `;
            } else {
                scrollImage.style.cssText = `
                        top: ${target.top + scrollY}px;
                        left: ${target.left}px;
                        width: ${target.width}px;
                        height: ${target.height}px;
                    `;
            }

            const fade = Math.max(1 - progress * 6, 0);
            heroContent.style.opacity = fade;
            heroContent.style.transform = `translateY(${-progress * 200}px)`;

            header?.classList.toggle("is-visible", progress > 0.4);
            aboutContent.classList.toggle("is-visible", progress > 0.8);

            if (!isMobile) { /* el efecto de animación es desactivado en mobile */
                const ap = Math.max((progress - 0.8) / 0.2, 0);
                aboutContent.style.transform = `translateY(${(1 - ap) * 50}px) translateX(${(1 - ap) * 200}px)`;
            } else {
                aboutContent.style.transform = "";
            }
        });
    }

    /* ==================================================================================
        3. Menu: toggle del menú con animación en css.
    ================================================================================== */

    /* Elementos del menú de navegación */
    const menuBtn = document.getElementById("menuButton");
    const btnText = menuBtn?.querySelector(".nav-link__text");
    const mainLinks = document.querySelector(".main-links");

    /* Seleciona todos los ítems de navegación excepto la card de próxima sección */
    const linkItems = Array.from(
        document.querySelectorAll(
            ".main-links__item:not(.main-links__item--next)",
        ),
    );

    /* toggle del menú: añade/quita la clase is-menu-open en el header para activar la animación en CSS. */
    const toggleMenu = () => {
        const isOpen = header?.classList.toggle("is-menu-open");
        if (btnText) btnText.textContent = isOpen ? "Cerrar" : "Menu";
        menuBtn?.setAttribute("aria-expanded", String(!!isOpen));
        navigation?.setAttribute("aria-hidden", String(!isOpen));
    };

    /* Abre o cierra el menú al hacer clic en el botón */
    menuBtn?.addEventListener("click", toggleMenu);

    /* Cierra el menú al presionar Escape para mejorar la accesibilidad por teclado */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && header?.classList.contains("is-menu-open"))
            toggleMenu();
    });

    /* ==================================================================================
        4. Main Links: animación en cascada al navegar entre páginas
    ================================================================================== */

    /* Tag para bloquear clics mientras la animación de salida está en curso */
    let isNavigating = false;

    /* EventListener de click que empieza la animación de salida en cascada y cambia de página al finalizar */
    mainLinks?.addEventListener("click", (e) => {
        /* Hace con que el click funcione en todo el card */
        const link = e.target.closest("a"); 
        const item = link?.closest(".main-links__item");

        /* Ignora clics fuera de un enlace válido o durante una navegación activa */
        if (!item || isNavigating) return;

        /* Evita que el click cambie de página inmediatamente */
        e.preventDefault();
        isNavigating = true;

        const href = link.getAttribute("href");

        /* Lee el índice del ítem clickeado desde la variable CSS */
        const clickedIdx = Number(item.style.getPropertyValue("--index"));

        /* Resalta el ítem seleccionado y aplica el retraso en cascada al resto (cuanto más lejos, mayor retraso) */
        item.classList.add("is-focused"); /* fase 1 animación: el item seleccionado sube y los demás se bajan */
        linkItems.forEach((el, i) => {  
            if (i === clickedIdx) return;
            el.querySelector("a").style.transitionDelay =
                `${Math.abs(i - clickedIdx) * 0.2}s`;
            el.classList.add("is-diving");
        });

        /* setTimeout para gestionar el tiempo de la animación */
        setTimeout(() => { /* fase 2: el item seleccionado baja y el header vuelve a su posición original */
            header?.classList.remove("is-menu-open");
            item.classList.replace("is-focused", "is-leaving");
            setTimeout(() => { /* fase 3: la pagina cambia */
                window.location.href = href;
            }, 300);
        }, 700);
    });

    /* ==================================================================================
        5. Next Section: Card que aparece al llegar al final de la página para invitar a descubrir la siguiente sección.
    ================================================================================== */
    /*
    - En páginas normales: busca [data-next-section] en el DOM y usa un IntersectionObserver.
    - En el showcase de proyectos (branding, web-design, etc.): el Módulo 8 accede a nextCard directamente al compartir el mismo ámbito.
    */
    const nextSection = document.querySelector("[data-next-section]");

    if (nextCard) {

        if (nextSection) {
            new IntersectionObserver(([entry]) => {
                if (!isNavigating) nextCard.classList.toggle("is-ready", entry.isIntersecting);
            }).observe(nextSection);
        }

        /* Al hacer click hace una animación y después cambia de pagina. */
        nextLink?.addEventListener("click", (e) => {
            if (isNavigating) return;
            e.preventDefault();
            isNavigating = true;

            nextCard.classList.replace("is-ready", "is-focused");

            // Timers encadeados de forma mais limpa
            setTimeout(() => {
                nextCard.classList.replace("is-focused", "is-leaving");
                setTimeout(() => window.location.href = nextLink.href, 500);
            }, 700);
        });
    }

    /* ==================================================================================
        6. Spotlight: Preview de proyectos en rotación al pasar el cursor por los ítems del marquee.
    ================================================================================== */

    const marquee = document.querySelector(".marquee");

    if (marquee) {
        /* 3 imágenes por categoría — rutas reales dentro de media/projects/<cat>/<proyecto>/ */
        const previews = {
            "branding": [
                "media/projects/branding/refiori/branding-refiori-00.jpg",
                "media/projects/branding/wote/branding-wote-00.jpg",
                "media/projects/branding/tondafoto/branding-tonda-foto-00.jpg"
            ],
            "web-design": [
                "media/projects/web-design/riwer-labs/web-riwerlabs-desktop-00-hero.jpg",
                "media/projects/web-design/eners/web-eners-desktop-00-hero.jpg",
                "media/projects/web-design/identiduca/web-identiduca-desktop-00-hero.jpg"
            ],
            "artes-graficas": [
                "media/projects/artes-graficas/gauja-lab/social-media-gauja-lab-00.jpg",
                "media/projects/artes-graficas/identiduca/zine-identiduca-00.jpg",
                "media/projects/artes-graficas/gauja-lab/social-media-gauja-lab-05.jpg"
            ],
            "fotografia": [
                "media/projects/fotografia/aline-e-eduardo/ensaio-aline-e-eduardo-00.jpg",
                "media/projects/fotografia/carol/ensaio-carol-00.jpg",
                "media/projects/fotografia/valeria/ensaio-valeria-00.jpg"
            ]
        };

        marquee.querySelectorAll(".marquee__item").forEach((item) => {
            const img = item.querySelector("[data-preview]");
            const images = previews[item.dataset.category];
            if (!img || !images) return;

            let rotateId = null;

            item.addEventListener("mouseenter", () => {
                const r = item.getBoundingClientRect();
                img.style.left = `${r.left + r.width / 2}px`;
                img.style.top = `${r.top - img.height - 20}px`;
                img.classList.add("is-visible");

                let i = 0;
                img.src = images[0];
                rotateId = setInterval(() => {
                    img.src = images[++i % images.length];
                }, 1000);
            });

            item.addEventListener("mouseleave", () => {
                img.classList.remove("is-visible");
                clearInterval(rotateId);
                rotateId = null;
            });
        });
    }

    /* 7. Reveal on Scroll ====================================================== */

    /* Selecciona todos los elementos marcados para aparecer al entrar en el viewport */
    const revealEls = document.querySelectorAll(".reveal");

    if (revealEls.length && "IntersectionObserver" in window) {

        /**
         * Observa cada elemento .reveal y añade is-visible cuando entra en el viewport.
         * Se deja de observar el elemento después de su primera aparición
         * para no repetir la animación ni consumir recursos innecesarios.
         */
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    e.target.classList.add("is-visible");

                    /* Deja de observar tras la primera activación */
                    obs.unobserve(e.target);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* ==================================================================================
        8. Showcase — lógica del layout de dos columnas (branding.html)
        Se activa solo si el elemento [data-showcase] está presente en el DOM.
    ================================================================================== */

    /* Aborta la ejecución si la página no contiene el layout de showcase */
    const showcaseEl = document.querySelector("[data-showcase]");
    if (showcaseEl) {

        /* Elementos estructurales del showcase */
        const scroller = showcaseEl.querySelector("[data-showcase-scroller]");
        const sections = showcaseEl.querySelectorAll(".showcase__section");
        const listItems = showcaseEl.querySelectorAll(".showcase__list-item");
        const total = sections.length;

        /* Índice de la sección actualmente visible */
        let currentIndex = 0;

        /* ── helpers ──────────────────────────────────────────────────────────────────── */

        /**
         * Limita un índice al rango válido de secciones del showcase.
         *
         * @param {number} n - El índice a limitar
         * @returns {number} El índice dentro del rango [0, total - 1]
         */
        function clamp(n) {
            return Math.max(0, Math.min(total - 1, n));
        }

        /**
         * Desplaza el scroll del showcase hasta la sección indicada.
         *
         * @param {number} index - El índice de la sección de destino
         */
        function scrollTo(index) {
            sections[clamp(index)]?.scrollIntoView({ behavior: "smooth" });
        }

        /* ── estado central ───────────────────────────────────────────────────────────── */

        /**
         * Sincroniza el estado activo del showcase: actualiza el ítem destacado
         * en la lista lateral, la sección visible en el scroller y la visibilidad
         * de la card de siguiente sección al llegar al último proyecto.
         *
         * @param {number} index - El índice de la sección que pasa a estar activa
         */
        function setActive(index) {
            currentIndex = clamp(index);

            /* Marca el ítem de lista correspondiente a la sección activa */
            listItems.forEach((el, j) =>
                el.classList.toggle("is-active", j === currentIndex),
            );

            /* Marca la sección activa para controlar su visibilidad desde CSS */
            sections.forEach((el, j) =>
                el.classList.toggle("is-in-view", j === currentIndex),
            );

            /* Muestra la card de siguiente sección solo al llegar al último proyecto */
            nextCard?.classList.toggle("is-ready", currentIndex === total - 1);
        }

        /* ── eventos ──────────────────────────────────────────────────────────────────── */

        /**
         * Navega a la sección correspondiente al hacer clic en un enlace de la lista lateral.
         * Ignora el clic si el ítem ya está activo para evitar scroll innecesario.
         *
         * @param {Event} evento - El evento de clic sobre .showcase__list-link
         */
        showcaseEl.querySelectorAll(".showcase__list-link").forEach((link) => {
            link.addEventListener("click", (e) => {
                if (
                    link
                        .closest(".showcase__list-item")
                        ?.classList.contains("is-active")
                )
                    return;
                e.preventDefault();
                scrollTo(+link.dataset.index);
            });
        });

        /**
         * Redirige el scroll del wheel desde el área exterior hacia el scroller interno.
         * Evita el scroll nativo de la página cuando el usuario hace wheel fuera del scroller,
         * manteniendo el control de la navegación dentro del showcase.
         *
         * @param {WheelEvent} evento - El evento de rueda del ratón
         */
        window.addEventListener(
            "wheel",
            (e) => {
                /* Solo intercepta el wheel si el origen no está dentro del scroller */
                if (!scroller || scroller.contains(e.target)) return;
                e.preventDefault();
                scroller.scrollBy({ top: e.deltaY, behavior: "auto" });
            },
            { passive: false },
        );

        /* ── IntersectionObserver ─────────────────────────────────────────────────────── */

        /**
         * Detecta qué sección del showcase ocupa más del 50% del scroller visible
         * y actualiza el estado activo en consecuencia.
         * Se usa root: scroller para observar dentro del contenedor con scroll propio.
         */
        if ("IntersectionObserver" in window && scroller) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting)
                            setActive(+entry.target.dataset.index);
                    });
                },
                { root: scroller, threshold: 0.5 },
            );

            sections.forEach((s) => observer.observe(s));
        }

        /* Inicializa el showcase con la primera sección activa al cargar la página */
        setActive(0);
    }
})();