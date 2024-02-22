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
            protocolTimeout: 30000,
        });

        this._browser.on('targetcreated', async target => {
            const page = await target.page();
            if (page) {
                page.setDefaultTimeout(300000);
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

class SellingInmuebles24 extends Scrapper {
    constructor(url) {
        super(url);
        this._page = null;
    }

    async scrapeUrls(startPage, endPage, delay) {
        const allData = {};

        for (let i = startPage; i <= endPage; i++) {
            const url = `${this.url}-pagina-${i}.html`;
            this.url = url;

            const data = await this.scrapInmuebles24();
            allData[url] = data;

            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const fileName = 'dataInmuebles24.json';

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

export { SellingPropertiesCom, SellingInmuebles24, SellingLamudi };