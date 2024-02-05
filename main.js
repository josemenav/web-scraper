import {SellingHousesJal, SellingDepartmentsJal} from './scrapper.js';

function sellingHousesJal() {
    const scrapper = new SellingHousesJal('https://www.inmuebles24.com/casas-en-venta-en-jalisco.html');
    scrapper.scrapeUrls(2,4,3000);
}

function sellingDepartmentsJal() {
    const scrapper = new SellingDepartmentsJal('https://www.inmuebles24.com/departamentos-en-venta-en-jalisco.html');
    scrapper.scrapeUrls(2,4,3000);
}

sellingHousesJal();
sellingDepartmentsJal();