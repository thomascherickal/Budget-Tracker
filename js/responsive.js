/**
 * Sovereign Budget - Responsive Engine & Layout Manager
 * Breakpoint management, device mode detection, smooth mobile tab scrolling,
 * and layout synchronization across screen sizes.
 */

const BREAKPOINTS = {
    SMALL_MOBILE_MAX: 420,
    MOBILE_MAX: 768,
    TABLET_MAX: 1024
};

/**
 * Resolves current screen mode based on viewport width.
 * @param {number} [width]
 * @returns {'mobile'|'tablet'|'desktop'}
 */
function getScreenMode(width) {
    const w = (typeof width === 'number') ? width : ((typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200);
    if (w <= BREAKPOINTS.MOBILE_MAX) {
        return 'mobile';
    }
    if (w <= BREAKPOINTS.TABLET_MAX) {
        return 'tablet';
    }
    return 'desktop';
}

/**
 * Checks if viewport is in mobile mode (<= 768px).
 * @param {number} [width]
 * @returns {boolean}
 */
function isMobileView(width) {
    return getScreenMode(width) === 'mobile';
}

/**
 * Checks if viewport is in tablet mode (769px - 1024px).
 * @param {number} [width]
 * @returns {boolean}
 */
function isTabletView(width) {
    return getScreenMode(width) === 'tablet';
}

/**
 * Checks if viewport is in desktop mode (> 1024px).
 * @param {number} [width]
 * @returns {boolean}
 */
function isDesktopView(width) {
    return getScreenMode(width) === 'desktop';
}

/**
 * Checks if viewport is extra small mobile (<= 420px).
 * @param {number} [width]
 * @returns {boolean}
 */
function isSmallMobileView(width) {
    const w = (typeof width === 'number') ? width : ((typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200);
    return w <= BREAKPOINTS.SMALL_MOBILE_MAX;
}

/**
 * Smoothly scrolls the main content view to the top.
 * Useful on mobile/tablet when switching tabs or submitting forms.
 * @param {HTMLElement} [element]
 */
function scrollToContentTop(element) {
    if (element && typeof element.scrollTo === 'function') {
        element.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (element) {
        element.scrollTop = 0;
    } else if (typeof document !== 'undefined') {
        const main = document.querySelector('.main-content');
        if (main) {
            if (typeof main.scrollTo === 'function') {
                main.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                main.scrollTop = 0;
            }
        }
    }
}

/**
 * Updates DOM attributes (e.g. data-screen-mode) on container/body for CSS state targeting.
 * @param {Document} [doc]
 * @param {Window} [win]
 * @returns {string} Current screen mode
 */
function syncScreenModeDOM(doc, win) {
    const activeDoc = doc || (typeof document !== 'undefined' ? document : null);
    const activeWin = win || (typeof window !== 'undefined' ? window : null);
    if (!activeDoc) return 'desktop';

    const width = (activeWin && activeWin.innerWidth) ? activeWin.innerWidth : 1200;
    const mode = getScreenMode(width);

    const body = activeDoc.body;
    if (body) {
        body.setAttribute('data-screen-mode', mode);
    }
    const container = activeDoc.querySelector('.app-container');
    if (container) {
        container.setAttribute('data-screen-mode', mode);
    }

    return mode;
}

/**
 * Initializes responsive resize and tab scrolling listeners.
 * @param {Window} [win]
 * @param {Document} [doc]
 * @returns {Function} Cleanup remover function
 */
function setupResponsiveListeners(win, doc) {
    const activeWin = win || (typeof window !== 'undefined' ? window : null);
    const activeDoc = doc || (typeof document !== 'undefined' ? document : null);
    if (!activeWin || !activeDoc) return () => {};

    const handleResize = () => {
        syncScreenModeDOM(activeDoc, activeWin);
    };

    activeWin.addEventListener('resize', handleResize);
    activeWin.addEventListener('orientationchange', handleResize);

    // Initial DOM sync
    syncScreenModeDOM(activeDoc, activeWin);

    return () => {
        activeWin.removeEventListener('resize', handleResize);
        activeWin.removeEventListener('orientationchange', handleResize);
    };
}

// Universal module export pattern
const ResponsiveLayout = {
    BREAKPOINTS,
    getScreenMode,
    isMobileView,
    isTabletView,
    isDesktopView,
    isSmallMobileView,
    scrollToContentTop,
    syncScreenModeDOM,
    setupResponsiveListeners
};

if (typeof window !== 'undefined') {
    window.ResponsiveLayout = ResponsiveLayout;
    window.BREAKPOINTS = BREAKPOINTS;
    window.getScreenMode = getScreenMode;
    window.isMobileView = isMobileView;
    window.isTabletView = isTabletView;
    window.isDesktopView = isDesktopView;
    window.isSmallMobileView = isSmallMobileView;
    window.scrollToContentTop = scrollToContentTop;
    window.syncScreenModeDOM = syncScreenModeDOM;
    window.setupResponsiveListeners = setupResponsiveListeners;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveLayout;
}
