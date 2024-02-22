import { SellingPropertiesCom, SellingInmuebles24, SellingLamudi } from './scrapper.js';

function sellingInmuebles24() {
    const scrapper = new SellingInmuebles24('https://www.inmuebles24.com/casas-en-venta-en-jalisco');
    scrapper.scrapeUrls(1, 5, 3000);
}

function sellingPropertiesCom() {
    const scrapperVenta = new SellingPropertiesCom('https://propiedades.com/guadalajara');
    scrapperVenta.scrapeUrls(1, 5, 3000, 'for-sale');

    const scrapperRenta = new SellingPropertiesCom('https://propiedades.com/guadalajara');
    scrapperRenta.scrapeUrls(1, 5, 3000, 'for-rent');
}

function sellingLamudi() {
    const scrapperVenta = new SellingLamudi('https://www.lamudi.com.mx/jalisco/casa');
    scrapperVenta.scrapeUrls(1, 5, 3000, 'for-sale');

    const scrapperRenta = new SellingLamudi('https://www.lamudi.com.mx/jalisco/casa');
    scrapperRenta.scrapeUrls(1, 5, 3000, 'for-rent');
}

sellingPropertiesCom();
sellingInmuebles24();
sellingLamudi();