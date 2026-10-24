const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const responsive = require('../js/responsive.js');

test('Responsive Layout Engine Suite', async (t) => {
    await t.test('should define valid breakpoint constants', () => {
        assert.ok(responsive.BREAKPOINTS, 'BREAKPOINTS constant should be defined');
        assert.strictEqual(responsive.BREAKPOINTS.SMALL_MOBILE_MAX, 420);
        assert.strictEqual(responsive.BREAKPOINTS.MOBILE_MAX, 768);
        assert.strictEqual(responsive.BREAKPOINTS.TABLET_MAX, 1024);
    });

    await t.test('should correctly classify screen modes based on viewport width', () => {
        // Small Mobile
        assert.strictEqual(responsive.getScreenMode(320), 'mobile');
        assert.strictEqual(responsive.getScreenMode(420), 'mobile');
        // Phablet / Standard Mobile
        assert.strictEqual(responsive.getScreenMode(600), 'mobile');
        assert.strictEqual(responsive.getScreenMode(768), 'mobile');
        // Tablet (Portrait & Landscape)
        assert.strictEqual(responsive.getScreenMode(769), 'tablet');
        assert.strictEqual(responsive.getScreenMode(834), 'tablet');
        assert.strictEqual(responsive.getScreenMode(1024), 'tablet');
        // Desktop
        assert.strictEqual(responsive.getScreenMode(1025), 'desktop');
        assert.strictEqual(responsive.getScreenMode(1440), 'desktop');
        assert.strictEqual(responsive.getScreenMode(2560), 'desktop');
    });

    await t.test('should evaluate device view booleans accurately', () => {
        assert.strictEqual(responsive.isMobileView(375), true);
        assert.strictEqual(responsive.isMobileView(768), true);
        assert.strictEqual(responsive.isMobileView(769), false);

        assert.strictEqual(responsive.isTabletView(768), false);
        assert.strictEqual(responsive.isTabletView(769), true);
        assert.strictEqual(responsive.isTabletView(1024), true);
        assert.strictEqual(responsive.isTabletView(1025), false);

        assert.strictEqual(responsive.isDesktopView(1024), false);
        assert.strictEqual(responsive.isDesktopView(1025), true);
        assert.strictEqual(responsive.isDesktopView(1920), true);

        assert.strictEqual(responsive.isSmallMobileView(400), true);
        assert.strictEqual(responsive.isSmallMobileView(420), true);
        assert.strictEqual(responsive.isSmallMobileView(421), false);
    });

    await t.test('should handle default arguments and window fallbacks for screen detection', () => {
        // In headless Node environment where window is undefined or mock
        const mode = responsive.getScreenMode();
        assert.ok(['mobile', 'tablet', 'desktop'].includes(mode));

        const isMob = responsive.isMobileView();
        assert.strictEqual(typeof isMob, 'boolean');

        const isTab = responsive.isTabletView();
        assert.strictEqual(typeof isTab, 'boolean');

        const isDsk = responsive.isDesktopView();
        assert.strictEqual(typeof isDsk, 'boolean');

        const isSmall = responsive.isSmallMobileView();
        assert.strictEqual(typeof isSmall, 'boolean');
    });

    await t.test('should exercise scrollToContentTop with mock elements and document query fallback', () => {
        // Element with scrollTo function
        let scrolledToOptions = null;
        const mockScrollableEl = {
            scrollTo: (opts) => { scrolledToOptions = opts; },
            scrollTop: 500
        };
        responsive.scrollToContentTop(mockScrollableEl);
        assert.deepStrictEqual(scrolledToOptions, { top: 0, behavior: 'smooth' });

        // Element without scrollTo (direct scrollTop assignment)
        const mockDirectEl = { scrollTop: 350 };
        responsive.scrollToContentTop(mockDirectEl);
        assert.strictEqual(mockDirectEl.scrollTop, 0);

        // Document fallback with element having scrollTo
        let docScrolledOpts = null;
        globalThis.document = {
            querySelector: (sel) => {
                if (sel === '.main-content') {
                    return {
                        scrollTo: (opts) => { docScrolledOpts = opts; },
                        scrollTop: 200
                    };
                }
                return null;
            }
        };
        responsive.scrollToContentTop();
        assert.deepStrictEqual(docScrolledOpts, { top: 0, behavior: 'smooth' });

        // Document fallback with element having direct scrollTop only
        const docDirectEl = { scrollTop: 120 };
        globalThis.document = {
            querySelector: (sel) => (sel === '.main-content' ? docDirectEl : null)
        };
        responsive.scrollToContentTop();
        assert.strictEqual(docDirectEl.scrollTop, 0);

        // Document fallback with null element
        globalThis.document = {
            querySelector: () => null
        };
        assert.doesNotThrow(() => responsive.scrollToContentTop());

        delete globalThis.document;

        // Undefined element in Node environment without crashing
        assert.doesNotThrow(() => {
            responsive.scrollToContentTop(null);
            responsive.scrollToContentTop(undefined);
        });
    });

    await t.test('should sync screen mode attributes on DOM elements', () => {
        const attributes = {};
        const mockBody = {
            setAttribute: (k, v) => { attributes[k] = v; }
        };
        const mockContainer = {
            setAttribute: (k, v) => { attributes['container_' + k] = v; }
        };
        const mockDoc = {
            body: mockBody,
            querySelector: (sel) => (sel === '.app-container' ? mockContainer : null)
        };
        const mockWin = { innerWidth: 800 };

        const mode = responsive.syncScreenModeDOM(mockDoc, mockWin);
        assert.strictEqual(mode, 'tablet');
        assert.strictEqual(attributes['data-screen-mode'], 'tablet');
        assert.strictEqual(attributes['container_data-screen-mode'], 'tablet');

        // Test safe fallback when doc is null
        const fallbackMode = responsive.syncScreenModeDOM(null, null);
        assert.strictEqual(fallbackMode, 'desktop');
    });

    await t.test('should setup and cleanup responsive window listeners', () => {
        const listeners = {};
        const mockWin = {
            innerWidth: 375,
            addEventListener: (event, fn) => { listeners[event] = fn; },
            removeEventListener: (event, fn) => { delete listeners[event]; }
        };
        const mockDoc = {
            body: { setAttribute: () => {} },
            querySelector: () => null
        };

        const cleanup = responsive.setupResponsiveListeners(mockWin, mockDoc);
        assert.ok(typeof listeners['resize'] === 'function');
        assert.ok(typeof listeners['orientationchange'] === 'function');

        // Trigger listener safely
        assert.doesNotThrow(() => {
            listeners['resize']();
            listeners['orientationchange']();
        });

        // Run cleanup
        cleanup();
        assert.strictEqual(listeners['resize'], undefined);
        assert.strictEqual(listeners['orientationchange'], undefined);

        // Safe fallback when window is null
        const noopCleanup = responsive.setupResponsiveListeners(null, null);
        assert.strictEqual(typeof noopCleanup, 'function');
        assert.doesNotThrow(() => noopCleanup());
    });

    await t.test('should verify modular responsive CSS files exist and contain required anti-overlap rules', () => {
        const cssDir = path.join(__dirname, '..', 'css');
        assert.ok(fs.existsSync(cssDir), 'css/ directory must exist');

        const commonCssPath = path.join(cssDir, 'responsive-common.css');
        const tabletCssPath = path.join(cssDir, 'responsive-tablet.css');
        const mobileCssPath = path.join(cssDir, 'responsive-mobile.css');

        assert.ok(fs.existsSync(commonCssPath), 'css/responsive-common.css must exist');
        assert.ok(fs.existsSync(tabletCssPath), 'css/responsive-tablet.css must exist');
        assert.ok(fs.existsSync(mobileCssPath), 'css/responsive-mobile.css must exist');

        const commonContent = fs.readFileSync(commonCssPath, 'utf8');
        assert.ok(commonContent.includes('--safe-area-bottom'), 'responsive-common must define safe-area-bottom');
        assert.ok(commonContent.includes('--z-modal-backdrop: 1000'), 'responsive-common must elevate modal z-index to 1000');
        assert.ok(commonContent.includes('--z-toast: 1200'), 'responsive-common must elevate toast z-index to 1200');
        assert.ok(commonContent.includes('--touch-min-target: 44px'), 'responsive-common must specify 44px touch target');
        assert.ok(commonContent.includes('overscroll-behavior: contain'), 'responsive-common must contain modal body scrolling');

        const tabletContent = fs.readFileSync(tabletCssPath, 'utf8');
        assert.ok(tabletContent.includes('min-width: 769px') && tabletContent.includes('max-width: 1024px'), 'responsive-tablet must target 769px-1024px');
        assert.ok(tabletContent.includes('grid-template-columns: repeat(2, 1fr)'), 'responsive-tablet must optimize stats-grid to 2 columns');
        assert.ok(tabletContent.includes('width: 230px'), 'responsive-tablet must streamline sidebar to 230px');

        const mobileContent = fs.readFileSync(mobileCssPath, 'utf8');
        assert.ok(mobileContent.includes('max-width: 768px'), 'responsive-mobile must target <= 768px');
        assert.ok(mobileContent.includes('font-size: 16px'), 'responsive-mobile must enforce 16px inputs to prevent iOS zoom');
        assert.ok(mobileContent.includes('bottom: calc(72px + var(--safe-area-bottom))'), 'responsive-mobile must lift toast notifications above bottom nav');
        assert.ok(mobileContent.includes('.mobile-bottom-nav'), 'responsive-mobile must style mobile bottom nav');
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/responsive.js')];
        require('../js/responsive.js');

        assert.ok(fakeWindow.ResponsiveLayout);
        assert.strictEqual(typeof fakeWindow.getScreenMode, 'function');
        assert.strictEqual(typeof fakeWindow.isMobileView, 'function');
        assert.strictEqual(typeof fakeWindow.isTabletView, 'function');
        assert.strictEqual(typeof fakeWindow.isDesktopView, 'function');
        assert.strictEqual(typeof fakeWindow.isSmallMobileView, 'function');
        assert.strictEqual(typeof fakeWindow.scrollToContentTop, 'function');
        assert.strictEqual(typeof fakeWindow.syncScreenModeDOM, 'function');
        assert.strictEqual(typeof fakeWindow.setupResponsiveListeners, 'function');

        delete globalThis.window;
    });
});
