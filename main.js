import {Scrapper, SellingHousesJal} from './scrapper.js';

function sellingHousesJal() {
    
    const scrapper = new SellingHousesJal('https://www.inmuebles24.com/casas-en-venta-en-jalisco.html');
    scrapper.scrapeUrls(2,4,3000);
}

sellingHousesJal();