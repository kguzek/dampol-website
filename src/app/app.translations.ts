export const TRANSLATIONS = {
  dk: {
    languageCode: 'DK',
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { products: 'Produkter', about: 'Om os', contact: 'Kontakt' },
    ui: { scrollToTop: 'Rul til toppen' },
    products: {
      header: 'Vores tilbud',
      preview: 'forhåndsvisning',
      prev: 'Forrige',
      next: 'Næste',
      image: 'Billede',
      temporaryModelDescription: '[Modelbeskrivelse]',
      modelDescriptions: [],
    },
    about: {
      about: 'Om',
      companyDescription: 'et polsk firma',
    },
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
    products: {
      header: 'Our Offer',
      preview: 'preview',
      prev: 'Previous',
      next: 'Next',
      image: 'Image',
      temporaryModelDescription: '[Model description]',
      modelDescriptions: [],
    },
    about: {
      about: 'About',
      companyDescription: 'a Polish company',
    },
    contact: {
      header: 'Contact Us',
      poland: 'Poland',
      salesDepartment: 'Sales department',
    },
  },
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];
