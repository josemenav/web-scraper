import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

class Scrapper {
    constructor(url) {
        this._url = url;
        this._browser = null;
    }

    async init() {
        console.log('Inicializando el navegador');
        this._browser = await puppeteer.launch({
            headless: true,
            protocolTimeout: 300000,
        });

        this._browser.on('targetcreated', async target => {
            const page = await target.page();
            if (page) {
                page.setDefaultTimeout(3000000);
            }
        });
    }

    async handleCookies(page) {
        const acceptButtonSelector = '[data-qa="cookies-policy-banner"]';

        try {
            await page.waitForSelector(acceptButtonSelector);
            await page.click(acceptButtonSelector);
        } catch (error) {
            console.error('Error manejando las cookies:', error);
        }
    }

    async getCoordinates(url) {
        if(!this._browser) {
          await this.init();
        }
        if (!this._page) {
          this._page = await this._browser.newPage();
      }
        try {
          await this._page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
          await this._page.waitForSelector('.static-map');
          const data = await this._page.evaluate(() => {
            const mapElement = document.querySelector('.static-map');
            const mapUrl = mapElement.getAttribute('src');
            const coordinates = {};
            if (mapUrl) {
              const coordinatesString =  mapUrl.split('center=')[1];
              if (coordinatesString) {
                let [latitude, longitude] = coordinatesString.split(',');
                longitude = longitude.split('&')[0];
                coordinates.latitude = latitude.trim();
                coordinates.longitude = longitude.trim();
              }
            }
            return coordinates;
          });
          return data;
        } catch (error) {
          console.error('Error getting coordinates:', error);
        } 
      }

    async scrapPropiedades() {
        if (!this._browser) {
            await this.init();
        }

        const page = await this._browser.newPage();

        try {
            await page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 0 });
            await page.waitForSelector('.sc-1f8d9345-0');

            const data = await page.evaluate(() => {
                const result = {};
                const estateList = document.querySelectorAll('.sc-1f8d9345-0');

                for (const [estateId, estate] of Object.entries(estateList)) {
                    const price = estate.querySelector('.sc-1f8d9345-2');
                    const locationElement = estate.querySelector('.sc-1f8d9345-3');
                    const info = estate.querySelector('.sc-1f8d9345-4');

                    const estateData = {};

                    if (price?.innerText.trim()) {
                        estateData.price = price?.innerText.trim();
                    }
                    if (locationElement?.innerText.trim()) {
                        estateData.location = locationElement?.innerText.trim();
                    }

                    if (info?.innerText.trim()) {
                        estateData.info = info?.innerText.trim();
                    }

                    result[estateId + 1] = estateData;
                }

                return result;
            });

            return data;
        } catch (error) {
            console.error('Error durante la ejecución:', error);
        } finally {
            await page.close();
        }
    }

    async scrapInmuebles24() {
        if (!this._browser) {
            await this.init();
        }

        const page = await this._browser.newPage();

        try {
            await page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 0 });
            await page.waitForFunction(() => document.querySelector('.sc-i1odl-0'));

            const data = await page.evaluate(() => {
                const result = {};
                const estateList = document.querySelectorAll('.sc-i1odl-0');

                for (const [estateId, estate] of Object.entries(estateList)) {
                    const locationElement = estate.querySelector('[data-qa="POSTING_CARD_LOCATION"]');
                    const price = estate.querySelector('[data-qa="POSTING_CARD_PRICE"]');
                    const priceFromElement = estate.querySelector('[data-qa="POSTING_CARD_PRICE_FROM"]');
                    const priceToElement = estate.querySelector('[data-qa="POSTING_CARD_PRICE_TO"]');
                    const description = estate.querySelector('[data-qa="POSTING_CARD_DESCRIPTION"]');
                    const featuresElement = estate.querySelector('[data-qa="POSTING_CARD_FEATURES"]');

                    const estateData = {};

                    if (locationElement?.innerText.trim()) {
                        estateData.location = locationElement?.innerText.trim();
                    }
                    if (price?.innerText.trim()) {
                        estateData.price = price?.innerText.trim();
                    }
                    if (priceFromElement?.innerText.trim()) {
                        estateData.priceFrom = priceFromElement?.innerText.trim();
                    }
                    if (priceToElement?.innerText.trim()) {
                        estateData.priceTo = priceToElement?.innerText.trim();
                    }

                    if (description?.innerText.trim()) {
                        estateData.description = description?.innerText.trim();
                    }

                    if (featuresElement?.innerText.trim()) {
                        estateData.features = featuresElement?.innerText.trim();
                    }

                    const postingType = estate.getAttribute('data-posting-type');
                    if (postingType === 'DEVELOPMENT') {
                        dataToPostingValue = estate.getAttribute('data-to-posting');
                        estateData.stage = 'development';
                    }

                    if (postingType === 'PROPERTY') {
                        dataToPostingValue = estate.getAttribute('data-to-posting');
                        estateData.stage = 'finished';
                    }

                    if (dataToPostingValue) {
                        estateData.url = 'https://www.inmuebles24.com' + dataToPostingValue;
                    }
                    result[estateId + 1] = estateData;
                }

                return result;
            });
            return data;
        } catch (error) {
            console.error('Error durante la ejecución:', error);
        } finally {
            await page.close();
        }
    }

    async scrapLamudi() {
        if (!this._browser) {
            await this.init();
        }

        const page = await this._browser.newPage();

        try {
            await page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 0 });
            await page.waitForFunction(() => document.querySelector('item__content'));

            const data = await page.evaluate(() => {
                const result = {};
                const estateList = document.querySelectorAll('item__content');

                for (const [estateId, estate] of Object.entries(estateList)) {
                    const price = estate.querySelector('price');
                    const locationElement = estate.querySelector('location');
                    const info = estate.querySelector('properties');

                    const estateData = {};

                    if (price?.innerText.trim()) {
                        estateData.price = price?.innerText.trim();
                    }
                    if (locationElement?.innerText.trim()) {
                        estateData.location = locationElement?.innerText.trim();
                    }

                    if (info?.innerText.trim()) {
                        estateData.info = info?.innerText.trim();
                    }

                    result[estateId + 1] = estateData;
                }

                return result;
            });

            return data;
        } catch (error) {
            console.error('Error durante la ejecución:', error);
        } finally {
            await page.close();
        }
    }
}

class SellingPropertiesCom extends Scrapper {
    constructor(url) {
        super(url);
        this._page = null;
    }

    async scrapeUrls(startPage, endPage, delay, type) {
        const allData = {};

        for (let i = startPage; i <= endPage; i++) {
            const url = `${this.url}/${type}?page=${i}`;
            this.url = url;

            const data = await this.scrapPropiedades();
            allData[url] = data;

            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const fileName = `dataPropiedadesCom_${type}.json`;

        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }

        fs.writeFile(fileName, JSON.stringify(allData), (err) => {
            if (err) throw err;
            console.log('Datos escritos en el archivo');
        });
    }
}


class SellingLamudi extends Scrapper {
    constructor(url) {
        super(url);
        this._page = null;
    }

    async scrapeUrls(startPage, endPage, delay, type) {
        const allData = {};

        for (let i = startPage; i <= endPage; i++) {
            const url = `${this.url}/${type}/?page=${i}`;
            this.url = url;

            const data = await this.scrapLamudi();
            allData[url] = data;

            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const fileName = `dataLamudi_${type}.json`;

        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }

        fs.writeFile(fileName, JSON.stringify(allData), (err) => {
            if (err) throw err;
            console.log('Datos escritos en el archivo');
        });
    }
}


class SellingHousesJal24 extends Scrapper {
    constructor(url) {
        super(url);
        this._page = null;
    }

    async scrapeUrls(startPage, endPage, delay) {
      const allData = {};
      const firstPage = await this.scrapInmuebles24(); 
      for (const [key, property] of Object.entries(firstPage)) {
        if (property.url) {
          const coordinates = await this.getCoordinates(property.url);
          property.coordinates = coordinates;
        }
      }
      allData[this.url] = firstPage;
      for (let i = startPage; i <= endPage; i++) {
        const url = `https://www.inmuebles24.com/casas-en-venta-en-jalisco-pagina-${i}.html`;
        this.url = url; 
  
        const data = await this.scrapInmuebles24(); 
        for (const [key, property] of Object.entries(data)) {
          if (property.url) {
            const coordinates = await this.getCoordinates(property.url);
            property.coordinates = coordinates;
          }
        }
        allData[url] = data;
  
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const fileName = 'dataHouses24.json';

      if(fs.existsSync(fileName)){
        fs.unlinkSync(fileName);
      }
  
      fs.writeFile('dataHouses24.json', JSON.stringify(allData), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
  }
}


class SellingDepartmentsJal24 extends Scrapper {
  constructor(url) {
    super(url);
    this._page = null;
  }
  async scrapeUrls(startPage, endPage, delay) {
    const allData = {};
    const firstPage = await this.scrapInmuebles24(); 
    for (const [key, property] of Object.entries(firstPage)) {
      if (property.url) {
        const coordinates = await this.getCoordinates(property.url);
        property.coordinates = coordinates;
      }
    }
    allData[this.url] = firstPage;
    for (let i = startPage; i <= endPage; i++) {
      const url = `https://www.inmuebles24.com/departamentos-en-venta-en-jalisco-pagina-${i}.html`;
      this.url = url; 

      const data = await this.scrapInmuebles24(); 
      for (const [key, property] of Object.entries(data)) {
        if (property.url) {
          const coordinates = await this.getCoordinates(property.url);
          property.coordinates = coordinates;
        }
      }
      allData[url] = data;

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const fileName = 'dataDepartments24.json';

    if(fs.existsSync(fileName)){
      fs.unlinkSync(fileName);
    }

    fs.writeFile('dataDepartments24.json', JSON.stringify(allData), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  }
}

export { SellingPropertiesCom, SellingLamudi, SellingHousesJal24, SellingDepartmentsJal24 };