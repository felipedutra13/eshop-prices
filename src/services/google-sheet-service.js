import axios from 'axios';
import { parse } from'csv-parse/sync';

class GoogleSheetService {
  constructor(sheetUrl) {
    this.sheetUrl = sheetUrl;
  }

  async getGames() {
    try {
      const response = await axios.get(this.sheetUrl);

      const records = parse(response.data, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      return records.map(game => ({
        id: game.ID,
        title: game.Title
      }));
    } catch (error) {
      throw new Error(`Falha ao carregar wishlist: ${error.message}`);
    }
  }
}

export default GoogleSheetService;