import axios from 'axios';
import { parse } from'csv-parse/sync';

class GoogleSheetService {
  constructor({ sheetUrl, scriptUrl }) {
    this.sheetUrl = sheetUrl;
    this.scriptUrl = scriptUrl;
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

  async updateGamePrice(gameData) {
        try {
            await axios.post(this.scriptUrl, gameData);
            console.log(`✅ Planilha atualizada para: ${gameData.name}`);
        } catch (error) {
            console.error("Erro no Axios:", error.response ? error.response.data : error.message);
        }
    }
}

export default GoogleSheetService;