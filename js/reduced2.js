/*------------------------------------------------------------*\
    portfolio.js

    Script organizado en IIFE para evitar problemas con otros scripts, como el de la información de los proyectos.

    Estructura:
        1. Elementos globales compartidos
        2. Hero Scroll — morphing de imagen al hacer scroll
        3. Menu — toggle con animación de la píldora
        4. Main Links — cascada animada al navegar
        5. Spotlight — cursor-tracking con rotación de imágenes
        6. Reveal — aparición de elementos con IntersectionObserver
        7. Next  — barra de navegación al pie de página
\*------------------------------------------------------------*/

(function () {
    "use strict";

    // Variables compartidas entre módulos
    const header     = document.getElementById("siteHeader");
    const navigation = document.getElementById("navigation");

    /* ── Hero Scroll ──────────────────────────────────────────── */

    const scrollImage  = document.getElementById("scrollImage");
    const imageTarget  = document.getElementById("aboutImageTarget");
    const aboutContent = document.querySelector(".about__content");
    const heroTop      = document.querySelector(".hero__top");
    const heroInfo     = document.querySelector(".hero__info");
    const heroNav      = document.querySelector(".hero__side-nav");

    if (scrollImage && imageTarget && heroTop && heroInfo && heroNav && aboutContent) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;
            const vh      = window.innerHeight;
            // clientWidth excluye la scrollbar para evitar overflow horizontal
            const vw      = document.documentElement.clientWidth;
            // 0.8 = el morph completa en el 70% del primer viewport
            const progress       = Math.min(scrollY / (vh * 0.7), 1);
            const target       = imageTarget.getBoundingClientRect();

            // position:fixed durante el morph; absolute al terminar para no
            // bloquear el scroll de las secciones siguientes
            if (progress < 1) {
                scrollImage.style.cssText = `
                    position: fixed;
                    top: ${target.top * progress}px;
                    left: ${target.left * progress}px;
                    width: ${vw + (target.width - vw) * progress}px;
                    height: ${vh + (target.height - vh) * progress}px;
                `;
            } else {
                scrollImage.style.cssText = `
                    position: absolute;
                    top: ${target.top + scrollY}px;
                    left: ${target.left}px;
                    width: ${target.width}px;
                    height: ${target.height}px;
                `;
            }

            // x4 acelera la salida del contenido hero
            const fade = Math.max(1 - progress * 4, 0);
            heroTop.style.opacity = heroInfo.style.opacity = heroNav.style.opacity = fade;
            heroTop.style.transform = `translateY(${-progress * 200}px)`;

            header?.classList.toggle("is-visible", progress > 0.4);
            aboutContent.classList.toggle("is-visible", progress > 0.8);

            // Remapeamos el rango 0.8→1 a 0→1 para la entrada del about
            const ap = Math.max((p - 0.8) / 0.2, 0);
            aboutContent.style.transform = `translateY(${-(1-ap)*50}px) translateX(${(1-ap)*200}px)`;
        }, { passive: true }); // passive:true porque nunca llamamos preventDefault
    }

    /* ── Menu ─────────────────────────────────────────────────── */

    const openMenuBtn   = document.getElementById("openMenuHeader");
    const closeMenuBtn  = document.getElementById("closeMenu");
    const menuPillText  = document.querySelector("#openMenuHeader .nav-link__text");
    // Array para poder acceder por índice en la animación de cascada (Main Links)
    const mainLinkItems = Array.from(document.querySelectorAll(".main-link-item"));

    let isClickAnimating = false;

    /**
     * Limpia el estado de animación de los links del menú.
     * Se llama al cerrar para que la siguiente apertura parta limpia.
     * @return {undefined}
     */
    const resetMainLinks = () => {
        isClickAnimating = false;
        mainLinkItems.forEach(item => {
            item.classList.remove("is-clicked", "is-dropped");
            const a = item.querySelector("a");
            if (a) a.style.animationDelay = "";
        });
    };

    /**
     * Abre o cierra el menú con su animación de píldora.
     * Ignora clics mientras está cerrando para evitar estados intermedios.
     * @return {undefined}
     */
    const toggleMenu = () => {
        if (!navigation) return;
        // Bloqueo durante el cierre para no romper la animación CSS (700ms)
        if (navigation.classList.contains("is-closing")) return;

        const isOpen = navigation.classList.contains("is-open");
        navigation.classList.toggle("is-open", !isOpen);
        header?.classList.toggle("is-menu-open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
        if (menuPillText) menuPillText.textContent = isOpen ? "Menu" : "Cerrar";

        if (isOpen) {
            navigation.classList.add("is-closing");
            setTimeout(() => {
                navigation.classList.remove("is-closing");
                resetMainLinks();
            }, 700); // debe coincidir con la duración de la transición CSS
        }
    };

    openMenuBtn?.addEventListener("click", toggleMenu);
    closeMenuBtn?.addEventListener("click", toggleMenu);
    // Cierre accesible por teclado
    document.addEventListener("keydown", e =>
        e.key === "Escape" && navigation?.classList.contains("is-open") && toggleMenu()
    );

    /* ── Main Links ───────────────────────────────────────────── */

    const mainLinks = document.querySelector(".main-links");

    /**
     * Anima en cascada los items del menú al navegar: los ítems más
     * alejados del clicado caen primero, luego cae el clicado revelando
     * la página destino. El delay es proporcional a la distancia al ítem clicado.
     * @param {MouseEvent} e — Evento de clic delegado en .main-links
     * @return {undefined}
     */
    mainLinks?.addEventListener("click", e => {
        const link        = e.target.closest("a");
        const clickedItem = link?.closest(".main-link-item");
        if (!clickedItem || isClickAnimating) return;

        e.preventDefault();
        isClickAnimating = true;

        const href         = link.getAttribute("href");
        const clickedIndex = parseInt(clickedItem.style.getPropertyValue("--index"), 10);

        // reduce acumula el delay máximo para saber cuándo programar la fase final
        const maxDelay = mainLinkItems.reduce((max, item, i) => {
            if (i === clickedIndex) { item.classList.add("is-clicked"); return max; }
            item.classList.add("is-dropped");
            const delay = Math.abs(i - clickedIndex) * 0.08;
            const a = item.querySelector("a");
            if (a) a.style.animationDelay = `${delay}s`;
            return Math.max(max, delay);
        }, 0);

        // +250ms de margen para que todos los ítems terminen su caída
        const fallMs = Math.round(maxDelay * 1000) + 250;
        setTimeout(() => clickedItem.classList.add("is-dropped"), fallMs);
        // +650ms para que la animación del ítem clicado complete antes de navegar
        setTimeout(() => (window.location.href = href), fallMs + 650);
    });

    /* ── Spotlight Marquee ────────────────────────────────────── */

    const spotlights = document.querySelectorAll("[data-spotlight]");
    const projects   = window.PROJECTS || [];

    if (spotlights.length && projects.length) {
        // Agrupa las imágenes de portada por categoría para rotarlas en hover
        const catImages = projects.reduce((acc, p) => {
            if (p?.category && p?.cover)
                // ??= evita sobreescribir arrays ya creados (nullish assignment)
                (acc[p.category] ??= []).push(p.cover.placeholder || `${p.cover.base}.webp`);
            return acc;
        }, {});

        spotlights.forEach(container => {
            const wrap  = container.querySelector("[data-spotlight-wrap]");
            const layer = container.querySelector("[data-spotlight-layer]");
            if (!wrap || !layer) return;

            let rotateId, ticking;

            /**
             * Actualiza las custom properties de posición del cursor para el
             * efecto de spotlight en CSS. requestAnimationFrame evita disparar
             * cambios de estilo más rápido de lo que el navegador puede pintar.
             * @param {MouseEvent} e
             * @return {undefined}
             */
            container.addEventListener("mousemove", e => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    const r = wrap.getBoundingClientRect();
                    wrap.style.setProperty("--cursor-x", `${e.clientX - r.left}px`);
                    wrap.style.setProperty("--cursor-y", `${e.clientY - r.top}px`);
                    ticking = false;
                });
            }, { passive: true });

            container.querySelectorAll("[data-spotlight-trigger]").forEach(trigger => {
                trigger.addEventListener("mouseenter", () => {
                    container.classList.add("is-hover");
                    const imgs = catImages[trigger.dataset.category] || [];
                    if (!imgs.length) return;
                    let i = 0;
                    layer.style.backgroundImage = `url("${imgs[0]}")`;
                    // Solo rotamos si hay más de una imagen para la categoría
                    if (imgs.length > 1)
                        rotateId = setInterval(() => {
                            layer.style.backgroundImage = `url("${imgs[++i % imgs.length]}")`;
                        }, 1400);
                });
                trigger.addEventListener("mouseleave", () => {
                    container.classList.remove("is-hover");
                    clearInterval(rotateId);
                });
            });
        });
    }

    /* ── Reveal on Scroll ─────────────────────────────────────── */

    const revealEls = document.querySelectorAll(".reveal");

    // IntersectionObserver en lugar de scroll listener: el navegador solo
    // notifica cuando el elemento cruza el umbral, sin polling continuo
    if (revealEls.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                e.target.classList.add("is-visible");
                // unobserve tras la primera aparición porque la animación no se repite
                obs.unobserve(e.target);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

        revealEls.forEach(el => observer.observe(el));
    }

    /* ── Next Section ─────────────────────────────────────────── */

    const nextSections = document.querySelectorAll("[data-next-section]");

    if (nextSections.length && "IntersectionObserver" in window) {
        // Scoped aquí porque solo aplica a esta barra de navegación
        let isNextAnimating = false;

        /**
         * Anima la barra de siguiente sección: sube cubriendo el viewport
         * (is-rising) y luego cae (is-dropping) antes de navegar.
         * @param {MouseEvent} e — Evento de clic delegado en [data-next-section]
         * @return {undefined}
         */
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                // No interrumpir si ya está en medio de la animación de clic
                if (e.target.classList.contains("is-rising") || e.target.classList.contains("is-dropping")) return;
                e.target.classList.toggle("is-ready", e.isIntersecting);
            });
        }, { threshold: 0 });

        nextSections.forEach(section => {
            observer.observe(section);
            section.addEventListener("click", e => {
                const link = e.target.closest("a");
                if (!link || isNextAnimating) return;
                e.preventDefault();
                isNextAnimating = true;
                const href = link.getAttribute("href");
                section.classList.add("is-rising");
                // 950ms = duración de la animación bouncy de subida (CSS)
                setTimeout(() => section.classList.replace("is-rising", "is-dropping"), 950);
                // 950 + 650ms para que el slide-out complete antes de navegar
                setTimeout(() => (window.location.href = href), 1600);
            });
        });
    }
})();