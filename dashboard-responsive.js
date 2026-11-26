// dashboard-responsive.js
// Mobile sidebar drawer for the farmer dashboard pages.
// Plain script (not a module) so it works on every page, even if script.js fails.
(function () {
    function init() {
        var hamburger = document.getElementById('hamburgerBtn');
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        if (!hamburger || !sidebar || !overlay) return;

        function openMenu() {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
        }
        function closeMenu() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        hamburger.addEventListener('click', function () {
            if (sidebar.classList.contains('open')) { closeMenu(); } else { openMenu(); }
        });
        overlay.addEventListener('click', closeMenu);

        // Close after tapping a menu link
        var links = sidebar.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', closeMenu);
        }

        // Close with Escape, and reset when the window grows past mobile size
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
