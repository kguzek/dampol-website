export const LANGUAGE_CODES = {
  gb: 'EN (UK)',
  dk: 'DK',
};

export type LanguageCode = keyof typeof LANGUAGE_CODES;

export const TRANSLATIONS = {
  gb: {
    navbar: { about: 'About', contact: 'Contact', products: 'Products' },
  },
  dk: {
    navbar: { about: 'Om os', contact: 'Kontakt', products: 'Produkter' },
  },
};

export type Translation = typeof TRANSLATIONS.gb;
