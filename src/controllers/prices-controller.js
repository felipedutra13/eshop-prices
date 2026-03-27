import NintendoStoreService from "./../services/nintendo-store-service.js";
import GoogleSheetService from "./../services/google-sheet-service.js";
import ExchangeRateApiService from "../services/exchange-rate-api.js";

const TIMEOUT = 1000;

function filterGamesWithDiscount(prices) {
    return prices
    .filter(price => price.discount)
    .sort(sortByDiscountPercentage);
}

function sortByDiscountPercentage(a, b) {
    const percentageOffA = Math.round(((a.price - a.discount) / a.price) * 100);
    const percentageOffB = Math.round(((b.price - b.discount) / b.price) * 100);
    return percentageOffB - percentageOffA;
}

class PricesController {
    async getPrices() {
        const exchangeRateApiService = await ExchangeRateApiService.getInstance();
        const pricesResult = [];

        const googleSheetService = new GoogleSheetService({ sheetUrl: process.env.GOOGLE_SHEET_URL, scriptUrl: process.env.GOOGLE_APP_URL });
        const games = await googleSheetService.getGames();

        const nintendoService = new NintendoStoreService(exchangeRateApiService);

        for (let game of games) {
            let uid = "";
            
            if (game.id) {
                uid = game.id;
            } else {
                uid = await nintendoService.findExternalId(game.title);
            }

            console.log(game.title);
            let prices = await nintendoService.getPrices(uid, game.title);

            googleSheetService.updateGamePrice({ name: game.title, uid, price: (prices.discount || prices.price)});

            pricesResult.push(prices);

            await new Promise(resolve => setTimeout(resolve, TIMEOUT));
        }

        return filterGamesWithDiscount(pricesResult);
    }
};

export default PricesController;