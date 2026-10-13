/*
   portfolio.js - IIFE, todo junto
   modulos: header, hero scroll, observer, menu, main-links cascade, next-section card, spotlight, showcase
*/

(function () {

    // elementos globales
    const header = document.getElementById('siteHeader');
    const navigation = document.getElementById('navigation');
    const nextCard = document.querySelector('.main-links__item--next');
    const nextLink = nextCard?.querySelector('a');
    const scroller = document.querySelector('[data-showcase-scroller]'); // el contenedor de las imagenes es el que tiene el scroll
    const isMobile = window.innerWidth <= 768;


    // hero scroll - la imagen se mueve y dimensiona hasta el about ====================================
    const scrollImg = document.getElementById('scrollImage');
    const imgTarget = document.getElementById('aboutImageTarget');
    const aboutContent = document.querySelector('.about__content');
    const heroContent = document.querySelector('.hero');

    if (scrollImg && imgTarget && heroContent && aboutContent) {
        // requestAnimationFrame para optimizar el scroll
        let scrollTicking = false;

        const onHeroScroll = () => {
            // Elementos
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const vw = document.documentElement.clientWidth;
            const target = imgTarget.getBoundingClientRect();

            // Cálculos de progreso y transformaciones
            const progress = Math.min(Math.max(scrollY / (vh * 0.8), 0), 1);
            const ip = Math.min(progress / 0.8, 1);
            const docked = ip >= 1;
            const fade = Math.max(1 - progress * 6, 0);
            const showHeader = progress > 0.4;
            const showAbout = progress > 0.8;
            const ap = !isMobile ? Math.max((progress - 0.8) / 0.2, 0) : 0;

            // en vuelo la imagen es fixed (coordenadas de viewport): el scroll del compositor
            // no la arrastra y no hay salto hasta que el JS la recoloca. Anclada en el about
            // vuelve a absolute (coordenadas de documento) y se mueve sola con la página
            const targetDocTop = target.top + scrollY;
            const top = docked ? targetDocTop : targetDocTop * ip - scrollY;
            const left = ip < 1 ? target.left * ip : target.left;
            const width = ip < 1 ? vw + (target.width - vw) * ip : target.width;
            const height = ip < 1 ? vh + (target.height - vh) * ip : target.height;

            // aplica estilos y clases
            scrollImg.style.cssText = `top:${top}px;left:${left}px;width:${width}px;height:${height}px;`;
            scrollImg.classList.toggle('is-docked', docked);
            heroContent.style.opacity = fade;
            heroContent.style.transform = `translateY(${-progress * 200}px)`;
            header?.classList.toggle('is-visible', showHeader);
            aboutContent.classList.toggle('is-visible', showAbout);

            if (!isMobile) {
                aboutContent.style.transform = `translateY(${(1 - ap) * 50}px) translateX(${(1 - ap) * 200}px)`;
            } else {
                aboutContent.style.transform = '';
            }

            scrollTicking = false;
        };

        const requestHeroUpdate = () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(onHeroScroll);
        };

        window.addEventListener('scroll', requestHeroUpdate, { passive: true });
        window.addEventListener('resize', requestHeroUpdate, { passive: true });
        // estado inicial: la página puede cargar con el scroll restaurado
        onHeroScroll();
    }


    // observer - reveal y next-section comparten el observer ====================================
    const nextSection = document.querySelector('[data-next-section]');
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target.classList.contains('reveal')) {
                entry.target.classList.toggle('is-visible', entry.isIntersecting);
            } else {
                // !isNavigating para que no pise la animacion de cambio de pagina
                if (!isNavigating) nextCard?.classList.toggle('is-ready', entry.isIntersecting);
            }
        });
    }, { threshold: 0.25 });

    if (nextSection) observer.observe(nextSection);
    reveals.forEach(r => observer.observe(r));


    // menu toggle ========================================================================
    const menuBtn = document.getElementById('menuButton');
    const mainLinks = document.querySelector('.main-links');
    const linkItems = Array.from(
        document.querySelectorAll('.main-links__item:not(.main-links__item--next)')
    );

    const toggleMenu = () => {
        if (!menuBtn) return;
        const isOpen = header?.classList.toggle('is-menu-open');
        menuBtn.querySelector('.nav-link__text').textContent = menuBtn.dataset[isOpen ? 'labelClose' : 'labelOpen'];
        menuBtn.setAttribute('aria-expanded', String(!!isOpen)) // activa acesibilidad
        navigation?.setAttribute('aria-hidden', String(!isOpen))
    };

    menuBtn?.addEventListener('click', toggleMenu);

    // escape cierra el menu 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header?.classList.contains('is-menu-open')) toggleMenu();
    });


    // main links - cascada al clickear ====================================
    let isNavigating = false;

    mainLinks?.addEventListener('click', (e) => {
        const item = e.target.closest('.main-links__item');
        if (!item || isNavigating) return;

        const anchor = item.querySelector('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        const clickedIdx = Number(item.style.getPropertyValue('--index'));

        e.preventDefault();
        isNavigating = true;

        // fase 1 - el item clicado sube, los demas se van con un delay de acuerdo con ladistancia
        item.classList.add('is-focused');
        linkItems.forEach((el, i) => {
            if (i === clickedIdx) return;
            const a = el.querySelector('a');
            if (a) a.style.transitionDelay = `${Math.abs(i - clickedIdx) * 0.2}s`;
            el.classList.add('is-leaving');
        });

        // fase 2 - el item clicado baja y el header vuelve
        setTimeout(() => {
            header?.classList.remove('is-menu-open');
            item.classList.replace('is-focused', 'is-leaving');
            // fase 3 - cambia la pagina
            setTimeout(() => {
                if (href) window.location.href = href;
            }, 300);
        }, 700);
    });


    // next section card - click o seguir rodando al final de la pagina ====================================
    if (nextCard && nextLink) {
        // misma secuencia del main links: sube, baja y cambia de pagina
        const goNext = () => {
            isNavigating = true;
            nextCard.classList.remove('is-ready', 'is-filling');
            nextCard.classList.add('is-focused');

            setTimeout(() => {
                nextCard.classList.replace('is-focused', 'is-leaving');
                setTimeout(() => {
                    if (nextLink.href) window.location.href = nextLink.href;
                }, 500);
            }, 700);
        };

        nextLink.addEventListener('click', (e) => {
            if (isNavigating) return;
            e.preventDefault();
            goNext();
        });

        // seguir rodando al final: --fill (0 a 1) sube la tarjeta hasta llenar la pantalla y dispara goNext
        const atEnd = () => scroller
            ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
            : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
        let fill = 0;
        let lastWheel = 0;
        let armed = false;
        let touchY = 0;

        const setFill = (value) => {
            fill = Math.min(Math.max(value, 0), 1);
            nextCard.style.setProperty('--fill', fill);
            nextCard.classList.toggle('is-filling', fill > 0);
            if (fill === 1) goNext();
        };

        // delta > 0 = seguir bajando; solo llena con la tarjeta visible y la pagina al final
        const pushFill = (delta) => {
            if (isNavigating || header?.classList.contains('is-menu-open')) return;
            if (!nextCard.classList.contains('is-ready') || !atEnd()) {
                if (fill) setFill(0);
                return;
            }
            setFill(fill + delta / (window.innerHeight * 0.6));
        };

        window.addEventListener('wheel', (e) => {
            // la inercia del trackpad llega como rafaga continua: solo un gesto nuevo (pausa > 100 ms)
            // que empieza con la pagina ya al final arma el llenado, asi un scroll fuerte no cambia de pagina solo
            if (e.timeStamp - lastWheel > 100) armed = atEnd();
            lastWheel = e.timeStamp;
            if (armed) pushFill(e.deltaY * [1, 40, window.innerHeight][e.deltaMode]); // deltaMode: pixel, linea, pagina
        }, { passive: true });

        window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            const y = e.touches[0].clientY;
            pushFill(touchY - y);
            touchY = y;
        }, { passive: true });

        // scroll fuera del final (barra, teclado) devuelve la tarjeta a su lugar
        (scroller || window).addEventListener('scroll', () => {
            if (fill && !atEnd()) setFill(0);
        }, { passive: true });
    }


    // spotlight - preview rotativo al hover del marquee ====================================
    const marquee = document.querySelector('.marquee');

    if (marquee && !isMobile) {
        marquee.querySelectorAll('.marquee__item').forEach((item) => {
            const img = item.querySelector('.marquee__preview');
            const images = item.dataset.previews.split(' '); // imagenes de la categoria, desde el html

            let changeId = null; // para controlar el setInterval

            item.addEventListener('mouseenter', () => {
                const placement = item.getBoundingClientRect();
                img.style.left = `${placement.left + placement.width / 2}px`;
                img.style.top = `${placement.top - img.height - 20}px`;
                img.classList.add('is-visible');

                let i = 0;
                img.src = images[0];
                changeId = setInterval(() => {
                    img.src = images[++i % images.length];
                }, 1000);
            });

            item.addEventListener('mouseleave', () => {
                img.classList.remove('is-visible');
            });
        });
    }


    // showcase (branding/web-design/etc) ====================================
    
    const showcase = document.querySelector('[data-showcase]');
    if (!showcase) return; // si no hay showcase, no hace falta seguir cargando codigo

    const sections  = showcase.querySelectorAll('.showcase__section'); 
    const listItems = showcase.querySelectorAll('.showcase__list-item');
    const total     = sections.length;

    function setActive(index) {
        const i = Math.max(0, Math.min(total - 1, index)); // asegura que index este entre 0 y total-1
        // activa el item de la lista y la seccion correspondiente, desactiva los demas
        listItems.forEach((el, match) => el.classList.toggle('is-active',  match === i));
        sections .forEach((el, match) => el.classList.toggle('is-in-view', match === i));
        nextCard?.classList.toggle('is-ready', i === total - 1);
    }

    // click en la lista lateral mueve al item correspondiente
    showcase.querySelectorAll('.showcase__list-link').forEach(link => {
        link.addEventListener('click', e => {
            const listItem = link.closest('.showcase__list-item');
            if (listItem?.classList.contains('is-active')) return; // si ya esta activo, no cambia de pagina

            e.preventDefault(); // evita el cambio de pagina
            // obtiene el index del item clicado y hace scroll a la seccion correspondiente
            const idx = +link.dataset.index;
            sections[idx]?.scrollIntoView();
        });
    });

    // root:scroller hace que el observer funcione en el contenedor, no en la ventana
    const showcaseObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(+entry.target.dataset.index);
        });
    }, { root: scroller, threshold: 0.5 });

    sections.forEach(s => showcaseObserver.observe(s));

    setActive(0);
})();
