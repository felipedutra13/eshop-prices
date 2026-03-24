import 'dotenv/config';
import PricesController from "./controllers/prices-controller.js";
import MailService from './services/mailer.js';
import SupportController from './controllers/support-controller.js';

const pricesController = new PricesController();
const mailService = new MailService();
const supportController = new SupportController();

let result = await pricesController.getPrices();
mailService.sendSummary(result);