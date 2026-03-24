import axios from 'axios';
import UserAgent from 'user-agents';

import stringSimilarity from "string-similarity";

const url = "https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries";
const apiKey = "a29c6927638bfd8cee23993e51e721c9";
const appKey = "U3B6GR4UA3";
const baseUrlToGetPrices = "https://api.ec.nintendo.com/v1/price";
const countries = ['BR', 'US', 'MX', 'PE', 'CO', 'CL', 'CA']; //"AR"
const AR_FEE_VALUE = 1.74;

class NintendoStoreService {
    exchangeRateApiService = null;

    constructor(exchangeRateApiService) {
        this.exchangeRateApiService = exchangeRateApiService;
    }

    async convertCurrency(response) {
        let results = [];

        results = await Promise.all(response.map(async (data) => {

            const country = data.country;

            let currency = data.prices?.[0]?.regular_price?.currency;
            if (currency) {
                let price = Number(data.prices[0].regular_price?.raw_value);
                let discount = Number(data.prices[0].discount_price?.raw_value);

                if (country == "AR") {
                    price *= AR_FEE_VALUE;
                    discount *= AR_FEE_VALUE;
                }

                let priceConverted = 0;
                let discountConverted = 0;

                priceConverted = await this.exchangeRateApiService.convert({ to: data.prices[0].regular_price?.currency,  amount: price });

                if (discount) {
                    discountConverted = await this.exchangeRateApiService.convert({ to: data.prices[0].regular_price?.currency, amount: discount });
                }

                return {
                    country: country,
                    price: priceConverted,
                    discount: discountConverted
                };
            }

            return null;
        }));

        return results.filter(r => r);
    }

    async findExternalId(title) {


                  let externalId = "place_holder";

                 try {

                 

        let response = await axios.post(url, {
            "requests": [
                {
                    "indexName": "store_game_en_us",
                    "query": title,
                    "params": "filters=&hitsPerPage=50"
                }
            ]
        },
            {
                headers: {
                    'x-algolia-api-key': apiKey,
                    'x-algolia-application-id': appKey
                },
            });

        let hits = response.data.results[0].hits.filter(hit => hit.nsuid);

        let matches = stringSimilarity.findBestMatch(title.toLowerCase(), hits.map(result => result.title.toLowerCase()));

        

        if (matches.bestMatch && matches.bestMatch.rating > 0.7) {
            externalId = hits[matches.bestMatchIndex].nsuid;
        }
    } catch (err) {
        throw new Error(`Error while getting externalId from ${title}`)
    }

        return externalId;
    }

    async getPrices(uid, title) {
        let urls = countries.map(country => baseUrlToGetPrices + `?country=${country}&lang=pt&ids=${uid}`);

        let responses = await Promise.all(urls.map(url => axios.get(url, {
            headers: {
                'User-Agent': new UserAgent().toString()
            }
        })));

        let prices = await this.convertCurrency(responses.map(res => res.data));

        let result = {
            title,
            price: '',
            discount: '',
            url: '',
            additionalInfo: '',
            additionalDiscount: '',
            country: '',
            uid
        };

        let minimumValue = 9999;
        let selected;

        prices.forEach(item => {
            if (item.discount && item.discount < minimumValue) {
                minimumValue = item.discount;
                selected = item;
            } else if (item.price < minimumValue) {
                minimumValue = item.price;
                selected = item;
            }
        });

        if (selected) {
            result.price = selected.price.toFixed(2);
            if (selected.discount > 0) {
                result.discount = selected.discount.toFixed(2);
            }
            let selectedCountry = selected.country;
            result.url = baseUrlToGetPrices + `?country=${selectedCountry}&lang=pt&ids=${uid}`;
            result.country = selectedCountry;
        }

        return result;
    }

    async mountUrl(uid) {
        return baseUrlToGetPrices + `?country=BR&lang=pt&ids=${uid}`;
    }

};

export default NintendoStoreService;