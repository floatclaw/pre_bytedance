(function() {
    'use strict';

    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Theme toggle
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️ 亮色模式';
        }

        themeToggle.addEventListener('click', () => {
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙 暗色模式';
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️ 亮色模式';
            }
        });
    }

    // Mobile menu
    function initMobileMenu() {
        if (!menuToggle || !sidebar) return;

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking on a nav link on mobile
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }

    // Scroll spy
    function initScrollSpy() {
        if (!sections.length || !navLinks.length) return;

        function updateActiveLink() {
            let current = '';
            const scrollPos = window.scrollY + 120;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollPos >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
    }

    // Progress tracker based on quiz completion
    function updateProgress() {
        if (!progressFill || !progressText) return;

        try {
            const quizState = JSON.parse(localStorage.getItem('milvus_quiz_state') || '{}');
            const chapters = Object.keys(quizState).filter(k => k.startsWith('chapter'));
            const totalChapters = document.querySelectorAll('.quiz-container').length;

            if (totalChapters === 0) return;

            let completed = 0;
            chapters.forEach(chapterId => {
                const state = quizState[chapterId];
                if (state && state.completed) {
                    completed++;
                }
            });

            const percent = Math.round((completed / totalChapters) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = percent + '%';
        } catch (e) {
            console.warn('Progress update failed:', e);
        }
    }

    // Reveal animations on scroll
    function initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // Accordion for case studies and interview Q&A
    function initAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const isOpen = body.classList.contains('open');

                // Close siblings if needed
                const parent = header.closest('.accordion-group');
                if (parent) {
                    parent.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
                    parent.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
                }

                if (!isOpen) {
                    body.classList.add('open');
                    header.classList.add('active');
                }
            });
        });
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    // Initialize
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initRevealAnimations();
    initAccordions();
    initSmoothScroll();

    // Expose progress updater globally
    window.updateCourseProgress = updateProgress;

    // Initial progress update
    updateProgress();
})();
