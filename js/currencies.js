/**
 * Sovereign Budget - Internationalization & Currency Engine
 * Currency resolution, locale mappings, and number formatting.
 */

const LOCALE_CURRENCIES = {
    // North America
    "en-US": ["USD", "$"], "es-US": ["USD", "$"], "en-CA": ["CAD", "$"], "fr-CA": ["CAD", "$"], "es-MX": ["MXN", "$"],
    // Eurozone
    "de-DE": ["EUR", "€"], "fr-FR": ["EUR", "€"], "es-ES": ["EUR", "€"], "it-IT": ["EUR", "€"], "nl-NL": ["EUR", "€"],
    "pt-PT": ["EUR", "€"], "fi-FI": ["EUR", "€"], "el-GR": ["EUR", "€"], "ga-IE": ["EUR", "€"], "de-AT": ["EUR", "€"],
    "fr-BE": ["EUR", "€"], "nl-BE": ["EUR", "€"], "et-EE": ["EUR", "€"], "sk-SK": ["EUR", "€"], "sl-SI": ["EUR", "€"],
    "lv-LV": ["EUR", "€"], "lt-LT": ["EUR", "€"], "mt-MT": ["EUR", "€"], "de-LU": ["EUR", "€"], "fr-LU": ["EUR", "€"],
    "en-IE": ["EUR", "€"], "es-AD": ["EUR", "€"], "fr-MC": ["EUR", "€"], "it-SM": ["EUR", "€"], "it-VA": ["EUR", "€"],
    "fr-GP": ["EUR", "€"], "fr-MQ": ["EUR", "€"], "fr-RE": ["EUR", "€"], "fr-YT": ["EUR", "€"], "fr-GF": ["EUR", "€"],
    // United Kingdom
    "en-GB": ["GBP", "£"], "cy-GB": ["GBP", "£"], "gd-GB": ["GBP", "£"],
    // Europe (Other)
    "ru-RU": ["RUB", "₽"], "uk-UA": ["UAH", "₴"], "pl-PL": ["PLN", "zł"], "cs-CZ": ["CZK", "Kč"], "hu-HU": ["HUF", "Ft"],
    "ro-RO": ["RON", "lei"], "bg-BG": ["BGN", "лв"], "hr-HR": ["EUR", "€"], "sr-RS": ["RSD", "RSD"], "bs-BA": ["BAM", "KM"],
    "mk-MK": ["MKD", "den"], "sq-AL": ["ALL", "L"], "sv-SE": ["SEK", "kr"], "no-NO": ["NOK", "kr"], "nb-NO": ["NOK", "kr"],
    "nn-NO": ["NOK", "kr"], "da-DK": ["DKK", "kr"], "is-IS": ["ISK", "kr"], "tr-TR": ["TRY", "₺"], "az-AZ": ["AZN", "₼"],
    "ka-GE": ["GEL", "₾"], "hy-AM": ["AMD", "֏"], "de-CH": ["CHF", "CHF"], "fr-CH": ["CHF", "CHF"], "it-CH": ["CHF", "CHF"],
    "be-BY": ["BYN", "Br"], "ro-MD": ["MDL", "L"], "sq-XK": ["EUR", "€"], "sr-XK": ["EUR", "€"], "fo-FO": ["DKK", "kr"],
    "kl-GL": ["DKK", "kr"], "gi-GI": ["GIP", "£"], "de-LI": ["CHF", "CHF"], "el-CY": ["EUR", "€"], "tr-CY": ["EUR", "€"],
    "sr-ME": ["EUR", "€"], "cnr-ME": ["EUR", "€"],
    // Asia
    "zh-CN": ["CNY", "¥"], "ja-JP": ["JPY", "¥"], "ko-KR": ["KRW", "₩"], "en-IN": ["INR", "₹"], "hi-IN": ["INR", "₹"],
    "bn-IN": ["INR", "₹"], "ta-IN": ["INR", "₹"], "te-IN": ["INR", "₹"], "kn-IN": ["INR", "₹"], "ml-IN": ["INR", "₹"],
    "mr-IN": ["INR", "₹"], "gu-IN": ["INR", "₹"], "pa-IN": ["INR", "₹"], "or-IN": ["INR", "₹"], "as-IN": ["INR", "₹"],
    "ur-IN": ["INR", "₹"], "ur-PK": ["PKR", "₨"], "en-PK": ["PKR", "₨"], "bn-BD": ["BDT", "৳"], "ne-NP": ["NPR", "₨"],
    "si-LK": ["LKR", "₨"], "ta-LK": ["LKR", "₨"], "my-MM": ["MMK", "K"], "th-TH": ["THB", "฿"], "vi-VN": ["VND", "₫"],
    "id-ID": ["IDR", "Rp"], "ms-MY": ["MYR", "RM"], "fil-PH": ["PHP", "₱"], "en-PH": ["PHP", "₱"], "en-SG": ["SGD", "$"],
    "zh-SG": ["SGD", "$"], "zh-HK": ["HKD", "$"], "en-HK": ["HKD", "$"], "zh-TW": ["TWD", "NT$"], "mn-MN": ["MNT", "₮"],
    "km-KH": ["KHR", "៛"], "lo-LA": ["LAK", "₭"], "uz-UZ": ["UZS", "so'm"], "kk-KZ": ["KZT", "₸"], "ky-KG": ["KGS", "сом"],
    "tg-TJ": ["TJS", "SM"], "tk-TM": ["TMT", "T"], "en-PG": ["PGK", "K"], "dz-BT": ["BTN", "Nu."], "dv-MV": ["MVR", "Rf"],
    "tl-TL": ["USD", "$"], "en-FM": ["USD", "$"], "en-MH": ["USD", "$"], "en-PW": ["USD", "$"], "en-SB": ["SBD", "$"],
    "en-VU": ["VUV", "VT"], "en-FJ": ["FJD", "$"], "en-TO": ["TOP", "T$"], "en-WS": ["WST", "WS$"], "en-KI": ["AUD", "$"],
    "en-NR": ["AUD", "$"], "en-TV": ["AUD", "$"], "ms-BN": ["BND", "B$"], "en-BN": ["BND", "B$"], "fa-AF": ["AFN", "؋"],
    "ps-AF": ["AFN", "؋"], "zh-MO": ["MOP", "MOP$"], "pt-MO": ["MOP", "MOP$"],
    // Middle East & North Africa
    "ar-SA": ["SAR", "ر.س"], "ar-AE": ["AED", "د.إ"], "ar-EG": ["EGP", "E£"], "ar-IL": ["ILS", "₪"], "he-IL": ["ILS", "₪"],
    "ar-JO": ["JOD", "د.ا"], "ar-LB": ["LBP", "ل.ل"], "ar-SY": ["SYP", "ل.س"], "ar-IQ": ["IQD", "د.ع"], "ar-KW": ["KWD", "د.ك"],
    "ar-QA": ["QAR", "ر.ق"], "ar-BH": ["BHD", "د.ب"], "ar-OM": ["OMR", "ر.ع"], "ar-YE": ["YER", "ر.ي"], "fa-IR": ["IRR", "﷼"],
    "ar-DZ": ["DZD", "د.ج"], "ar-MA": ["MAD", "د.م."], "ar-TN": ["TND", "د.ت"], "ar-LY": ["LYD", "د.ل"], "ar-SD": ["SDG", "ج.س."],
    "ku-TR": ["TRY", "₺"], "ku-IQ": ["IQD", "د.ع"], "ar-MR": ["MRU", "UM"], "ar-DJ": ["DJF", "Fdj"], "ar-SO": ["SOS", "Sh.So."],
    // South & Central America & Caribbean
    "pt-BR": ["BRL", "R$"], "es-AR": ["ARS", "$"], "es-CO": ["COP", "$"], "es-CL": ["CLP", "$"], "es-PE": ["PEN", "S/."],
    "es-VE": ["VES", "Bs.S"], "es-EC": ["USD", "$"], "es-UY": ["UYU", "$"], "es-PY": ["PYG", "₲"], "es-BO": ["BOB", "Bs."],
    "es-CR": ["CRC", "₡"], "es-PA": ["PAB", "B/."], "es-NI": ["NIO", "C$"], "es-HN": ["HNL", "L"], "es-SV": ["USD", "$"],
    "es-GT": ["GTQ", "Q"], "es-DO": ["DOP", "RD$"], "es-PR": ["USD", "$"], "es-CU": ["CUP", "$"], "en-JM": ["JMD", "$"],
    "en-TT": ["TTD", "$"], "en-BS": ["BSD", "$"], "en-BB": ["BBD", "$"], "en-BZ": ["BZD", "$"], "en-GY": ["GYD", "$"],
    "nl-SR": ["SRD", "$"], "en-KY": ["KYD", "CI$"], "en-BM": ["BMD", "BD$"], "fr-HT": ["HTG", "G"], "ht-HT": ["HTG", "G"],
    "nl-AW": ["AWG", "Afl."], "nl-CW": ["ANG", "NAƒ"],
    // Africa (Other)
    "en-ZA": ["ZAR", "R"], "af-ZA": ["ZAR", "R"], "zu-ZA": ["ZAR", "R"], "xh-ZA": ["ZAR", "R"], "en-NG": ["NGN", "₦"],
    "yo-NG": ["NGN", "₦"], "ig-NG": ["NGN", "₦"], "ha-NG": ["NGN", "₦"], "sw-KE": ["KES", "KSh"], "en-KE": ["KES", "KSh"],
    "am-ET": ["ETB", "Br"], "en-GH": ["GHS", "GH₵"], "ak-GH": ["GHS", "GH₵"], "fr-CI": ["XOF", "CFA"], "fr-SN": ["XOF", "CFA"],
    "fr-CM": ["XAF", "FCFA"], "fr-CG": ["XAF", "FCFA"], "fr-GA": ["XAF", "FCFA"], "fr-NE": ["XOF", "CFA"], "fr-BF": ["XOF", "CFA"],
    "fr-ML": ["XOF", "CFA"], "fr-BJ": ["XOF", "CFA"], "fr-TG": ["XOF", "CFA"], "fr-MG": ["MGA", "Ar"], "en-UG": ["UGX", "USh"],
    "en-TZ": ["TZS", "TSh"], "sw-TZ": ["TZS", "TSh"], "pt-AO": ["AOA", "Kz"], "pt-MZ": ["MZN", "MT"], "en-ZW": ["USD", "$"],
    "en-ZM": ["ZMW", "ZK"], "en-MW": ["MWK", "MK"], "en-NA": ["NAD", "$"], "en-BW": ["BWP", "P"], "fr-CD": ["CDF", "FC"],
    "en-LR": ["LRD", "$"], "en-SL": ["SLL", "Le"], "en-GM": ["GMD", "D"], "pt-CV": ["CVE", "Esc"], "fr-MU": ["MUR", "₨"],
    "fr-BI": ["BIF", "FBu"], "fr-RW": ["RWF", "FRw"], "fr-DJ": ["DJF", "Fdj"], "en-LS": ["LSL", "L"], "en-SZ": ["SZL", "L"],
    "ar-KM": ["KMF", "CF"], "fr-KM": ["KMF", "CF"], "en-SS": ["SSP", "£"], "ar-SO": ["SOS", "Sh.So."], "en-SO": ["SOS", "Sh.So."],
    "fr-GN": ["GNF", "FG"], "fr-SC": ["SCR", "SR"], "en-SC": ["SCR", "SR"], "pt-ST": ["STN", "Db"],
    // Oceania
    "en-AU": ["AUD", "$"], "en-NZ": ["NZD", "$"]
};

/**
 * Detects user currency based on browser locale or explicit locale string.
 * @param {string} [customLocale] - Optional BCP 47 locale tag (e.g. 'en-US', 'de-DE')
 * @returns {{ code: string, symbol: string }}
 */
function detectUserCurrency(customLocale) {
    let locale = customLocale;
    if (!locale) {
        const nav = (typeof window !== 'undefined' && window.navigator) ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
        if (typeof window !== 'undefined' && nav) {
            locale = nav.language || (nav.languages && nav.languages[0]) || 'en-US';
        } else {
            locale = 'en-US';
        }
    }
    if (LOCALE_CURRENCIES[locale]) {
        return { code: LOCALE_CURRENCIES[locale][0], symbol: LOCALE_CURRENCIES[locale][1] };
    }
    const lang = (locale || '').split('-')[0];
    for (const loc in LOCALE_CURRENCIES) {
        if (loc.startsWith(lang)) {
            return { code: LOCALE_CURRENCIES[loc][0], symbol: LOCALE_CURRENCIES[loc][1] };
        }
    }
    return { code: 'USD', symbol: '$' };
}

/**
 * Retrieves the display currency symbol for a 3-letter currency code.
 * @param {string} currencyCode - ISO 4217 currency code (e.g. 'USD', 'EUR', 'GBP')
 * @returns {string} Currency symbol
 */
function getSymbolForCurrency(currencyCode) {
    for (const loc in LOCALE_CURRENCIES) {
        if (LOCALE_CURRENCIES[loc][0] === currencyCode) {
            return LOCALE_CURRENCIES[loc][1];
        }
    }
    return '$';
}

/**
 * Resolves standard locale tag for formatting given a currency code.
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {string} Locale tag
 */
function getLocaleForCurrency(currencyCode) {
    for (const loc in LOCALE_CURRENCIES) {
        if (LOCALE_CURRENCIES[loc][0] === currencyCode) {
            return loc;
        }
    }
    return 'en-US';
}

/**
 * Formats a numerical amount into a localized currency string.
 * @param {number} amount - Numerical value
 * @param {string} [currencyCode='USD'] - Target currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currencyCode = 'USD') {
    const code = currencyCode || 'USD';
    const formatLocale = getLocaleForCurrency(code);
    try {
        return new Intl.NumberFormat(formatLocale, {
            style: 'currency',
            currency: code
        }).format(amount);
    } catch (err) {
        const symbol = getSymbolForCurrency(code);
        return symbol + (Number(amount) || 0).toFixed(2);
    }
}

// Universal export pattern
const AppCurrencies = {
    LOCALE_CURRENCIES,
    detectUserCurrency,
    getSymbolForCurrency,
    getLocaleForCurrency,
    formatCurrency
};

if (typeof window !== 'undefined') {
    window.AppCurrencies = AppCurrencies;
    window.LOCALE_CURRENCIES = LOCALE_CURRENCIES;
    window.detectUserCurrency = detectUserCurrency;
    window.getSymbolForCurrency = getSymbolForCurrency;
    window.getLocaleForCurrency = getLocaleForCurrency;
    window.formatCurrency = formatCurrency;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppCurrencies;
}
