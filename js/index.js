/* ========================================
    Efecto de Scroll
======================================== */
const scrollImage  = document.getElementById('scrollImage');
const header       = document.getElementById('siteHeader');
const imageTarget  = document.getElementById('aboutImageTarget');
const aboutContent = document.querySelector('.about__content');
const heroTop      = document.querySelector('.hero__top');
const heroInfo     = document.querySelector('.hero__info');
const heroNav      = document.querySelector('.hero__side-nav');

window.addEventListener('scroll', function () {

    const scrollY = window.scrollY;
    const vh      = window.innerHeight;
    const vw      = window.innerWidth;

    // p es el progreso del scroll de 0 (inicio) a 1 (final de la primera pantalla)
    // Math.min garantiza que no supere 1, incluso si el scroll pasa de vh
    const p = Math.min(scrollY / vh, 1);

    // 1: Animar la imagen del hero hasta la sección about ====================================
    
    const target = imageTarget.getBoundingClientRect();
    // Se interpolan los valores de posición y tamaño entre el estado inicial 
    // (pantalla completa) y el destino (.about__image)

    if (p < 1) {
        scrollImage.style.cssText = `
            position: fixed;
            top: ${target.top  * p}px;
            left: ${target.left * p}px;
            width: ${vw  + (target.width  - vw)  * p}px;
            height: ${vh + (target.height - vh) * p}px;
            border-radius: ${p * 8}px;
        `;
    } else {
        // p >= 1: la imagen llegó a su destino — se fija como absoluta en el scroll actual
        scrollImage.style.cssText = `
            position: absolute;
            top: ${target.top + scrollY}px;
            left: ${target.left}px;
            width: ${target.width}px;
            height: ${target.height}px;
            border-radius: 8px;
        `;
    }

    // 2: Ocultar los textos del hero ====================================
    // fadeProgress va de 1 (visible) a 0 (invisible) en la primera mitad del scroll
    // Multiplicar p por 2 hace que el fade termine en p = 0.5 (mitad de la pantalla)
    const opacity = Math.max(1 - p * 2, 0);

    heroTop.style.opacity   = opacity;
    heroInfo.style.opacity  = opacity;
    heroNav.style.opacity   = opacity;
    // translateY negativo crea un ligero efecto de ascenso durante el fade
    heroTop.style.transform = `translateY(${-p * 40}px)`;

    // 3: Mostrar el header fijo y el contenido de 'about' ====================================
    // Ambos aparecen tras el 40% del scroll — toggle añade/quita .is-visible según sea necesario
    const show = p > 0.4;
    header.classList.toggle('is-visible', show);
    aboutContent.classList.toggle('is-visible', show);

});