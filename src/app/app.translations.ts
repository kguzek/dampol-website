export const TRANSLATIONS = {
  dk: {
    languageCode: 'DK',
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
      temporaryModelDescription:
        'Denne containerpavillon er designet til at fremvise bæredygtig og miljøvenlig praksis.',
      modelDescriptions: [],
    },
    about: {
      header: 'Om',
      companyDescription: 'et polsk firma',
      paragraphs: [],
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
      temporaryModelDescription:
        'This container pavilion is designed to showcase sustainable and eco-friendly practices.',
      modelDescriptions: [],
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
  },
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];
