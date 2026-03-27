import 'dotenv/config';
import PricesController from "./controllers/prices-controller.js";
import MailService from './services/mailer.js';

const pricesController = new PricesController();
const mailService = new MailService();

let result = await pricesController.getPrices();
mailService.sendSummary(result);