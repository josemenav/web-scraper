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
    this._browser = await puppeteer.launch({
      headless: true,
        protocolTimeout: 30000, 
    });

    this._browser.on('targetcreated', async target => {
        const page = await target.page();
        if (page) {
            page.setDefaultTimeout(30000); 
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

  async scrap() {
    if(!this._browser) {
      await this.init();
    }
    const page = await this._browser.newPage();

    try {
        await page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 0 });

        await this.handleCookies(page);

        await page.waitForFunction(() => document.querySelector('.sc-i1odl-2'));

        const data = await page.evaluate(() => {
            const result = {};
            const estate = document.querySelectorAll('.sc-i1odl-2');
            
            estate.forEach((estate, estateId) => {
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

                result[estateId + 1] = estateData;
            });

            return result;
        });
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error during execution:', error);
    }
}

}

class SellingHousesJal extends Scrapper {
    constructor(url) {
        super(url);
    }

    async scrapeUrls(startPage, endPage, delay) {
      const allData = {};
      const firstPage = await this.scrap(); 
      allData[this.url] = firstPage;
      for (let i = startPage; i <= endPage; i++) {
        const url = `https://www.inmuebles24.com/casas-en-venta-en-jalisco-pagina-${i}.html`;
        this.url = url; 
  
        const data = await this.scrap(); 
        allData[url] = data;
  
        await new Promise(resolve => setTimeout(resolve, delay));
      }
  
      fs.writeFile('data.json', JSON.stringify(allData), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
  }
}


export {SellingHousesJal, Scrapper}