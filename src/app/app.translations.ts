export const TRANSLATIONS = {
  dk: {
    languageCode: 'DK',
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { products: 'Produkter', about: 'Om os', contact: 'Kontakt' },
    ui: { scrollToTop: 'Rul til toppen' },
    contact: {
      header: 'Kontakt',
      poland: 'Polen',
      salesDepartment: 'Salgsafdeling',
    },
  },
  gb: {
    languageCode: 'EN (UK)',
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { products: 'Products', about: 'About', contact: 'Contact' },
    ui: { scrollToTop: 'Scroll to top' },
    contact: {
      header: 'Contact Us',
      poland: 'Poland',
      salesDepartment: 'Sales department',
    },
  },
};

export type Translation = typeof TRANSLATIONS.dk & typeof TRANSLATIONS.gb;
export type LanguageCode = keyof typeof TRANSLATIONS;
