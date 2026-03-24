import * as cheerio from "cheerio";
import axios from "axios";

function extractTitle(html) {
    const $ = cheerio.load(html);

    const games = [];
    $(".games-list a.games-list-item").each((i, el) => {
        const $el = $(el);

        const title = $el.find("h5").first().text().trim();

        games.push(title);
    });

    return games;
}





class EshopPrices {
    async listItems() {
        let items = [];
        let finished = false;
        let currentPage = 6;

        do {
            const targetUrl = encodeURIComponent(`https://eshop-prices.com/wishlist?currency=BRL&page=${currentPage}`);
            const cookies = `_eps=${process.env.ESHOP_PRICES_TOKEN}`;
            const encodedCookies = encodeURIComponent(cookies);
            const config = {
                'method': 'GET',
                'url': `https://api.scrape.do/?token=${process.env.SCRAPEDO_API_KEY}&url=${targetUrl}&setCookies=${encodedCookies}`,
                'headers': {}
            };
            let response = await axios(config);

            let result = extractTitle(response.data);
            if (!result || !result.length) {
                finished = true;
            } else {
                items.push(...result);
            }

            currentPage++;
        } while (!finished);

        return items;
    }
};

export default EshopPrices;