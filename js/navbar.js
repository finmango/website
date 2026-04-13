/* ============================================
   SHARED NAVBAR JAVASCRIPT
   Reference: index.html navbar implementation
   ============================================ */

(function () {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initNavScroll();
        initMobileMenu();
        initMobileAccordion();
    });

    /* ============================================
       NAVIGATION SCROLL EFFECT
       ============================================ */
    function initNavScroll() {
        var nav = document.getElementById('nav');
        if (!nav) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    /* ============================================
       MOBILE MENU TOGGLE
       ============================================ */
    function initMobileMenu() {
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        var mobileMenu = document.getElementById('mobileMenu');

        if (!mobileMenuBtn || !mobileMenu) return;

        // Toggle menu on button click
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.mobile-menu a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ============================================
       MOBILE ACCORDION DROPDOWNS
       ============================================ */
    function initMobileAccordion() {
        var toggles = document.querySelectorAll('.mobile-dropdown-toggle');

        toggles.forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                // Toggle active class on button
                this.classList.toggle('active');

                // Toggle open class on content
                var content = this.nextElementSibling;
                if (content) {
                    content.classList.toggle('open');
                }
            });
        });
    }


})();
