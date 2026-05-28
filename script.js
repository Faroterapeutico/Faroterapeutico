// --- Lógica principal de la aplicación ---
document.addEventListener('DOMContentLoaded', () => {
    const TRACKING_SRC = 'https://www.googletagmanager.com/gtag/js?id=GT-5TJMG836';
    const TRACKING_AUTO_DELAY = window.FARO_TRACKING_AUTO_DELAY || 10000;
    const TRACKING_IDLE_TIMEOUT = 2000;

    function bootstrapTrackingQueue() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
            if (arguments[0] === 'event') loadTrackingIfMissing();
        };
    }

    function loadTrackingIfMissing() {
        bootstrapTrackingQueue();
        if (window._gtagLoaded || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
        window._gtagLoaded = true;

        const script = document.createElement('script');
        script.async = true;
        script.src = TRACKING_SRC;
        document.head.appendChild(script);

        window.gtag('js', new Date());
        window.gtag('config', 'GT-5TJMG836');
        window.gtag('config', 'AW-17584631597');
    }

    function scheduleTrackingLoad() {
        const runWhenIdle = () => {
            const load = () => loadTrackingIfMissing();
            if ('requestIdleCallback' in window) {
                requestIdleCallback(load, { timeout: TRACKING_IDLE_TIMEOUT });
            } else {
                setTimeout(load, 0);
            }
        };

        const schedule = () => setTimeout(runWhenIdle, TRACKING_AUTO_DELAY);
        if (document.readyState === 'complete') {
            schedule();
        } else {
            window.addEventListener('load', schedule, { once: true });
        }
    }

    bootstrapTrackingQueue();
    window.loadFaroTracking = loadTrackingIfMissing;
    window.loadGtag = window.loadGtag || loadTrackingIfMissing;
    scheduleTrackingLoad();

    const app = {
        // Método para enviar eventos a Google Analytics
        trackEvent(eventName, eventCategory, eventLabel) {
            loadTrackingIfMissing();
            window.gtag('event', eventName, {
                'event_category': eventCategory,
                'event_label': eventLabel
            });
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
                    url: "/#hero"
                },
                {
                    nombre: "Servicios Clínicos", // 2. Servicios Clínicos
                    url: "/servicios-clinicos",
                    subsecciones: [
                        { nombre: "Ver todos los servicios", url: "/servicios-clinicos" },
                        { nombre: "Terapia individual", url: "/terapia-individual" },
                        { nombre: "Terapia de pareja", url: "/terapia-pareja" },
                        { nombre: "Terapia familiar", url: "/terapia-familiar" },
                        { nombre: "Terapia infantojuvenil", url: "/terapia-infanto-juvenil" },
                        { nombre: "Terapia online", url: "/terapia-online" },
                        { nombre: "Terapia presencial", url: "/terapia-presencial" },
                        { nombre: "Psicología deportiva", url: "/psicologia-deportiva" },
                        { nombre: "Certificado mascota", url: "/certificado-mascota" }
                    ]
                },
                {
                    nombre: "Sobre Nosotros", // 3. Sobre Nosotros
                    url: "/sobre-nosotros"
                },
                {
                    nombre: "Fonasa", // 4. Fonasa
                    url: "/fonasa"
                },
                {
                    nombre: "Isapre", // 5. Reembolso ISAPRE
                    url: "/isapre",
                    subsecciones: [
                        { nombre: "Ver todas las ISAPREs", url: "/isapre" },
                        { nombre: "Colmena", url: "/colmena" },
                        { nombre: "Banmédica", url: "/banmedica" },
                        { nombre: "Cruz Blanca", url: "/cruz-blanca" },
                        { nombre: "Consalud", url: "/consalud" },
                        { nombre: "Vida Tres", url: "/vida-tres" },
                        { nombre: "Nueva Másvida", url: "/nueva-masvida" }
                    ]
                },
                {
                    nombre: "Políticas", // 6. Políticas de Cancelación
                    url: "/politicas-cancelacion"
                },
                {
                    nombre: "Blog", // 7. Blog
                    url: "/blog"
                }
            ];

            const navUl = document.getElementById('main-nav-ul');
            if (!navUl) return;

            navUl.innerHTML = menuData.map(item => {
                if (item.subsecciones && item.subsecciones.length > 0) {
                    const subItems = item.subsecciones.map(sub => `<li><a href="${sub.url}">${sub.nombre}</a></li>`).join('');
                    return `<li class="dropdown">
                                <a href="${item.url}" class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">${item.nombre} <i class="fas fa-chevron-down" aria-hidden="true"></i></a>
                                <ul class="dropdown-menu">${subItems}</ul>
                            </li>`;
                }
                return `<li><a href="${item.url}">${item.nombre}</a></li>`;
            }).join('');

            // Dropdown: hover en desktop, clic en móvil
            navUl.querySelectorAll('li.dropdown').forEach(li => {
                const toggle = li.querySelector('.dropdown-toggle');

                // --- Desktop: abrir/cerrar con mouseenter/mouseleave ---
                li.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        li.classList.add('open');
                        if (toggle) toggle.setAttribute('aria-expanded', 'true');
                    }
                });
                li.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768) {
                        li.classList.remove('open');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    }
                });

                // --- Móvil: abrir/cerrar con clic ---
                if (toggle) {
                    toggle.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            li.classList.toggle('open');
                            toggle.setAttribute('aria-expanded', String(li.classList.contains('open')));
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
                });

                document.querySelectorAll('.main-nav a').forEach(link => {
                    link.addEventListener('click', () => {
                        // En móvil, el dropdown-toggle NO cierra el menú (despliega sub-items)
                        if (window.innerWidth <= 768 && link.classList.contains('dropdown-toggle')) return;

                        nav.classList.remove('active');
                        document.body.classList.remove('menu-open');
                        // Evento de seguimiento para clics en la navegación principal
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
            if (this.header) {
                window.addEventListener('scroll', () => {
                    this.handleHeaderVisibility();
                }, { passive: true });
            }

            this.initRevealEffects();

            // Función de callback para el seguimiento de eventos de contacto
            const contactConversionCallback = (url) => {
                let opened = false;
                const openUrl = () => {
                    if (opened) return;
                    opened = true;
                    window.open(url, '_blank');
                };
                const fallback = setTimeout(openUrl, 800);
                return function () {
                    clearTimeout(fallback);
                    openUrl();
                };
            };

            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a[href*="wa.me"]');
                if (!anchor) return;
                e.preventDefault();

                const linkText = anchor.textContent.trim() || 'WhatsApp';
                const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                const label = `${linkText} — ${page}`;

                this.trackEvent('contacto_whatsapp', 'WhatsApp', label);
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-17584631597/xJYeCMuY2qYbEK3egMFB',
                    'event_callback': contactConversionCallback(anchor.href)
                });

                if (typeof fbq === 'function') {
                    fbq('track', 'Contact', { content_name: label }, { eventID: crypto.randomUUID() });
                }
            });

            // Seguimiento de clics en Encuadrado
            document.addEventListener('click', (e) => {
                const el = e.target.closest('a[href*="encuadrado.com"]:not([href*="ayuda.encuadrado.com"])');
                if (!el) return;

                const label = el.textContent.trim() || 'Encuadrado';
                const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                if (el.matches('.encuadrado-inline-link')) {
                    this.trackEvent('clic_centro_encuadrado', 'Encuadrado', `${label} — ${page}`);
                    return;
                }
                if (el.matches('[data-encuadrado-center="true"]')) {
                    this.trackEvent('clic_centro_encuadrado', 'Encuadrado', `${label} — ${page}`);
                }
                this.trackEvent('agendar_encuadrado', 'Encuadrado', `${label} — ${page}`);
                window.gtag('event', 'conversion', { 'send_to': 'AW-17584631597/g_YJCL_h_vQZEJq29_oq' });
                if (typeof fbq === 'function') fbq('track', 'Schedule', { content_name: `Encuadrado — ${page}` }, { eventID: crypto.randomUUID() });
            });

            // Seguimiento de todos los clics en enlaces de Calendly
            document.addEventListener('click', (e) => {
                const el = e.target.closest('a[href*="calendly.com"], button[onclick*="calendly.com"]');
                if (!el) return;

                const isOrientation = el.href?.includes('/orientacion') || el.getAttribute('onclick')?.includes('/orientacion');
                if (isOrientation) {
                    window.gtag('event', 'conversion', { 'send_to': 'AW-17584631597/jLpYCK6Y2qYbEK3egMFB' });
                    if (typeof fbq === 'function') fbq('track', 'Lead', {}, { eventID: crypto.randomUUID() });
                } else {
                    const therapist = el.dataset.therapist;
                    const therapistName = therapist ? therapist.charAt(0).toUpperCase() + therapist.slice(1) : 'General';
                    window.gtag('event', 'conversion', { 'send_to': 'AW-17584631597/g_YJCL_h_vQZEJq29_oq' });
                    if (typeof fbq === 'function') fbq('track', 'Schedule', { content_name: `Agendar con ${therapistName}` }, { eventID: crypto.randomUUID() });
                }
            });

            // Tracking de clics en "Ver perfil" de terapeutas (index, fonasa, isapres, sobre-nosotros, etc.)
            document.addEventListener('click', (e) => {
                const el = e.target.closest('a[href="aaron"], a[href="david"], a[href="isidora"], a[href="aaron.html"], a[href="david.html"], a[href="isidora.html"]');
                if (!el) return;

                const href = el.getAttribute('href').replace('.html', '');
                this.trackEvent('clic_ver_perfil', 'Perfiles', `Ver perfil — ${href.charAt(0).toUpperCase() + href.slice(1)}`);
            });

            // Seguimiento de envíos de todos los formularios de contacto
            document.addEventListener('submit', (e) => {
                const form = e.target.closest('.contact-form, .cf-form');
                if (!form) return;
                e.preventDefault();

                const prevision = form.querySelector('[name="prevision"]')?.value || '';
                const origen = form.querySelector('[name="origen_formulario"]')?.value || 'Formulario';
                const label = prevision ? `${origen} — ${prevision}` : origen;

                const submitFormCallback = (() => {
                    let submitted = false;
                    const submit = () => {
                        if (submitted) return;
                        submitted = true;
                        form.submit();
                    };
                    const fallback = setTimeout(submit, 900);
                    return () => {
                        clearTimeout(fallback);
                        submit();
                    };
                })();

                this.trackEvent('formulario_contacto', 'Submit', label);
                window.gtag('event', 'conversion', { 'send_to': 'AW-17584631597/euI3CNy83rgbEK3egMFB', 'event_callback': submitFormCallback });

                if (typeof fbq === 'function') {
                    fbq('track', 'Lead', { content_name: label }, { eventID: crypto.randomUUID() });
                }
            });

            // Seguimiento de preguntas frecuentes (FAQ) y CTA de artículos
            document.addEventListener('click', (e) => {
                const faqButton = e.target.closest('.faq-question');
                if (faqButton?.parentElement.classList.contains('active')) {
                    const question = faqButton.textContent.trim().substring(0, 80);
                    const page = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'inicio';
                    this.trackEvent('faq_abierta', 'FAQ', `${question} — ${page}`);
                    return;
                }

                if (e.target.closest('.article-cta-box .btn')) {
                    this.trackEvent('blog_cta', 'Clic', 'CTA Articulo a Inicio');
                }
            });

            const has = (selector) => document.querySelector(selector);

            // Componentes críticos: se ejecutan solo si la página los usa
            if (has('[data-modal-target], .modal-close, .modal')) this.initModalSystem();

            // Componentes no-críticos: diferidos para reducir TBT (Total Blocking Time)
            const runDuringIdle = (callback, timeout = 1500) => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(callback, { timeout });
                } else {
                    setTimeout(callback, 0);
                }
            };

            const initWhenNearViewport = (selector, fn, options = {}) => {
                const targets = document.querySelectorAll(selector);
                if (!targets.length) return;

                let initialized = false;
                const run = () => {
                    if (initialized) return;
                    initialized = true;
                    fn.call(this);
                };

                const fallbackDelay = options.fallbackDelay ?? 7000;
                const scheduleFallback = () => {
                    setTimeout(() => {
                        if (!initialized) runDuringIdle(run);
                    }, fallbackDelay);
                };

                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        if (!entries.some(entry => entry.isIntersecting)) return;
                        observer.disconnect();
                        runDuringIdle(run, 1000);
                    }, { rootMargin: options.rootMargin || '700px 0px' });

                    targets.forEach(target => observer.observe(target));
                    scheduleFallback();
                    return;
                }

                runDuringIdle(run, 1200);
            };

            if (has('.cf-cards, .cf-pills[data-target], .contact-form, .cf-form')) {
                initWhenNearViewport('.cf-cards, .cf-pills[data-target], .contact-form, .cf-form', this.initContactForms, { rootMargin: '1200px 0px', fallbackDelay: 3000 });
            }
        },

        // Lógica para mostrar/ocultar header en scroll
        handleHeaderVisibility() {
            if (!this.header) return;
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

        initRevealEffects() {
            const revealEls = document.querySelectorAll('.reveal-up:not(.revealed)');
            if (!revealEls.length) return;

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    });
                }, { threshold: 0.12 });

                revealEls.forEach(el => observer.observe(el));
                return;
            }

            revealEls.forEach(el => el.classList.add('revealed'));
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

    };

    // Iniciar la aplicación
    app.init();
});
