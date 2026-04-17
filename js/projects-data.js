/* ============================================================
   PORTFOLIO — DATOS DE PROYECTOS
   ------------------------------------------------------------
   Fuente única de verdad para los PREVIEWS de proyectos.
   Se expone como window.PROJECTS (frozen) y lo consumen:
     · js/index.js  → marquee spotlight, category scroll, etc.
     · páginas de categoría (branding.html, web-design.html...)
     · carruseles de destacados en index.html

   Importante: este archivo NO contiene el HTML rico de cada
   página de proyecto — eso vive en /projects/<slug>.html y es
   escrito a mano (tomando projects/riwer-labs.html como base).

   Estructura de cada entrada:
     slug        — identificador (kebab-case, sin acentos)
     title       — título visible
     subtitle    — tagline corto (1 línea)
     category    — branding | web-design | artes-graficas | fotografia
     year        — año del proyecto
     client      — nombre del cliente (o "Proyecto personal")
     tags        — array de strings (entregables/ámbitos)
     cover       — imagen principal del preview
     carousel    — array de imágenes para hover / spotlight
     accent      — CSS custom property del color de marca
     featured    — boolean (aparece en portfolio.html e index.html)
     href        — ruta a la página del proyecto

   Estructura del objeto "cover" (y cada ítem del carousel):
     base        — ruta futura SIN extensión (se resolverá con
                   <picture> webp+jpg cuando lleguen las imágenes)
     placeholder — URL temporal (picsum) mientras no hay assets
     w, h        — dimensiones intrínsecas (width/height obligatorios)
     alt         — texto alternativo real (nunca Lorem Ipsum)
============================================================ */

(function () {
    'use strict';

    // Helper: construye ítem de imagen con placeholder picsum estable por seed
    function img(seed, w, h, alt, basePath) {
        return {
            base: basePath,
            placeholder: 'https://picsum.photos/seed/' + seed + '/' + w + '/' + h,
            w: w,
            h: h,
            alt: alt
        };
    }

    // Datos de los 11 proyectos (orden = orden de aparición por defecto)
    const PROJECTS = [

        /* ---------- BRANDING ---------- */
        {
            slug: 'riwer-labs',
            title: 'Riwer Labs',
            subtitle: 'Agencia de IA personalizada',
            category: 'branding',
            year: 2024,
            client: 'Riwer Labs',
            tags: ['Logotipo', 'Sistema', 'Tipografía', 'Guidelines'],
            cover: img('riwer-labs-cover', 1600, 1000, 'Riwer Labs — identidad visual aplicada', 'media/projects/riwer-labs/cover'),
            carousel: [
                img('riwer-labs-01', 1600, 1000, 'Riwer Labs — logotipo principal sobre fondo claro', 'media/projects/riwer-labs/01'),
                img('riwer-labs-02', 1600, 1000, 'Riwer Labs — paleta cromática y tipografía', 'media/projects/riwer-labs/02'),
                img('riwer-labs-03', 1600, 1000, 'Riwer Labs — aplicación en papelería corporativa', 'media/projects/riwer-labs/03'),
                img('riwer-labs-04', 1600, 1000, 'Riwer Labs — versiones del logotipo en negativo', 'media/projects/riwer-labs/04')
            ],
            accent: '--color-comp-1',
            featured: true,
            href: 'projects/riwer-labs.html'
        },
        {
            slug: 'refiori',
            title: 'Refiori',
            subtitle: 'Joyería artesanal',
            category: 'branding',
            year: 2024,
            client: 'Refiori',
            tags: ['Logotipo', 'Packaging', 'Identidad cálida'],
            cover: img('refiori-cover', 1600, 1000, 'Refiori — identidad de joyería artesanal', 'media/projects/refiori/cover'),
            carousel: [
                img('refiori-01', 1600, 1000, 'Refiori — logotipo manuscrito sobre textura orgánica', 'media/projects/refiori/01'),
                img('refiori-02', 1600, 1000, 'Refiori — packaging de piezas artesanales', 'media/projects/refiori/02'),
                img('refiori-03', 1600, 1000, 'Refiori — tipografía y paleta cálida', 'media/projects/refiori/03')
            ],
            accent: '--color-comp-1',
            featured: true,
            href: 'projects/refiori.html'
        },
        {
            slug: 'wote',
            title: 'Wotë',
            subtitle: 'Productos de cannabidiol',
            category: 'branding',
            year: 2023,
            client: 'Wotë',
            tags: ['Logotipo', 'Sistema', 'Packaging'],
            cover: img('wote-cover', 1600, 1000, 'Wotë — identidad de marca de CBD', 'media/projects/wote/cover'),
            carousel: [
                img('wote-01', 1600, 1000, 'Wotë — logotipo limpio sobre fondo neutro', 'media/projects/wote/01'),
                img('wote-02', 1600, 1000, 'Wotë — etiqueta de producto', 'media/projects/wote/02'),
                img('wote-03', 1600, 1000, 'Wotë — paleta natural de colores', 'media/projects/wote/03')
            ],
            accent: '--color-comp-1',
            featured: false,
            href: 'projects/wote.html'
        },
        {
            slug: 'tondafoto',
            title: 'Tondafoto',
            subtitle: 'Marca personal de fotografía',
            category: 'branding',
            year: 2022,
            client: 'Proyecto personal',
            tags: ['Identidad personal', 'Minimalismo', 'Versatilidad'],
            cover: img('tondafoto-cover', 1600, 1000, 'Tondafoto — marca personal de fotografía', 'media/projects/tondafoto/cover'),
            carousel: [
                img('tondafoto-01', 1600, 1000, 'Tondafoto — logotipo minimalista', 'media/projects/tondafoto/01'),
                img('tondafoto-02', 1600, 1000, 'Tondafoto — aplicación en tarjeta de visita', 'media/projects/tondafoto/02'),
                img('tondafoto-03', 1600, 1000, 'Tondafoto — versión digital del logotipo', 'media/projects/tondafoto/03')
            ],
            accent: '--color-comp-1',
            featured: false,
            href: 'projects/tondafoto.html'
        },
        {
            slug: 'dj-rodmotter',
            title: 'DJ RodMotter',
            subtitle: 'Identidad para DJ profesional',
            category: 'branding',
            year: 2023,
            client: 'Rod Motter',
            tags: ['Logotipo', 'Flyers', 'Redes sociales'],
            cover: img('dj-rodmotter-cover', 1600, 1000, 'DJ RodMotter — identidad dinámica para escena musical', 'media/projects/dj-rodmotter/cover'),
            carousel: [
                img('dj-rodmotter-01', 1600, 1000, 'DJ RodMotter — logotipo principal', 'media/projects/dj-rodmotter/01'),
                img('dj-rodmotter-02', 1600, 1000, 'DJ RodMotter — flyer para evento nocturno', 'media/projects/dj-rodmotter/02'),
                img('dj-rodmotter-03', 1600, 1000, 'DJ RodMotter — post de redes sociales', 'media/projects/dj-rodmotter/03')
            ],
            accent: '--color-comp-1',
            featured: false,
            href: 'projects/dj-rodmotter.html'
        },

        /* ---------- WEB DESIGN ---------- */
        {
            slug: 'eners',
            title: 'Eners',
            subtitle: 'Empresa de paneles solares',
            category: 'web-design',
            year: 2024,
            client: 'Eners',
            tags: ['UX/UI', 'Responsive', 'Conversión'],
            cover: img('eners-cover', 1600, 1000, 'Eners — sitio web de empresa de energía solar', 'media/projects/eners/cover'),
            carousel: [
                img('eners-01', 1600, 1000, 'Eners — hero de la home con CTA de contacto', 'media/projects/eners/01'),
                img('eners-02', 1600, 1000, 'Eners — sección de servicios en desktop', 'media/projects/eners/02'),
                img('eners-03', 1600, 1000, 'Eners — versión responsive en móvil', 'media/projects/eners/03')
            ],
            accent: '--color-comp-2',
            featured: true,
            href: 'projects/eners.html'
        },
        {
            slug: 'identiduca',
            title: 'Identiduca',
            subtitle: 'Plataforma de protección infantil',
            category: 'web-design',
            year: 2023,
            client: 'Identiduca',
            tags: ['UX/UI', 'Accesibilidad', 'Claridad'],
            cover: img('identiduca-cover', 1600, 1000, 'Identiduca — plataforma digital de protección infantil', 'media/projects/identiduca/cover'),
            carousel: [
                img('identiduca-01', 1600, 1000, 'Identiduca — pantalla principal de la plataforma', 'media/projects/identiduca/01'),
                img('identiduca-02', 1600, 1000, 'Identiduca — formulario amigable para usuarios', 'media/projects/identiduca/02'),
                img('identiduca-03', 1600, 1000, 'Identiduca — sistema de recursos accesibles', 'media/projects/identiduca/03')
            ],
            accent: '--color-comp-2',
            featured: false,
            href: 'projects/identiduca.html'
        },

        /* ---------- ARTES GRÁFICAS ---------- */
        {
            slug: 'social-media',
            title: 'Social Media',
            subtitle: 'Marcas brasileñas — múltiples clientes',
            category: 'artes-graficas',
            year: 2023,
            client: 'Clientes varios',
            tags: ['Piezas gráficas', 'Calendario editorial', 'Templates'],
            cover: img('social-media-cover', 1600, 1000, 'Social Media — gestión visual de redes para varias marcas', 'media/projects/social-media/cover'),
            carousel: [
                img('social-media-01', 1600, 1000, 'Social Media — grilla de feed de cliente', 'media/projects/social-media/01'),
                img('social-media-02', 1600, 1000, 'Social Media — pieza de campaña estacional', 'media/projects/social-media/02'),
                img('social-media-03', 1600, 1000, 'Social Media — template de stories', 'media/projects/social-media/03')
            ],
            accent: '--color-comp-3',
            featured: true,
            href: 'projects/social-media.html'
        },

        /* ---------- FOTOGRAFÍA ---------- */
        {
            slug: 'retratos-y-parejas',
            title: 'Retratos y Parejas',
            subtitle: 'Retrato personal y de pareja',
            category: 'fotografia',
            year: 2024,
            client: 'Sesiones privadas',
            tags: ['Dirección creativa', 'Retrato', 'Edición'],
            cover: img('retratos-cover', 1600, 1000, 'Retratos y Parejas — sesión fotográfica personal', 'media/projects/retratos-y-parejas/cover'),
            carousel: [
                img('retratos-01', 1600, 1000, 'Retratos — sesión de pareja en exteriores', 'media/projects/retratos-y-parejas/01'),
                img('retratos-02', 1600, 1000, 'Retratos — retrato personal con luz natural', 'media/projects/retratos-y-parejas/02'),
                img('retratos-03', 1600, 1000, 'Retratos — composición en blanco y negro', 'media/projects/retratos-y-parejas/03')
            ],
            accent: '--color-comp-4',
            featured: true,
            href: 'projects/retratos-y-parejas.html'
        },
        {
            slug: 'fotografia-producto',
            title: 'Fotografía de Producto',
            subtitle: 'Gastronomía y joyería',
            category: 'fotografia',
            year: 2024,
            client: 'Clientes varios',
            tags: ['Producto', 'Catálogo', 'Detalle'],
            cover: img('producto-cover', 1600, 1000, 'Fotografía de producto — gastronomía y joyería', 'media/projects/fotografia-producto/cover'),
            carousel: [
                img('producto-01', 1600, 1000, 'Producto — fotografía gastronómica detallada', 'media/projects/fotografia-producto/01'),
                img('producto-02', 1600, 1000, 'Producto — pieza de joyería artesanal en primer plano', 'media/projects/fotografia-producto/02'),
                img('producto-03', 1600, 1000, 'Producto — composición para catálogo', 'media/projects/fotografia-producto/03')
            ],
            accent: '--color-comp-4',
            featured: false,
            href: 'projects/fotografia-producto.html'
        },
        {
            slug: 'eventos-culturales',
            title: 'Eventos Culturales',
            subtitle: 'Orquesta y ballet',
            category: 'fotografia',
            year: 2023,
            client: 'Producciones culturales',
            tags: ['Cobertura', 'Eventos', 'Artes escénicas'],
            cover: img('eventos-cover', 1600, 1000, 'Eventos culturales — cobertura de orquesta y ballet', 'media/projects/eventos-culturales/cover'),
            carousel: [
                img('eventos-01', 1600, 1000, 'Eventos — presentación de orquesta en sala de conciertos', 'media/projects/eventos-culturales/01'),
                img('eventos-02', 1600, 1000, 'Eventos — bailarinas de ballet en escena', 'media/projects/eventos-culturales/02'),
                img('eventos-03', 1600, 1000, 'Eventos — momento de aplauso del público', 'media/projects/eventos-culturales/03')
            ],
            accent: '--color-comp-4',
            featured: false,
            href: 'projects/eventos-culturales.html'
        }

    ];

    // Expone global (accesible desde la IIFE de index.js como window.PROJECTS)
    window.PROJECTS = Object.freeze(PROJECTS);

})();
