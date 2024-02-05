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
    console.log('Initializing browser');
    this._browser = await puppeteer.launch({
      headless: true,
        protocolTimeout: 30000, 
    });

    this._browser.on('targetcreated', async target => {
        const page = await target.page();
        if (page) {
            page.setDefaultTimeout(300000); 
        }
    });
}



  get url() {
    return this._url;
  }

  set url(url) {
    this._url = url;
  }

  async handleCookies(page) {
    const acceptButtonSelector = '[data-qa="cookies-policy-banner"]';

    try {
        await page.waitForSelector(acceptButtonSelector);
        await page.click(acceptButtonSelector);
    } catch (error) {
        console.error('Error handling cookies:', error);
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
  


  async scrap() {
    if(!this._browser) {
      await this.init();
    }
    const page = await this._browser.newPage();

    try {
        await page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 0 });

        //await this.handleCookies(page);

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

              if(locationElement?.innerText.trim()) {
                  estateData.location = locationElement?.innerText.trim();
              }
              if(price?.innerText.trim()) {
                  estateData.price = price?.innerText.trim();
              }
              if(priceFromElement?.innerText.trim()) {
                  estateData.priceFrom = priceFromElement?.innerText.trim();
              }
              if(priceToElement?.innerText.trim()) {
                  estateData.priceTo = priceToElement?.innerText.trim();
              }

              if(description?.innerText.trim()) {
                  estateData.description = description?.innerText.trim();
              }

              if(featuresElement?.innerText.trim()) {
                  estateData.features = featuresElement?.innerText.trim();
              }

              const postingType = estate.getAttribute('data-posting-type');
              if (postingType === 'DEVELOPMENT'){
                dataToPostingValue = estate.getAttribute('data-to-posting');
                estateData.stage = 'development'
              }
              
              if (postingType === 'PROPERTY'){
                dataToPostingValue = estate.getAttribute('data-to-posting');
                estateData.stage = 'finished'
              }

              if (dataToPostingValue){
                estateData.url = 'https://www.inmuebles24.com'+dataToPostingValue;
              }
              result[estateId + 1] = estateData;

            }


          return result;
        });
        return data;
    } catch (error) {
        console.error('Error during execution:', error);
    } finally {
        await page.close();
        //await this._browser.close();
    }
}

}

class SellingHousesJal extends Scrapper {
    constructor(url) {
        super(url);
        this._page = null;
    }

    async scrapeUrls(startPage, endPage, delay) {
      const allData = {};
      const firstPage = await this.scrap(); 
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
  
        const data = await this.scrap(); 
        for (const [key, property] of Object.entries(data)) {
          if (property.url) {
            const coordinates = await this.getCoordinates(property.url);
            property.coordinates = coordinates;
          }
        }
        allData[url] = data;
  
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const fileName = 'data.json';

      if(fs.existsSync(fileName)){
        fs.unlinkSync(fileName);
      }
  
      fs.writeFile('dataHouses.json', JSON.stringify(allData), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
  }
}


class SellingDepartmentsJalisco extends Scrapper {
  constructor(url) {
    super(url);
    this._page = null;
  }
  async scrapeUrls(startPage, endPage, delay) {
    const allData = {};
    const firstPage = await this.scrap(); 
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

      const data = await this.scrap(); 
      for (const [key, property] of Object.entries(data)) {
        if (property.url) {
          const coordinates = await this.getCoordinates(property.url);
          property.coordinates = coordinates;
        }
      }
      allData[url] = data;

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const fileName = 'data.json';

    if(fs.existsSync(fileName)){
      fs.unlinkSync(fileName);
    }

    fs.writeFile('dataDepartments.json', JSON.stringify(allData), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  }
}


export {SellingHousesJal, SellingDepartmentsJalisco}