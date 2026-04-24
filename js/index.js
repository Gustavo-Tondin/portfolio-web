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
    const isMobile = window.innerWidth <= 768;


    // hero scroll - la imagen se va morphando hasta el about ====================================
    const scrollImg = document.getElementById('scrollImage');
    const imgTarget = document.getElementById('aboutImageTarget');
    const aboutContent = document.querySelector('.about__content');
    const heroContent = document.querySelector('.hero');

    if (scrollImg && imgTarget && heroContent && aboutContent) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const vw = document.documentElement.clientWidth;

            const progress = Math.min(scrollY / (vh * 0.8), 1);
            const target = imgTarget.getBoundingClientRect();
            const ip = Math.min(progress / 0.8, 1);

            if (ip < 1) {
                scrollImg.style.cssText = `
                        top: ${(target.top + scrollY) * ip}px;
                        left: ${target.left * ip}px;
                        width: ${vw + (target.width - vw) * ip}px;
                        height: ${vh + (target.height - vh) * ip}px;
                    `;
            } else {
                scrollImg.style.cssText = `
                        top: ${target.top + scrollY}px;
                        left: ${target.left}px;
                        width: ${target.width}px;
                        height: ${target.height}px;
                    `;
            }

            const fade = Math.max(1 - progress * 6, 0);
            heroContent.style.opacity = fade;
            heroContent.style.transform = `translateY(${-progress * 200}px)`;

            header?.classList.toggle('is-visible', progress > 0.4);
            aboutContent.classList.toggle('is-visible', progress > 0.8);

            // Cambios para el mobile
            if (!isMobile) {
                const ap = Math.max((progress - 0.8) / 0.2, 0);
                aboutContent.style.transform = `translateY(${(1 - ap) * 50}px) translateX(${(1 - ap) * 200}px)`;
            } else {
                aboutContent.style.transform = '';
            }
        });
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
        menuBtn.querySelector('.nav-link__text').textContent = isOpen ? 'Cerrar' : 'Menu';
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


    // next section card - similar al main links ====================================
    if (nextCard && nextLink) {
        nextLink.addEventListener('click', (e) => {
            if (isNavigating) return;

            e.preventDefault();
            isNavigating = true;

            nextCard.classList.replace('is-ready', 'is-focused');

            setTimeout(() => {
                nextCard.classList.replace('is-focused', 'is-leaving');
                setTimeout(() => {
                    if (nextLink.href) window.location.href = nextLink.href;
                }, 500);
            }, 700);
        });
    }


    // spotlight - preview rotativo al hover del marquee ====================================
    const marquee = document.querySelector('.marquee');

    if (marquee && !isMobile) {
        // imagenes de preview por categoria
        const previews = {
            'branding': [
                'media/projects/branding/refiori/branding-refiori-00.jpg',
                'media/projects/branding/wote/branding-wote-00.jpg',
                'media/projects/branding/tondafoto/branding-tonda-foto-00.jpg'
            ],
            'web-design': [
                'media/projects/web-design/riwer-labs/web-riwerlabs-desktop-00-hero.jpg',
                'media/projects/web-design/eners/web-eners-desktop-00-hero.jpg',
                'media/projects/web-design/identiduca/web-identiduca-desktop-00-hero.jpg'
            ],
            'artes-graficas': [
                'media/projects/artes-graficas/gauja-lab/social-media-gauja-lab-00.jpg',
                'media/projects/artes-graficas/identiduca/zine-identiduca-00.jpg',
                'media/projects/artes-graficas/gauja-lab/social-media-gauja-lab-05.jpg'
            ],
            'fotografia': [
                'media/projects/fotografia/aline-e-eduardo/ensaio-aline-e-eduardo-00.jpg',
                'media/projects/fotografia/carol/ensaio-carol-00.jpg',
                'media/projects/fotografia/valeria/ensaio-valeria-00.jpg'
            ]
        };

        marquee.querySelectorAll('.marquee__item').forEach((item) => {
            const img = item.querySelector('.marquee__preview');
            const images = previews[item.dataset.category]; // obtiene las imagenes segun categoria

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

    const scroller  = showcase.querySelector('[data-showcase-scroller]'); // el contenedor de las imagenes es el que tiene el scroll
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
