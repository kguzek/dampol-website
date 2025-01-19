import { Injectable } from '@angular/core';
import { DOOR_LOCATIONS } from './app.constants';

export const TRANSLATIONS = {
  dk: {
    languageCode: 'DK',
    iso639Locale: 'da-DK',
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { products: 'Produkter', about: 'Om os', contact: 'Kontakt' },
    ui: { scrollToTop: 'Rul til toppen' },
    header: {
      getStarted: 'Kom igang',
    },
    products: {
      header: 'Vores tilbud',
      preview: 'forhåndsvisning',
      prev: 'Forrige',
      next: 'Næste',
      image: 'Billede',
      customise: 'Tilpas',
    },
    about: {
      header: 'Om',
      companyDescription: 'et polsk firma',
      paragraphs: [
        'Velkommen til Dampol, din førende destination for alsidige og praktiske containerløsninger designet til kontorer, boliger, butiksfacader og meget mere. Hos Dampol forstår vi de skiftende behov hos virksomheder og enkeltpersoner, der søger fleksible og tilpasningsdygtige rum. Uanset om du ønsker at skabe et funktionelt kontormiljø, komfortable boliger eller en attraktiv butiksfacade, er vores udvalg af højkvalitetscontainere designet til at opfylde dine specifikke krav.',
        'Med mange års ekspertise i branchen har Dampol etableret sig som en betroet leverandør af containerløsninger. Vi er stolte af at levere holdbare og tilpasselige muligheder, der er både æstetisk tiltalende og praktiske. Vores containere er bygget til at modstå forskellige vejrforhold og er konstrueret af materialer af højeste kvalitet, hvilket sikrer lang levetid og ro i sindet.',
        'Vores forpligtelse til kundetilfredshed er kernen i alt, hvad vi gør. Vi samarbejder tæt med vores kunder for at forstå deres unikke behov og præferencer, og tilbyder ekspertrådgivning og skræddersyede løsninger til at omdanne deres vision til virkelighed. Uanset om du er en lille virksomhedsejer, en projektleder eller en person, der leder efter en alsidig rumløsning, er Dampol her for at guide dig gennem hele processen, fra den første konsultation til den endelige installation.',
        'Det, der adskiller Dampol, er vores dedikation til innovation og bæredygtighed. Vi udforsker løbende nye teknikker og teknologier for at forbedre funktionaliteten og miljøvenligheden af ​​vores containere. Fra energieffektive funktioner til miljøbevidste materialer stræber vi efter at minimere vores miljømæssige fodaftryk, mens vi leverer banebrydende løsninger til vores kunder.',
        'Gennemse vores mangfoldige udvalg af containermuligheder på vores hjemmeside, hvor du finder detaljerede produktoplysninger, brugerdefinerbare funktioner og inspirerende casestudier. Oplev alsidigheden og bekvemmeligheden af ​​vores containere, designet til at tilpasse sig problemfrit til dine unikke behov og præferencer.',
        'Slut dig til utallige tilfredse kunder, der har valgt Dampol som deres betroede partner for containerløsninger. Kontakt vores kyndige team i dag, og lad os hjælpe dig med at frigøre dit rums fulde potentiale med vores enestående containere, der er skræddersyet til dine nøjagtige specifikationer. Velkommen til Dampol, hvor innovativt design møder praktisk og bæredygtighed.',
      ],
    },
    contact: {
      header: 'Kontakt',
      poland: 'Polen',
      salesDepartment: 'Salgsafdeling',
    },
    model: {
      size: 'Størrelse',
      header: 'Tilpas din container',
      select: 'Vælg',
      dimensions: 'Dimensioner',
      length: 'Længde',
      width: 'Bredde',
      features: 'Funktioner',
      airConditioning: 'Aircondition (3,4 kW)',
      airConditioning2: 'Effektforøgelse (4,6 kW)',
      toiletLabel: 'Toilet (WC, håndvask, skab, vandvarmer)',
      shower: 'Bruser',
      kitchenAnnexe: 'Køkken anneks',
      separationWall: 'Køkken skillevæg',
      partitionWall: 'Skillevæg',
      internalDoor: 'Indvendig dør',
      doors: 'Døre',
      location: 'Beliggenhed',
      doorLocations: ['Foran', 'Bag', 'Venstre', 'Højre'],
      material: 'Materiale',
      steel: 'Stål',
      aluminium: 'Aluminium',
      withGlass: 'med glas',
      double: '(dobbelte)',
      pcv: 'PCV',
      fixed: 'Fast',
      addDoor: 'Tilføj dør',
      removeDoor: 'Fjern døren',
      windows: 'Vinduer',
      glazure: 'Glasur',
      doubleGlazed: 'Dobbelt-glaseret',
      tripleGlazed: 'Tredobbelt glas',
      addWindow: 'Tilføj vindue',
      removeWindow: 'Fjern vinduet',
      total: 'Total',
      submit: 'Send e-mail',
      customerInformation: 'Kunde information',
      name: 'Navn',
      phoneNumber: 'Telefonnummer',
      placeholderName: 'Navn Navnesen',
      placeholderPhoneNumber: '+45 50 00 12 34',
      specialFeatureHeader: 'Vi tilbyder også følgende specielle funktioner:',
      specialFeatures: {
        externalLedLamp: 'Ekstern LED-lampe',
        stopSolGlazing: 'Stop Sol Glazing',
        externalRollerShutters: 'Eksterne rulleskodder',
        slidingWindows: 'Skydevinduer',
        stainlessSteelHandle: 'Rustfrit stålhåndtag',
        gutter: 'Tagrende',
      },
      placeholderSpecialFeatures:
        'Yderligere døre og vinduer, materialer, etc.',
    },
    notFound: {
      thePage: 'Siden',
      wasNotFound: 'blev ikke fundet.',
    },
    utils: {
      priceFormat: Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'EUR',
      }),
    },
  },
  gb: {
    languageCode: 'EN (UK)',
    iso639Locale: 'en-GB',
    alt: { dampolLogo: 'Dampol logo' },
    navbar: { products: 'Products', about: 'About', contact: 'Contact' },
    ui: { scrollToTop: 'Scroll to top' },
    header: {
      getStarted: 'Get started',
    },
    products: {
      header: 'Our Offer',
      preview: 'preview',
      prev: 'Previous',
      next: 'Next',
      image: 'Image',
      customise: 'Customise',
    },
    about: {
      header: 'About',
      companyDescription: 'a Polish company',
      paragraphs: [
        "Welcome to Dampol, your premier destination for versatile and practical container solutions designed for offices, living quarters, storefronts, and more. At Dampol, we understand the evolving needs of businesses and individuals seeking flexible and adaptable spaces. Whether you're looking to create a functional office environment, comfortable living quarters, or an attractive storefront, our range of high-quality containers is designed to meet your specific requirements.",
        'With years of expertise in the industry, Dampol has established itself as a trusted provider of container solutions. We pride ourselves on delivering durable and customizable options that are both aesthetically pleasing and practical. Our containers are built to withstand diverse weather conditions and are constructed using top-grade materials, ensuring longevity and peace of mind. ',
        "Our commitment to customer satisfaction is at the heart of everything we do. We collaborate closely with our clients to understand their unique needs and preferences, offering expert advice and tailored solutions to transform their vision into reality. Whether you're a small business owner, a project manager, or an individual looking for a versatile space solution, Dampol is here to guide you through the entire process, from initial consultation to final installation. ",
        'What sets Dampol apart is our dedication to innovation and sustainability. We continuously explore new techniques and technologies to enhance the functionality and eco-friendliness of our containers. From energy-efficient features to eco-conscious materials, we strive to minimize our environmental footprint while delivering cutting-edge solutions to our customers. ',
        "Browse through our diverse selection of container options on our website, where you'll find detailed product information, customizable features, and inspiring case studies. Experience the versatility and convenience of our containers, designed to adapt seamlessly to your unique needs and preferences. ",
        'Join countless satisfied customers who have chosen Dampol as their trusted partner for container solutions. Contact our knowledgeable team today and let us help you unlock the full potential of your space with our exceptional containers tailored to your exact specifications. Welcome to Dampol, where innovative design meets practicality and sustainability. ',
      ],
    },
    contact: {
      header: 'Contact Us',
      poland: 'Poland',
      salesDepartment: 'Sales department',
    },
    model: {
      header: 'Customise your container',
      size: 'Size',
      select: 'Select',
      dimensions: 'Dimensions',
      length: 'Length',
      width: 'Width',
      features: 'Features',
      toiletLabel: 'Toilet (WC, sink, cupboard, water heater)',
      shower: 'Shower',
      airConditioning: 'Air conditioning (3.4 kW)',
      airConditioning2: 'Large air conditioner (4.6 kW)',
      kitchenAnnexe: 'Kitchen annexe',
      separationWall: 'Separation wall',
      partitionWall: 'Partition wall',
      internalDoor: 'Internal door',
      doors: 'Doors',
      location: 'Location',
      doorLocations: DOOR_LOCATIONS,
      material: 'Material',
      steel: 'Steel',
      aluminium: 'Aluminium',
      withGlass: '(glassed)',
      double: 'double door',
      pcv: 'PCV',
      fixed: 'Fixed',
      addDoor: 'Add door',
      removeDoor: 'Remove door',
      windows: 'Windows',
      glazure: 'Glazure',
      doubleGlazed: 'Double glazed',
      tripleGlazed: 'Triple glazed',
      addWindow: 'Add window',
      removeWindow: 'Remove window',
      total: 'Total',
      submit: 'Email us',
      customerInformation: 'Customer information',
      name: 'Name',
      phoneNumber: 'Phone Number',
      placeholderName: 'John Smith',
      placeholderPhoneNumber: '+44 7300 123 123',
      specialFeatureHeader: 'We also offer the following special features:',
      specialFeatures: {
        externalLedLamp: 'External LED Lamp',
        stopSolGlazing: 'Stop Sol Glazing',
        externalRollerShutters: 'External Roller Shutters',
        slidingWindows: 'Sliding windows',
        stainlessSteelHandle: 'Stainless Steel Door Handle',
        gutter: 'Gutter',
        terraceDoors: 'Terrace Doors',
      },
      placeholderSpecialFeatures:
        'Additional doors and windows, materials, etc.',
    },
    notFound: {
      thePage: 'The page',
      wasNotFound: 'was not found.',
    },
  },
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];

function tryGetLanguage() {
  try {
    return localStorage.getItem('language');
  } catch {
    return null;
  }
}

@Injectable()
export class TranslationService {
  selectedLanguage: LanguageCode = (tryGetLanguage() || 'gb') as LanguageCode;

  get translations() {
    return TRANSLATIONS[this.selectedLanguage];
  }

  setSelectedLanguage(language: string) {
    this.selectedLanguage = language as LanguageCode;
    localStorage.setItem('language', language);
  }

  /** Formats the given numeric value as a price according to the selected locale. */
  formatPrice(value: number) {
    if (isNaN(value)) return '';
    const locale = this.translations.iso639Locale;
    const formatter = Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    });
    return formatter.format(value);
  }
}
