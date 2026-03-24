import 'dotenv/config';
import PricesController from "./src/controllers/prices-controller.js";
import MailService from './src/services/mailer.js';
import SupportController from './src/controllers/support-controller.js';

const pricesController = new PricesController();
const mailService = new MailService();
const supportController = new SupportController();

let result = await pricesController.getPrices();
mailService.sendSummary(result);