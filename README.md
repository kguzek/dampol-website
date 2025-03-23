# Dampol Website

This is the product website for Dampol Investment sp. z o. o., which is a local container producer in Czekanów, Poland. It is written in Angular and includes model previews, feature selection, price prediction, as well as a customer information form and order submission feature. Aside from this, it includes an "About" section and a "Contact" section for more information about the company and to help guide customers if further information is needed.

The model information is hosted independently on a self-hosted headless Directus CMS instance, but the website is statically rendered and rebuilt twice a day on working days fetching the data at build time. After hydration, the data is fetched on the client when stale, so the website content is always both up-to-date and statically served, levaraging the powerful tools made available by Angular and making the best of SSG and CSR.

The website is hosted on [GitHub Pages](https://kguzek.github.io/dampol-website).

![Website preview](https://github.com/kguzek/dampol-website/blob/images/homepage/all-devices-black.png?raw=true)

|Screenshot Previews|
|:-----:|
|Desktop|
|<img alt="Desktop website preview" src="https://github.com/kguzek/dampol-website/blob/images/models/desktop.png?raw=true" height="400" />|
|Laptop|
|<img alt="Laptop website preview" src="https://github.com/kguzek/dampol-website/blob/images/models/laptop.png?raw=true" height="400" />|
|Tablet|
|<img alt="Laptop website preview" src="https://github.com/kguzek/dampol-website/blob/images/models/tablet-black.png?raw=true" height="400" />|
|Mobile|
|<img alt="Mobile website preview" src="https://github.com/kguzek/dampol-website/blob/images/models/mobile-black.png?raw=true" height="400" />|
