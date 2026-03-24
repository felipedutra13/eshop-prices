import axios from "axios";

class ExchangeRateApiService {
    conversionRates = {};

    static async getInstance() {
        const exchangeRateApiService = new ExchangeRateApiService();
        exchangeRateApiService.getBrlRates();
        return exchangeRateApiService;
    }

    async getBrlRates() {
        if (!process.env.EXCHANGE_RATE_API_KEY) {
            throw new Error('Api key not provided!');
        }
        const BASE_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/BRL`;

        try {
        const response = await axios.get(BASE_URL);

        this.conversionRates = response.data.conversion_rates;
        } catch (err) {
            throw new Error('Currency converter is not available!');
            console.log(err);
        }
    }

    async convert({ to, amount }) {
        if (!to || !amount) {
            throw new Error('Parameters not informed!');
        }

        let convertedValue = this.conversionRates[to];

        if (!convertedValue) {
            throw new Error('Currency not found!');
        }

        return Number((amount / convertedValue).toFixed(2));
    }

};

export default ExchangeRateApiService;