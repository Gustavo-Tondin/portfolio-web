/* ========================================================================= 
    Portfolio — JavaScript principal
   
    Script organizado en IIFE para evitar problemas con otros scripts, como el de la información de los proyectos.

    Módulos (en orden de aparición):
    1. Hero Scroll - morphing de la imagen del hero al hacer scroll
    2. Menu - toggle con animación letra a letra de la píldora
    3. Anchors - scroll suave para enlaces internos (#seccion)
    4. Main Links - cascada animada al navegar desde el menú principal
    5. Marquee - hover highlight sobre los items del marquee
    6. Reveal - aparición de elementos al entrar en el viewport
    7. Spotlight - cursor-tracking con rotación de imágenes por hover
    8. Next  - barra al final de la página con la misma animación del menu
========================================================================= */

(function () {
    "use strict"; // modo estricto para me ayudar a encontrar errores.***

    /* ========================================================================= 
       Elementos globales compartidos entre varios módulos. 
    =========================================================================  */

    //El header aparece en hero, menu y main-links; navigation lo usan menu, anchors y main-links. ***
    const header = document.getElementById("siteHeader");
    const navigation = document.getElementById("navigation");

    /* =====================================================================
       Módulo 1 — Hero Scroll (efecto morphing de la imagen)
       ---------------------------------------------------------------------
       La imagen del hero comienza ocupando toda la pantalla y, al hacer
       scroll, se encoge hasta encajar en la caja de la sección "sobre mí".
       Al mismo tiempo el contenido del hero se desvanece hacia arriba y
       el header aparece desde lo alto. Solo corre en index.html: si
       faltan elementos, el módulo no engancha ningún listener.
       ===================================================================== */

    // 1. Constantes de selección
    const scrollImage = document.getElementById("scrollImage");
    const imageTarget = document.getElementById("aboutImageTarget");
    const aboutContent = document.querySelector(".about__content");
    const heroTop = document.querySelector(".hero__top");
    const heroInfo = document.querySelector(".hero__info");
    const heroNav = document.querySelector(".hero__side-nav");

    // 2. Variables de estado (ninguna necesaria para este módulo)

    // 3. Funciones / Handlers

    /* scrollHandler
       Se dispara en cada evento de scroll. Calcula el progreso (0 a 1)
       sobre la primera pantalla, aplica el morphing a la imagen, el
       fade al contenido del hero y el estado visible al header y al
       bloque "sobre mí". Usa clientWidth en lugar de innerWidth para
       no contar la scrollbar vertical (evita overflow horizontal). */
    const scrollHandler = () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const vw = document.documentElement.clientWidth;
        const progress = Math.min(scrollY / (vh * 0.8), 1);
        const target = imageTarget.getBoundingClientRect();

        // Estado del morphing: mientras progress < 1 la imagen sigue al
        // cursor de scroll en fixed; al llegar a 1 se fija en absolute.
        const isMorphing = progress < 1;

        if (isMorphing) {
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

        /* Fade + desplazamiento del contenido del hero. El factor x10
           acelera la salida: todo queda fuera antes de que la imagen
           termine su morph, dejando la pantalla limpia para el about. */
        const heroOpacity = Math.max(1 - progress * 10, 0);
        heroTop.style.opacity = heroOpacity;
        heroInfo.style.opacity = heroOpacity;
        heroNav.style.opacity = heroOpacity;
        heroTop.style.transform = `translateY(${-(progress * 0.5) * 400}px)`;

        // Visibilidad del header y del bloque "sobre mí" por umbrales
        header && header.classList.toggle("is-visible", progress > 0.4);
        aboutContent.classList.toggle("is-visible", progress > 0.8);

        /* La entrada del about arranca cuando la imagen ya está casi
           colocada (progress > 0.8). Remapeamos 0.8→1 al rango 0→1
           para tener un progreso local del propio bloque. */
        const aboutProgress = Math.max((progress - 0.8) / 0.2, 0);
        const aboutInverse = 1 - aboutProgress;
        aboutContent.style.transform = `translateY(${-aboutInverse * 50}px) translateX(${aboutInverse * 200}px)`;
    };

    // 4. Asignaciones
    const hasHeroElements =
        scrollImage &&
        imageTarget &&
        heroTop &&
        heroInfo &&
        heroNav &&
        aboutContent;
    hasHeroElements &&
        window.addEventListener("scroll", scrollHandler, { passive: true });

        /* =====================================================================
        Módulo 2 — Menu (toggle)
        ===================================================================== */
     const openMenuBtn = document.getElementById("openMenuHeader");
     const closeMenuBtn = document.getElementById("closeMenu");
     const menuPillText = document.querySelector("#openMenuHeader .nav-link__text");
     const mainLinkItems = Array.from(document.querySelectorAll(".main-link-item"));
 
     let isClickAnimating = false;
 
     const resetMainLinksState = () => {
         isClickAnimating = false;
         mainLinkItems.forEach((item) => {
             item.classList.remove("is-clicked", "is-dropped");
             const link = item.querySelector("a");
             if (link) link.style.animationDelay = "";
         });
     };
 
     const toggleMenuHandler = () => {
         if (!navigation) return;
         const isOpen = navigation.classList.contains("is-open");
         const isClosing = navigation.classList.contains("is-closing");
         if (isClosing) return;
 
         if (isOpen) {
             navigation.classList.add("is-closing");
             header?.classList.remove("is-menu-open");
             
             if (menuPillText) menuPillText.textContent = "Menu"; // Protegido
 
             setTimeout(() => {
                 navigation.classList.remove("is-open", "is-closing");
                 document.body.classList.remove("menu-open");
                 resetMainLinksState();
             }, 700);
             return;
         }
 
         navigation.classList.add("is-open");
         header?.classList.add("is-menu-open");
         document.body.classList.add("menu-open");
         
         if (menuPillText) menuPillText.textContent = "Cerrar"; // Protegido
     };
 
     const escapeKeyHandler = (e) =>
         e.key === "Escape" && navigation?.classList.contains("is-open") && toggleMenuHandler();
 
     openMenuBtn?.addEventListener("click", toggleMenuHandler);
     closeMenuBtn?.addEventListener("click", toggleMenuHandler);
     document.addEventListener("keydown", escapeKeyHandler);

    /* =====================================================================
       Módulo 4 — Main Links (cascada animada al navegar)
       ---------------------------------------------------------------------
       Al clicar un enlace del menú principal, el resto de items cae en
       cascada con un delay proporcional a la distancia con el clicado.
       Cuando todos han caído, el propio clicado también cae revelando
       el fondo de la página destino, y finalmente se navega. Para
       enlaces internos (#algo) se usa scroll suave.

       Comparte las variables isClickAnimating y mainLinkItems con el
       Módulo 2 (Menu) porque ambos tocan los mismos <li>.
       ===================================================================== */

    // 1. Constantes de selección
    const mainLinks = document.querySelector(".main-links");

    // 3. Funciones / Handlers
    const mainLinksClickHandler = (e) => {
        const link = e.target.closest("a");
        if (!link) return;
        const clickedItem = link.closest(".main-link-item");
        if (!clickedItem || isClickAnimating) return;

        e.preventDefault();
        isClickAnimating = true;

        const targetHref = link.getAttribute("href");
        const clickedIndex = parseInt(
            clickedItem.style.getPropertyValue("--index"),
            10,
        );

        /* Fase 1 — cascada de caída. Cada item recibe un animationDelay
           proporcional a su distancia con el clicado; el clicado se
           mantiene arriba con la clase is-clicked. */
        let maxDropDelay = 0;
        mainLinkItems.forEach((item, i) => {
            if (i === clickedIndex) {
                item.classList.add("is-clicked");
                return;
            }
            item.classList.add("is-dropped");
            const dropLink = item.querySelector("a");
            const delay = Math.abs(i - clickedIndex) * 0.08;
            dropLink && (dropLink.style.animationDelay = `${delay}s`);
            if (delay > maxDropDelay) maxDropDelay = delay;
        });

        /* Fase 2 — cuando todos los demás han caído, el clicado también
           cae revelando el fondo de la siguiente página. Al mismo tiempo
           dejamos el header en estado claro (is-visible) listo para el
           destino. */
        const fallDelayMs = Math.round(maxDropDelay * 1000) + 250;
        setTimeout(() => {
            clickedItem.classList.add("is-dropped");
        }, fallDelayMs);

        // Fase 3 — navegación real (delegada al helper compartido)
        setTimeout(
            () => (window.location.href = targetHref),
            fallDelayMs + 650,
        );
    };

    // 4. Asignaciones
    mainLinks && mainLinks.addEventListener("click", mainLinksClickHandler);

    /* =====================================================================
       Módulo Novo — Spotlight Marquee Integrado (Otimizado)
       ===================================================================== */

    const spotlights = document.querySelectorAll("[data-spotlight]");
    const projects = window.PROJECTS || [];

    if (spotlights.length && projects.length) {
        // 1. Agrupa imagens por categoria usando .reduce (mais curto e rápido)
        const catImages = projects.reduce((acc, p) => {
            if (p?.category && p?.cover) {
                (acc[p.category] = acc[p.category] || []).push(
                    p.cover.placeholder || `${p.cover.base}.webp`,
                );
            }
            return acc;
        }, {});

        // 2. Configura os containers
        spotlights.forEach((container) => {
            const wrap = container.querySelector("[data-spotlight-wrap]");
            const layer = container.querySelector("[data-spotlight-layer]");
            let rotateId, isTicking;

            if (!wrap || !layer) return;

            // Rastreador de mouse atrelado SOMENTE ao container
            container.addEventListener(
                "mousemove",
                (e) => {
                    if (isTicking) return;
                    isTicking = true;
                    requestAnimationFrame(() => {
                        const rect = wrap.getBoundingClientRect();
                        wrap.style.setProperty(
                            "--cursor-x",
                            `${e.clientX - rect.left}px`,
                        );
                        wrap.style.setProperty(
                            "--cursor-y",
                            `${e.clientY - rect.top}px`,
                        );
                        isTicking = false;
                    });
                },
                { passive: true },
            );

            // Lógica de hover simplificada
            container
                .querySelectorAll("[data-spotlight-trigger]")
                .forEach((trigger) => {
                    trigger.addEventListener("mouseenter", () => {
                        container.classList.add("is-hover");
                        const imgs = catImages[trigger.dataset.category] || [];
                        if (!imgs.length) return;

                        layer.style.backgroundImage = `url("${imgs[0]}")`;
                        let i = 0;

                        // Rotação de imagens
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

    /* =====================================================================
       Módulo 6 — Reveal on Scroll (IntersectionObserver)
       ---------------------------------------------------------------------
       Todo elemento con la clase .reveal recibe .is-visible cuando
       entra en el viewport. Usamos IntersectionObserver en lugar de un
       listener de scroll porque el navegador solo nos notifica cuando
       el elemento cruza el umbral (más eficiente). El observer se
       desconecta del elemento tras la primera aparición.
       ===================================================================== */

    // 1. Constantes de selección
    const revealEls = document.querySelectorAll(".reveal");

    // 2. Estado derivado
    const hasRevealSupport =
        revealEls.length > 0 && "IntersectionObserver" in window;

    // 3. Funciones / Handlers
    const revealIntersectionHandler = (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    };

    // 4. Asignaciones
    if (hasRevealSupport) {
        const revealObserver = new IntersectionObserver(
            revealIntersectionHandler,
            {
                threshold: 0.15,
                rootMargin: "0px 0px -10% 0px",
            },
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* =====================================================================
       Módulo 8 — Next Section (barra de siguiente sección)
       ---------------------------------------------------------------------
       Barra al final de la página que muestra el peek del título de la
       siguiente sección. En hover revela el título completo y al clicar
       reproduce la misma animación del menu: sube cubriendo el viewport
       (is-rising) y luego cae (is-dropping) antes de navegar mediante el
       helper compartido navigateTo().

       La tarjeta visible vive en un __inner position:fixed para que el
       transform no genere scroll overflow en el body. Un IntersectionObserver
       observa el placeholder in-flow .next-section: al entrar en el
       viewport añade .is-ready, que saca el inner al estado peek; cuando
       el usuario sube y la section sale del viewport, vuelve a esconderse.

       Componente reutilizable: cualquier página puede tener su propia
       <section class="next-section" data-next-section> con otro href y
       otro data-category — el módulo se engancha a todas las que
       encuentra y no depende de elementos del index.
       ===================================================================== */

    // 1. Constantes de selección
    const nextSections = document.querySelectorAll("[data-next-section]");

    // 2. Estado derivado
    const hasNextSections =
        nextSections.length > 0 && "IntersectionObserver" in window;

    // 3. Estado mutable
    let isNextAnimating = false;

    // 4. Funciones / Handlers
    const nextSectionClickHandler = (e) => {
        const link = e.target.closest("a");
        if (!link || isNextAnimating) return;
        const section = link.closest("[data-next-section]");
        if (!section) return;

        e.preventDefault();
        isNextAnimating = true;
        const targetHref = link.getAttribute("href");

        // Fase 1 — sube hasta cubrir el viewport (0.9s bouncy)
        section.classList.add("is-rising");

        // Fase 2 — cae fuera de pantalla con slide-out
        setTimeout(() => {
            section.classList.remove("is-rising");
            section.classList.add("is-dropping");
        }, 950);

        // Fase 3 — navegación real (delegada al helper compartido)
        setTimeout(() => (window.location.href = targetHref), 950 + 650);
    };

    /* nextReadyIntersectionHandler
       Marca/desmarca cada section con .is-ready según esté en viewport.
       No se desconecta del observer (a diferencia de .reveal) porque
       queremos que el bar se esconda si el usuario hace scroll hacia
       arriba y salga de la section. */
    const nextReadyIntersectionHandler = (entries) => {
        entries.forEach((entry) => {
            // No tocar el estado si ya está animando un click
            if (
                entry.target.classList.contains("is-rising") ||
                entry.target.classList.contains("is-dropping")
            )
                return;
            entry.target.classList.toggle("is-ready", entry.isIntersecting);
        });
    };

    // 5. Asignaciones
    if (hasNextSections) {
        const nextObserver = new IntersectionObserver(
            nextReadyIntersectionHandler,
            {
                threshold: 0,
            },
        );
        nextSections.forEach((section) => {
            nextObserver.observe(section);
            section.addEventListener("click", nextSectionClickHandler);
        });
    }
})();
