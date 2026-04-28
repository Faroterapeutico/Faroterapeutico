// --- Lógica principal de la aplicación ---
document.addEventListener('DOMContentLoaded', () => {
    const app = {
        // Método para enviar eventos a Google Analytics
        trackEvent(eventName, eventCategory, eventLabel) {
            if (typeof gtag === 'function') {
                console.log(`Tracking Event: ${eventName}, Category: ${eventCategory}, Label: ${eventLabel}`); // Para depuración
                gtag('event', eventName, {
                    'event_category': eventCategory,
                    'event_label': eventLabel
                });
            }
        },

        // Método para enviar eventos de CONVERSIÓN a Google Ads y Analytics
        trackConversion(gaEvent, adsConversionLabel) {
            // gaEvent = { eventName, eventCategory, eventLabel }
            // adsConversionLabel = 'AW-17584631597/XXXXXXXXXX'

            // 1. Enviar evento a Google Analytics (como ya se hacía)
            this.trackEvent(gaEvent.eventName, gaEvent.eventCategory, gaEvent.eventLabel);

            // 2. Enviar evento de conversión a Google Ads
            if (typeof gtag === 'function' && adsConversionLabel) {
                console.log(`Tracking Ads Conversion: ${adsConversionLabel} for ${gaEvent.eventLabel}`); // Para depuración
                gtag('event', 'conversion', { 'send_to': adsConversionLabel });
            }
        },


        // Método de inicialización
        init() {
            // Propiedades
            this.lastScrollTop = 0;
            this.header = document.getElementById('main-header');

            // 1. Inicializar la navegación dinámica (solo si existe el contenedor)
            if (document.getElementById('main-nav-ul')) {
                this.initNavigation();
            }

            // 2. Inicializar el resto de los componentes en todas las páginas
            this.initComponents();
        },

        // Método para generar la navegación desde una estructura de datos
        initNavigation() {
            const menuData = [
                {
                    nombre: "Inicio", // 1. Inicio
                    url: "index.html#hero"
                },
                {
                    nombre: "Servicios Clínicos", // 2. Servicios Clínicos
                    url: "servicios-clinicos.html"
                },
                {
                    nombre: "Sobre Nosotros", // 3. Sobre Nosotros
                    url: "sobre-nosotros.html"
                },
                {
                    nombre: "Fonasa", // 4. Fonasa
                    url: "fonasa.html"
                },
                {
                    nombre: "Isapre", // 5. Reembolso ISAPRE
                    url: "isapre.html",
                    subsecciones: [
                        { nombre: "Ver todas las ISAPREs", url: "isapre.html" },
                        { nombre: "Colmena", url: "colmena.html" },
                        { nombre: "Banmédica", url: "banmedica.html" },
                        { nombre: "Cruz Blanca", url: "cruz-blanca.html" },
                        { nombre: "Consalud", url: "consalud.html" },
                        { nombre: "Vida Tres", url: "vida-tres.html" },
                        { nombre: "Nueva Másvida", url: "nueva-masvida.html" }
                    ]
                },
                {
                    nombre: "Políticas", // 6. Políticas de Cancelación
                    url: "politicas-cancelacion.html"
                },
                {
                    nombre: "Blog", // 7. Blog
                    url: "blog.html"
                }
            ];

            const navUl = document.getElementById('main-nav-ul');
            if (!navUl) return;

            navUl.innerHTML = menuData.map(item => {
                if (item.subsecciones && item.subsecciones.length > 0) {
                    const subItems = item.subsecciones.map(sub => `<li><a href="${sub.url}">${sub.nombre}</a></li>`).join('');
                    return `<li class="dropdown" role="menuitem" aria-haspopup="true">
                                <a href="${item.url}" class="dropdown-toggle">${item.nombre} <i class="fas fa-chevron-down"></i></a>
                                <ul class="dropdown-menu" aria-expanded="false">${subItems}</ul>
                            </li>`;
                }
                return `<li><a href="${item.url}">${item.nombre}</a></li>`;
            }).join('');

            // Dropdown: hover en desktop, clic en móvil
            navUl.querySelectorAll('li.dropdown').forEach(li => {
                const toggle = li.querySelector('.dropdown-toggle');
                const menu   = li.querySelector('.dropdown-menu');

                // --- Desktop: abrir/cerrar con mouseenter/mouseleave ---
                li.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        li.classList.add('open');
                        if (menu) menu.setAttribute('aria-expanded', 'true');
                    }
                });
                li.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768) {
                        li.classList.remove('open');
                        if (menu) menu.setAttribute('aria-expanded', 'false');
                    }
                });

                // --- Móvil: abrir/cerrar con clic ---
                if (toggle) {
                    toggle.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            li.classList.toggle('open');
                            if (menu) menu.setAttribute('aria-expanded', li.classList.contains('open'));
                        }
                    });
                }
            });
        },

        initComponents() {
            // Menú hamburguesa
            const hamburger = document.getElementById('hamburger-menu');
            const nav = document.getElementById('main-nav');
            const hamburgerIcon = hamburger?.querySelector('i');

            if (hamburger && nav) {
                hamburger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    nav.classList.toggle('active');
                    // Toggle body class for overlay and scroll lock
                    document.body.classList.toggle('menu-open', nav.classList.contains('active'));

                    // Toggle aria-expanded for accessibility
                    const isOpen = nav.classList.contains('active');
                    hamburger.setAttribute('aria-expanded', isOpen);
                    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'); // Accesibilidad
                    hamburgerIcon.classList.toggle('fa-bars', !isOpen);
                    hamburgerIcon.classList.toggle('fa-times', isOpen);

                    // Evento de seguimiento para apertura de menú
                    if (isOpen) {
                        this.trackEvent('navegacion', 'Clic', 'Abrir Menu Hamburguesa');
                    }
                });

                document.querySelectorAll('.main-nav a').forEach(link => {
                    link.addEventListener('click', () => {
                        // En móvil, el dropdown-toggle NO cierra el menú (despliega sub-items)
                        if (window.innerWidth <= 768 && link.classList.contains('dropdown-toggle')) return;

                        nav.classList.remove('active');
                        document.body.classList.remove('menu-open');
                        // Evento de seguimiento para clics en la navegación principal
                        const linkText = link.textContent || 'Link sin texto';
                        this.trackEvent('navegacion', 'Clic Menu', linkText);
                    });
                });

                document.addEventListener('click', (e) => {
                    // Cierra el menú hamburguesa si se hace clic fuera
                    if (nav?.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
                        nav.classList.remove('active'); // Cierra el menú
                        document.body.classList.remove('menu-open');
                        hamburger.setAttribute('aria-expanded', 'false'); // Actualiza ARIA
                        hamburger.setAttribute('aria-label', 'Abrir menú de navegación'); // Actualiza ARIA
                        hamburgerIcon.classList.replace('fa-times', 'fa-bars'); // Cambia el ícono
                    }
                });
            }

            // Eventos de scroll
            window.addEventListener('scroll', () => {
                this.handleHeaderVisibility();
            }, { passive: true });

            // Función de callback para el seguimiento de eventos de contacto
            const contactConversionCallback = (url) => {
                return function () {
                    window.open(url, '_blank');
                };
            };

            document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();

                    const linkText = el.textContent.trim() || 'WhatsApp';
                    const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                    const label = `${linkText} — ${page}`;

                    this.trackEvent('contacto_whatsapp', 'WhatsApp', label);

                    if (typeof gtag === 'function') {
                        gtag('event', 'conversion', {
                            'send_to': 'AW-17584631597/xJYeCMuY2qYbEK3egMFB',
                            'event_callback': contactConversionCallback(el.href)
                        });
                    } else {
                        setTimeout(() => window.open(el.href, '_blank'), 300);
                    }

                    if (typeof fbq === 'function') {
                        fbq('track', 'Contact', { content_name: label }, { eventID: crypto.randomUUID() });
                    }
                });
            });

            // Seguimiento de clics en Encuadrado
            document.querySelectorAll('a[href*="encuadrado.com"]').forEach(el => {
                if (el.href.includes('ayuda.encuadrado.com')) return;
                el.addEventListener('click', () => {
                    const label = el.textContent.trim() || 'Encuadrado';
                    const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                    this.trackEvent('agendar_encuadrado', 'Encuadrado', `${label} — ${page}`);
                    if (typeof gtag === 'function') gtag('event', 'conversion', { 'send_to': 'AW-17584631597/g_YJCL_h_vQZEJq29_oq' });
                    if (typeof fbq === 'function') fbq('track', 'Schedule', { content_name: `Encuadrado — ${page}` }, { eventID: crypto.randomUUID() });
                });
            });

            // Seguimiento de rutas FONASA / ISAPRE en el hero del inicio
            document.querySelectorAll('.hero-path').forEach(el => {
                el.addEventListener('click', () => {
                    const label = el.querySelector('strong')?.textContent.trim() || el.textContent.trim();
                    this.trackEvent('navegacion_hero', 'Clic Hero Path', label);
                });
            });

            // Botón de orientación en la página de inicio
            document.getElementById('btn-orientacion-hero')?.addEventListener('click', (e) => {
                // No previene el default, solo trackea. La navegación a la página de orientación es normal.
                this.trackEvent('explore_free_session', 'Interés', 'Clic en Saber Más Orientación');
            });

            // Seguimiento de todos los clics en enlaces de Calendly
            document.querySelectorAll('a[href*="calendly.com"], button[onclick*="calendly.com"]').forEach(el => {
                el.addEventListener('click', () => {
                    const isOrientation = el.href?.includes('/orientacion') || el.getAttribute('onclick')?.includes('/orientacion');

                    if (isOrientation) {
                        // Es un agendamiento de orientación (Lead)
                        this.trackEvent('generate_lead', 'Agendamiento', 'Clic en Sesión Orientación');
                        console.log('Clic en Sesión de Orientación detectado');
                        if (typeof gtag === 'function') gtag('event', 'conversion', { 'send_to': 'AW-17584631597/jLpYCK6Y2qYbEK3egMFB' });
                        if (typeof fbq === 'function') fbq('track', 'Lead', {}, { eventID: crypto.randomUUID() });
                    } else {
                        // Es un agendamiento de sesión normal (Schedule)
                        const therapist = el.dataset.therapist;
                        const therapistName = therapist ? therapist.charAt(0).toUpperCase() + therapist.slice(1) : 'General';
                        const eventLabel = `Clic en Calendly ${therapistName}`;
                        const eventName = `agendar_${therapist || 'general'}`;

                        this.trackEvent(eventName, 'Agendamiento', eventLabel);
                        console.log(`Evento GA: ${eventName}, Label: ${eventLabel}`);
                        if (typeof gtag === 'function') gtag('event', 'conversion', { 'send_to': 'AW-17584631597/g_YJCL_h_vQZEJq29_oq' });
                        if (typeof fbq === 'function') fbq('track', 'Schedule', { content_name: `Agendar con ${therapistName}` }, { eventID: crypto.randomUUID() });
                    }
                });
            });

            // Lógica para las tarjetas de modalidad de servicio (Presencial / Online)
            // Estas tarjetas ahora actúan como disparadores de modales.
            const serviceCards = document.querySelectorAll('.service-card[data-modal-target]');
            serviceCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Evitamos que el clic en la tarjeta active los enlaces de agendar dentro de ella.
                    // El modal tendrá su propio botón para agendar.
                    if (e.target.closest('a')) {
                        return;
                    }

                    const isPresencial = card.classList.contains('presencial');
                    const eventLabel = isPresencial ? 'Ver Mas Presencial' : 'Ver Mas Online';
                    const adsLabel = card.dataset.adsConversion; // Leer la etiqueta de conversión desde el HTML

                    this.trackConversion(
                        { eventName: 'ver_mas_modalidad', eventCategory: 'Clic', eventLabel: eventLabel },
                        adsLabel
                    );

                    // Abrir el modal correspondiente
                    this.openModalByTarget(card.dataset.modalTarget);
                });
            });

            // Seguimiento de envíos de todos los formularios de contacto
            document.querySelectorAll('.contact-form, .cf-form').forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const prevision = form.querySelector('[name="prevision"]')?.value || '';
                    const origen = form.querySelector('[name="origen_formulario"]')?.value || 'Formulario';
                    const label = prevision ? `${origen} — ${prevision}` : origen;

                    const submitFormCallback = () => form.submit();

                    this.trackEvent('formulario_contacto', 'Submit', label);

                    if (typeof gtag === 'function') {
                        gtag('event', 'conversion', { 'send_to': 'AW-17584631597/euI3CNy83rgbEK3egMFB', 'event_callback': submitFormCallback });
                    } else {
                        submitFormCallback();
                    }

                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead', { content_name: label }, { eventID: crypto.randomUUID() });
                    }
                });
            });

            // Seguimiento de clics en redes sociales
            document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
                el.addEventListener('click', () => this.trackEvent('social', 'Clic', 'Instagram'));
            });
            document.querySelectorAll('a[href*="facebook.com"]').forEach(el => {
                el.addEventListener('click', () => this.trackEvent('social', 'Clic', 'Facebook'));
            });

            // Seguimiento de preguntas frecuentes (FAQ)
            // Nota: el script inline ya toggleó 'active' antes de que este listener corra,
            // por eso verificamos que 'active' esté presente (= acaba de abrirse).
            document.querySelectorAll('.faq-question').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.parentElement.classList.contains('active')) {
                        const question = btn.textContent.trim().substring(0, 80);
                        const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                        this.trackEvent('faq_abierta', 'FAQ', `${question} — ${page}`);
                    }
                });
            });

            // Seguimiento de CTA en Artículos del Blog
            document.querySelectorAll('.article-cta-box .btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.trackEvent('blog_cta', 'Clic', 'CTA Articulo a Inicio');
                });
            });

            // Seguimiento del botón de scroll-down
            document.querySelector('.scroll-down-indicator')?.addEventListener('click', () => {
                this.trackEvent('navegacion', 'Clic', 'Scroll Down Indicator');
            });


            // Componentes críticos: se ejecutan inmediatamente
            this.initAccordions(); // Acordeones de preguntas frecuentes
            this.initReadMoreToggle(); // Botón "Continuar leyendo"
            this.initModalSystem(); // Sistema general de modales
            this.initHelpTopicCards(); // Lógica específica para tarjetas de ayuda

            // Componentes no-críticos: diferidos para reducir TBT (Total Blocking Time)
            const deferInit = (fn) => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => fn.call(this));
                } else {
                    setTimeout(() => fn.call(this), 0);
                }
            };
            deferInit(this.initImageLightbox); // Visor de imágenes de la galería
            deferInit(this.initTestimonialSlider); // Carrusel de testimonios
            deferInit(this.initTherapistCarousel); // Carrusel de Terapeutas
            deferInit(this.initIsapreAccordion); // Lista Acordeón de ISAPREs
            deferInit(this.initCardTracking); // Seguimiento de clics en tarjetas
            deferInit(this.initContactForms); // Formularios de contacto interactivos
        },

        // Nuevo método para seguir clics en tarjetas de terapeutas y temas de ayuda
        initCardTracking() {
            // Seguimiento de tarjetas de terapeutas
            document.querySelectorAll('.therapist-card-mini').forEach(card => {
                card.addEventListener('click', () => {
                    const therapistName = card.querySelector('h3')?.textContent.trim() || 'Desconocido';
                    const context = card.closest('section')?.id || 'general';
                    this.trackEvent('interaccion_terapeuta', 'Clic Tarjeta', `${therapistName} (${context})`);
                });
            });

            // Seguimiento de tarjetas de temas de ayuda (FAQ/Temas)
            document.querySelectorAll('.topic-card').forEach(card => {
                card.addEventListener('click', () => {
                    const topicTitle = card.querySelector('span')?.textContent.trim() || 'Tema Desconocido';
                    this.trackEvent('interaccion_ayuda', 'Clic Tarjeta', topicTitle);
                });
            });
        },




        // Lógica para mostrar/ocultar header en scroll
        handleHeaderVisibility() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > this.lastScrollTop && scrollTop > this.header.offsetHeight) {
                // Scroll hacia abajo
                this.header.classList.add('header-hidden');
            } else {
                // Scroll hacia arriba
                this.header.classList.remove('header-hidden');
            }
            this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        },


        // Lógica para el componente de acordeón
        initAccordions() {
            const accordionButtons = document.querySelectorAll('.accordion-button');
            accordionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const content = button.nextElementSibling;
                    const icon = button.querySelector('.icon');

                    // Alternar clase activa en el botón
                    const isActive = button.classList.toggle('active');

                    if (isActive) {
                        content.style.display = 'block';
                        // Evento de seguimiento para apertura de acordeón
                        const accordionTitle = button.textContent.trim().replace(/<span.*<\/span>/, '').trim();
                        this.trackEvent('interaccion', 'Abrir Acordeon', accordionTitle);
                    } else {
                        content.style.display = 'none';
                    }
                });
            });
        },

        // Lógica para expandir/contraer descripciones de terapeutas
        initReadMoreToggle() {
            const readMoreButtons = document.querySelectorAll('.read-more-btn');
            readMoreButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // El wrapper es el elemento hermano anterior al botón
                    const wrapper = button.previousElementSibling;
                    if (wrapper && wrapper.classList.contains('about-me-description-wrapper')) {
                        wrapper.classList.toggle('expanded');
                        const isExpanded = wrapper.classList.contains('expanded');

                        if (isExpanded) {
                            button.textContent = 'Mostrar menos';
                            // Evento de seguimiento para "Continuar leyendo"
                            const parentCard = button.closest('.therapist-card, .about-us-content');
                            const titleElement = parentCard?.querySelector('h3, h2');
                            // Limpia el título de etiquetas HTML internas como <span>
                            const therapistName = titleElement ? titleElement.textContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, ' ').trim() : 'Desconocido';
                            this.trackEvent('interaccion', 'Clic', `Continuar Leyendo - ${therapistName}`);
                        } else {
                            button.textContent = 'Continuar leyendo';
                        }
                    }
                });
            });
        },

        // Lógica para los modales de los terapeutas
        initTherapistModals() {
            const modalTriggers = document.querySelectorAll('[data-modal-target]');
            // Este listener es específico para los terapeutas, para trackear el evento.
            const modals = document.querySelectorAll('.modal');
            const closeButtons = document.querySelectorAll('.modal-close');

            const openModal = (modal) => {
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
                }
            };

            const closeModal = (modal) => {
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = ''; // Restaura el scroll
                }
            };

            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const modal = document.querySelector(trigger.dataset.modalTarget);
                    openModal(modal);
                });
            });

            closeButtons.forEach(button => {
                button.addEventListener('click', () => closeModal(button.closest('.modal')));
            });

            modals.forEach(modal => {
                modal.addEventListener('click', e => {
                    if (e.target === modal) closeModal(modal); // Cierra si se hace clic en el fondo
                });
            });
        },

        // Lógica para el visor de imágenes (Lightbox)
        initImageLightbox() {
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image-content');
            const closeButton = document.querySelector('.image-modal-close');
            const imageTriggers = document.querySelectorAll('.lightbox-trigger');

            if (!modal || !modalImg || !closeButton) return;

            const openModal = (src) => {
                if (!modal) return;
                modalImg.src = src;
                modal.style.display = 'flex'; // Primero lo mostramos
                setTimeout(() => { // Luego aplicamos la opacidad para la transición
                    modal.classList.add('active');
                }, 10); // Pequeño delay para que la transición funcione
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                if (!modal) return;
                modal.classList.remove('active');
                // Esperamos que termine la transición de opacidad para ocultarlo
                setTimeout(() => { modal.style.display = 'none'; }, 300); // 300ms es la duración de la transición en CSS
                document.body.style.overflow = '';
            };

            imageTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal(trigger.src);
                });
            });

            closeButton.addEventListener('click', closeModal);

            modal.addEventListener('click', (e) => {
                // Cierra el modal si se hace clic en el fondo (fuera de la imagen)
                if (e.target === modal) {
                    closeModal();
                }
            });
        },

        // Lógica para las tarjetas de ayuda expandibles
        initHelpTopicCards() {
            // Esta función ahora reutiliza la lógica de los modales
            const modalTriggers = document.querySelectorAll('.topic-card[data-modal-target]');
            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const topicName = trigger.querySelector('span')?.textContent.trim() || 'Tema Desconocido';
                    // Lee la etiqueta de conversión específica del atributo data-ads-conversion
                    const adsLabel = trigger.dataset.adsConversion;

                    this.trackConversion(
                        { eventName: 'interaccion_ayuda', eventCategory: 'Clic', eventLabel: `Ayuda con ${topicName}` },
                        adsLabel // Envía la etiqueta específica a Google Ads
                    );

                    this.openModalByTarget(trigger.dataset.modalTarget);
                });
            });
        },

        // --- Métodos de ayuda para modales (reutilizables) ---
        openModalByTarget(targetSelector) {
            const modal = document.querySelector(targetSelector);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        closeAllModals() {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        },

        initModalSystem() {
            const modalTriggers = document.querySelectorAll('[data-modal-target]');
            const closeButtons = document.querySelectorAll('.modal-close');
            const modals = document.querySelectorAll('.modal');

            // Abrir modales
            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    this.openModalByTarget(trigger.dataset.modalTarget);
                });
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.openModalByTarget(trigger.dataset.modalTarget);
                    }
                });
            });

            // Cerrar modales
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.closeAllModals());
            });

            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.closeAllModals();
                });
            });
        },

        // Lógica para el carrusel de testimonios
        initTestimonialSlider() {
            const sliders = document.querySelectorAll('.testimonial-slider');

            sliders.forEach(slider => {
                const track = slider.querySelector('.testimonial-track');
                const slides = Array.from(track.children);
                const nextButton = slider.querySelector('.next');
                const prevButton = slider.querySelector('.prev');

                if (!track || slides.length === 0 || !nextButton || !prevButton) return;

                let currentIndex = 0;

                const moveToSlide = (index) => {
                    track.style.transform = 'translateX(-' + 100 * index + '%)';
                    currentIndex = index;
                };

                nextButton.addEventListener('click', () => {
                    const nextIndex = (currentIndex + 1) % slides.length;
                    moveToSlide(nextIndex);
                });

                prevButton.addEventListener('click', () => {
                    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                    moveToSlide(prevIndex);
                });
            });
        },
        initTherapistCarousel() {
            const carousels = document.querySelectorAll('.therapist-carousel');
            // Usar matchMedia en lugar de window.innerWidth para evitar reprocesamiento forzado (forced reflow)
            const mobileQuery = window.matchMedia('(max-width: 768px)');

            carousels.forEach(carousel => {
                const track = carousel.querySelector('.therapist-track');
                // Use class based selection generally
                let nextButton = carousel.querySelector('.carousel-next');
                let prevButton = carousel.querySelector('.carousel-prev');

                if (!track) return;
                const slides = Array.from(track.children);

                // Fallback for Isapre buttons if needed (though we moved them inside in HTML, check IDs)
                if (!nextButton && carousel.classList.contains('isapre-3d-carousel')) {
                    nextButton = carousel.querySelector('#next-isapre') || document.getElementById('next-isapre');
                    prevButton = carousel.querySelector('#prev-isapre') || document.getElementById('prev-isapre');
                }

                if (slides.length === 0 || !nextButton || !prevButton) return;

                // Remove any legacy transform styles from track
                track.style.transform = 'none';
                track.style.transition = 'none';

                let currentIndex = 0;
                const slideCount = slides.length;

                const updateCarousel = () => {
                    // matchMedia.matches no causa reprocesamiento forzado (forced reflow)
                    const isMobile = mobileQuery.matches;
                    // Adjusted values for mobile and desktop to reduce "zoomed-in" feel
                    // Mobile: Card width is 176px. Shift should be slightly less to overlap or equal.
                    // Mobile: 130px ensures overlap ratio matches desktop (approx 28% overlap)
                    const shiftX = isMobile ? 130 : 180; // Mobile: 130px better spacing (before was 140)
                    const activeScale = isMobile ? 1.05 : 1.05;
                    const activeZ = isMobile ? 30 : 50;
                    const sideScale = isMobile ? 0.85 : 0.85;
                    const sideZ = -100;

                    slides.forEach((slide, index) => {
                        // Calculate distance from current index in a circular manner
                        let diff = (index - currentIndex) % slideCount;
                        if (diff < 0) diff += slideCount;

                        // Adjust diff to be -1, 0, 1 etc centered around current
                        if (diff > slideCount / 2) diff -= slideCount;

                        // Reset classes
                        slide.classList.remove('active-card', 'prev-card', 'next-card');

                        // Apply styles based on position
                        // Active (Center)
                        if (diff === 0) {
                            slide.classList.add('active-card');
                            slide.style.transform = `translateX(0) translateZ(${activeZ}px) rotateY(0deg) scale(${activeScale})`;
                            slide.style.zIndex = '10';
                            slide.style.opacity = '1';
                            // slide.style.filter = 'blur(0px)'; // Removed for performance
                        }
                        // Next (Right)
                        else if (diff === 1) {
                            slide.classList.add('next-card');
                            slide.style.transform = `translateX(${shiftX}px) translateZ(${sideZ}px) rotateY(-20deg) scale(${sideScale})`;
                            slide.style.zIndex = '5';
                            slide.style.opacity = '0.7';
                            // slide.style.filter = 'blur(1px)'; // Removed for performance
                        }
                        // Prev (Left)
                        else if (diff === -1) {
                            slide.classList.add('prev-card');
                            slide.style.transform = `translateX(-${shiftX}px) translateZ(${sideZ}px) rotateY(20deg) scale(${sideScale})`;
                            slide.style.zIndex = '5';
                            slide.style.opacity = '0.7';
                            // slide.style.filter = 'blur(1px)'; // Removed for performance
                        }
                        // Others (Hidden/Back)
                        else {
                            slide.style.transform = `translateX(${diff * 50}px) translateZ(-300px) scale(0.5)`;
                            slide.style.zIndex = '1';
                            slide.style.opacity = '0';
                        }

                        // Transition is handled by CSS on the card class
                    });
                };

                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % slideCount; // Move forward: 0 -> 1 -> 2 -> 0
                    updateCarousel();
                });

                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + slideCount) % slideCount; // Move backward: 0 -> 2 -> 1 -> 0
                    updateCarousel();
                });

                // Handle Keydown
                carousel.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight') nextButton.click();
                    if (e.key === 'ArrowLeft') prevButton.click();
                });

                // Usar matchMedia en lugar de resize + debounce para actualizaciones responsivas
                mobileQuery.addEventListener('change', updateCarousel);

                // --- Touch Swipe Support ---
                let touchStartX = 0;
                let touchEndX = 0;
                const minSwipeDistance = 50; // Minimum distance to trigger swipe

                carousel.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                carousel.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }, { passive: true });

                const handleSwipe = () => {
                    if (touchEndX < touchStartX - minSwipeDistance) {
                        // Swipe Left -> Next
                        nextButton.click();
                    }
                    if (touchEndX > touchStartX + minSwipeDistance) {
                        // Swipe Right -> Prev
                        prevButton.click();
                    }
                };

                // Initial call
                setTimeout(updateCarousel, 100);
            });
        },

        initContactForms() {
            // Tarjetas de motivo
            document.querySelectorAll('.cf-cards').forEach(grid => {
                const targetInput = document.getElementById(grid.id + '-val');
                grid.querySelectorAll('.cf-card').forEach(card => {
                    card.addEventListener('click', () => {
                        grid.querySelectorAll('.cf-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        if (targetInput) targetInput.value = card.dataset.value;
                    });
                });
            });
            // Pills (modalidad, previsión)
            document.querySelectorAll('.cf-pills[data-target]').forEach(group => {
                const targetInput = document.getElementById(group.dataset.target);
                group.querySelectorAll('.cf-pill').forEach(pill => {
                    pill.addEventListener('click', () => {
                        group.querySelectorAll('.cf-pill').forEach(p => p.classList.remove('selected'));
                        pill.classList.add('selected');
                        if (targetInput) targetInput.value = pill.dataset.value;
                    });
                });
            });
        },

        initIsapreAccordion() {
            const isapreItems = document.querySelectorAll('.isapre-list-item');

            isapreItems.forEach(item => {
                const header = item.querySelector('.isapre-list-header');
                if (!header) return;

                header.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    // Cerrar todos los items primero (comportamiento de acordeón exclusivo)
                    isapreItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                        const body = otherItem.querySelector('.isapre-list-body');
                        if (body) body.style.maxHeight = null;
                    });

                    // Si no estaba activo, abrirlo
                    if (!isActive) {
                        item.classList.add('active');
                        const body = item.querySelector('.isapre-list-body');
                        if (body) {
                            body.style.maxHeight = body.scrollHeight + "px";
                        }

                        // Evento de seguimiento
                        const isapreName = item.querySelector('.isapre-name')?.textContent || 'Desconocida';
                        this.trackEvent('interaccion_isapre', 'Abrir Acordeon', isapreName);
                    }
                });
            });

            // --- BOTONES: Solicitar Información (Prepara el modal) ---
            const requestButtons = document.querySelectorAll('.request-isapre-btn');
            requestButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitar que el acordeón se cierre/abra al hacer click en el botón

                    const isapreName = btn.getAttribute('data-isapre');

                    // 1. Poner nombre en el título del modal
                    const modalTitle = document.getElementById('modal-isapre-title');
                    if (modalTitle) {
                        const highlight = modalTitle.querySelector('.highlight');
                        if (highlight) highlight.textContent = isapreName;
                        else modalTitle.textContent = 'Más información sobre ' + isapreName;
                    }

                    // 2. Poner nombre en el cuerpo del texto
                    const modalName = document.getElementById('modal-isapre-name');
                    if (modalName) modalName.textContent = isapreName;

                    // 3. Poner nombre en el input oculto
                    const hiddenInput = document.getElementById('isapre-info-hidden');
                    if (hiddenInput) hiddenInput.value = isapreName;

                    // 4. Abrir el modal
                    this.openModalByTarget('#modal-isapre-info');

                    // Tracking
                    this.trackEvent('interaccion_isapre', 'Click Solicitud', isapreName);
                });
            });
        }
    };

    // Iniciar la aplicación
    app.init();
});
