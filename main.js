import { SellingPropertiesCom, SellingLamudi, SellingHousesJal24, SellingDepartmentsJal24 } from './scrapper.js';


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

function SellingHousesJal() {
    const scrapper = new SellingHousesJal24('https://www.inmuebles24.com/casas-en-venta-en-jalisco.html');
    scrapper.scrapeUrls(2,4,3000);
}

function SellingDepartmentsJal() {
    const scrapper = new SellingDepartmentsJal24('https://www.inmuebles24.com/departamentos-en-venta-en-jalisco.html');
    scrapper.scrapeUrls(2,4,3000);
}

sellingPropertiesCom();
sellingLamudi();
SellingHousesJal();
SellingDepartmentsJal();