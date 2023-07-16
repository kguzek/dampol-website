export const LANGUAGE_CODES = {
  gb: 'EN (UK)',
  dk: 'DK',
};

export type LanguageCode = keyof typeof LANGUAGE_CODES;

export const TRANSLATIONS = {
  gb: {
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { about: 'About', contact: 'Contact', products: 'Products' },
  },
  dk: {
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { about: 'Om os', contact: 'Kontakt', products: 'Produkter' },
  },
};

export type Translation = typeof TRANSLATIONS.gb & typeof TRANSLATIONS.dk;
