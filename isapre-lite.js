(function () {
    'use strict';

    var menuData = [
        { nombre: 'Inicio', url: '/#hero' },
        {
            nombre: 'Servicios Cl\u00ednicos',
            url: '/servicios-clinicos',
            subsecciones: [
                { nombre: 'Ver todos los servicios', url: '/servicios-clinicos' },
                { nombre: 'Terapia individual', url: '/terapia-individual' },
                { nombre: 'Terapia de pareja', url: '/terapia-pareja' },
                { nombre: 'Terapia familiar', url: '/terapia-familiar' },
                { nombre: 'Terapia infantojuvenil', url: '/terapia-infanto-juvenil' },
                { nombre: 'Terapia online', url: '/terapia-online' },
                { nombre: 'Terapia presencial', url: '/terapia-presencial' },
                { nombre: 'Psicolog\u00eda deportiva', url: '/psicologia-deportiva' },
                { nombre: 'Certificado mascota', url: '/certificado-mascota' }
            ]
        },
        { nombre: 'Sobre Nosotros', url: '/sobre-nosotros' },
        { nombre: 'Fonasa', url: '/fonasa' },
        {
            nombre: 'Isapre',
            url: '/isapre',
            subsecciones: [
                { nombre: 'Ver todas las ISAPREs', url: '/isapre' },
                { nombre: 'Colmena', url: '/colmena' },
                { nombre: 'Banm\u00e9dica', url: '/banmedica' },
                { nombre: 'Cruz Blanca', url: '/cruz-blanca' },
                { nombre: 'Consalud', url: '/consalud' },
                { nombre: 'Vida Tres', url: '/vida-tres' },
                { nombre: 'Nueva M\u00e1svida', url: '/nueva-masvida' }
            ]
        },
        { nombre: 'Pol\u00edticas', url: '/politicas-cancelacion' },
        { nombre: 'Blog', url: '/blog' }
    ];

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function initNavigation() {
        var navUl = document.getElementById('main-nav-ul');
        var nav = document.getElementById('main-nav');
        var hamburger = document.getElementById('hamburger-menu');
        var hamburgerIcon = hamburger ? hamburger.querySelector('i') : null;

        if (navUl && !navUl.children.length) {
            navUl.innerHTML = menuData.map(function (item) {
                if (!item.subsecciones) return '<li><a href="' + item.url + '">' + item.nombre + '</a></li>';
                var subItems = item.subsecciones.map(function (sub) {
                    return '<li><a href="' + sub.url + '">' + sub.nombre + '</a></li>';
                }).join('');
                return '<li class="dropdown"><a href="' + item.url + '" class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">' + item.nombre + ' <i class="fas fa-chevron-down" aria-hidden="true"></i></a><ul class="dropdown-menu">' + subItems + '</ul></li>';
            }).join('');
        }

        if (navUl) {
            navUl.querySelectorAll('li.dropdown').forEach(function (li) {
                var toggle = li.querySelector('.dropdown-toggle');
                li.addEventListener('mouseenter', function () {
                    if (window.innerWidth > 768) {
                        li.classList.add('open');
                        if (toggle) toggle.setAttribute('aria-expanded', 'true');
                    }
                });
                li.addEventListener('mouseleave', function () {
                    if (window.innerWidth > 768) {
                        li.classList.remove('open');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            navUl.addEventListener('click', function (event) {
                var toggle = event.target.closest('.dropdown-toggle');
                if (toggle && window.innerWidth <= 768) {
                    event.preventDefault();
                    var item = toggle.closest('.dropdown');
                    var isOpen = item.classList.toggle('open');
                    toggle.setAttribute('aria-expanded', String(isOpen));
                    return;
                }

                if (nav && event.target.closest('a')) closeMenu();
            });
        }

        function closeMenu() {
            if (!nav || !hamburger) return;
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menu de navegacion');
            if (hamburgerIcon) {
                hamburgerIcon.classList.add('fa-bars');
                hamburgerIcon.classList.remove('fa-times');
            }
        }

        if (hamburger && nav) {
            hamburger.addEventListener('click', function (event) {
                event.stopPropagation();
                var isOpen = !nav.classList.contains('active');
                nav.classList.toggle('active', isOpen);
                document.body.classList.toggle('menu-open', isOpen);
                hamburger.setAttribute('aria-expanded', String(isOpen));
                hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion');
                if (hamburgerIcon) {
                    hamburgerIcon.classList.toggle('fa-bars', !isOpen);
                    hamburgerIcon.classList.toggle('fa-times', isOpen);
                }
            });

            document.addEventListener('click', function (event) {
                if (nav.classList.contains('active') && !nav.contains(event.target) && !hamburger.contains(event.target)) {
                    closeMenu();
                }
            });
        }
    }

    function initReveal() {
        var revealEls = document.querySelectorAll('.reveal-up');
        if (!revealEls.length) return;
        if (!('IntersectionObserver' in window)) {
            revealEls.forEach(function (el) { el.classList.add('revealed'); });
            return;
        }
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealObs.observe(el); });
    }

    function initAccordions() {
        document.querySelectorAll('.isapre-row-header').forEach(function (header) {
            header.addEventListener('click', function () {
                header.parentElement.classList.toggle('active');
            });
        });

        document.querySelectorAll('.faq-question').forEach(function (button) {
            button.addEventListener('click', function () {
                button.parentElement.classList.toggle('active');
            });
        });
    }

    function initCounters() {
        var counters = document.querySelectorAll('.proof-counter[data-target]');
        if (!counters.length || !('IntersectionObserver' in window)) return;
        var counterObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseFloat(el.getAttribute('data-target'));
                var isDecimal = el.getAttribute('data-decimal') === 'true';
                var startTime = 0;
                function animate(ts) {
                    if (!startTime) startTime = ts;
                    var progress = Math.min((ts - startTime) / 1500, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    var current = target * eased;
                    el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                    if (progress < 1) requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);
                counterObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        counters.forEach(function (counter) { counterObs.observe(counter); });
    }

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initModals() {
        document.querySelectorAll('.request-isapre-btn').forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                var isapre = button.getAttribute('data-isapre') || '';
                var modal = document.getElementById('modal-isapre-info');
                var nameEl = document.getElementById('modal-isapre-name');
                var hiddenEl = document.getElementById('isapre-info-hidden');
                if (nameEl) nameEl.textContent = isapre;
                if (hiddenEl) hiddenEl.value = isapre;
                openModal(modal);
            });
        });

        document.querySelectorAll('[data-modal-target]').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                openModal(document.querySelector(trigger.getAttribute('data-modal-target')));
            });
        });

        document.querySelectorAll('.modal').forEach(function (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === modal) closeModal(modal);
            });
            var closeButton = modal.querySelector('.modal-close');
            if (closeButton) closeButton.addEventListener('click', function () { closeModal(modal); });
        });
    }

    function initPills() {
        document.querySelectorAll('.cf-pills[data-target]').forEach(function (group) {
            var targetInput = document.getElementById(group.dataset.target);
            group.querySelectorAll('.cf-pill').forEach(function (pill) {
                pill.addEventListener('click', function () {
                    group.querySelectorAll('.cf-pill').forEach(function (item) { item.classList.remove('selected'); });
                    pill.classList.add('selected');
                    if (targetInput) targetInput.value = pill.dataset.value;
                });
            });
        });
    }

    function initTracking() {
        document.addEventListener('click', function (event) {
            var whatsapp = event.target.closest('a[href*="wa.me"]');
            var encuadrado = event.target.closest('a[href*="encuadrado.com"]');
            var profile = event.target.closest('.therapist-link-profile');
            var label = whatsapp ? 'whatsapp_isapre' : encuadrado ? 'encuadrado_isapre' : profile ? 'perfil_isapre' : '';
            if (!label || typeof window.gtag !== 'function') return;
            if (typeof window.loadGtag === 'function') window.loadGtag();
            window.gtag('event', label, { event_category: 'Interaccion', event_label: window.location.pathname });
        });

        document.addEventListener('submit', function (event) {
            var form = event.target.closest('.contact-form, .cf-form');
            if (!form || typeof window.gtag !== 'function') return;
            if (typeof window.loadGtag === 'function') window.loadGtag();
            window.gtag('event', 'formulario_contacto', {
                event_category: 'Submit',
                event_label: form.id || 'formulario_isapre'
            });
        });
    }

    onReady(function () {
        initNavigation();
        initReveal();
        initAccordions();
        initCounters();
        initModals();
        initPills();
        initTracking();
    });
})();
