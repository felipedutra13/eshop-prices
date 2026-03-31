import nodemailer from 'nodemailer';

/**
 * Transforma o array de jogos em uma tabela HTML formatada para e-mail.
 */
function generateGamesTableHtml(games) {
    // Estilos Inline para máxima compatibilidade
    const tableStyle = 'width: 100%; border-collapse: collapse; font-family: sans-serif; margin-top: 20px;';
    const thStyle = 'background-color: #e60012; color: white; padding: 12px; text-align: left; border: 1px solid #ddd;';
    const tdStyle = 'padding: 10px; border: 1px solid #ddd; font-size: 14px;';
    const uidStyle = 'color: #888; font-size: 11px; font-family: monospace; display: block; margin-top: 4px;';
    const discountBadge = 'background-color: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;';

    let rows = games.map(game => {
        const originalPrice = parseFloat(game.price);
        const salePrice = game.discount ? parseFloat(game.discount) : originalPrice;
        const lowestPrice = game.lowestPrice ? parseFloat(game.lowestPrice) : 9999;
        const hasDiscount = salePrice < originalPrice;
        
        // Cálculo da porcentagem de desconto
        const percentageOff = hasDiscount 
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
            : 0;
        
        const isLowest = lowestPrice > salePrice;

        return `
            <tr>
                <td style="${tdStyle}">
                    <strong>${game.title}</strong><br>
                    <span style="${uidStyle}">ID: ${game.uid}</span>
                    <small style="color: #666;">Região: ${game.country}</small>
                </td>
                <td style="${tdStyle}">
                    ${hasDiscount 
                        ? `
                            <span style="text-decoration: line-through; color: #999; font-size: 12px;">R$ ${originalPrice.toFixed(2)}</span><br>
                            <span style="color: #e60012; font-weight: bold; font-size: 16px;">R$ ${salePrice.toFixed(2)}</span>
                            ${
                            // Compara o preço de venda com o menor histórico
                            isLowest
                                ? `<br><span style="color: #28a745; font-size: 11px; font-weight: bold;">⭐ RECORDE HISTÓRICO</span>` 
                                : `<br><span style="color: #999; font-size: 10px;">Mínima: R$ ${parseFloat(game.lowestPrice).toFixed(2)}</span>`
                            }
                        `
                        : `<span style="font-weight: bold;">R$ ${originalPrice.toFixed(2)}</span>`
                    }
                </td>
                <td style="${tdStyle}; text-align: center;">
                    ${hasDiscount ? `<span style="${discountBadge}">${percentageOff}% OFF</span>` : '-'}
                </td>
                <td style="${tdStyle}; text-align: center;">
                    <a href="${game.url}" style="color: #007bff; text-decoration: none; font-weight: bold;">Ver na eShop</a>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #e60012; padding-bottom: 10px;">🎮 Resumo de Preços eShop</h2>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Jogo</th>
                        <th style="${thStyle}">Preço</th>
                        <th style="${thStyle}">OFF</th>
                        <th style="${thStyle}">Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <p style="font-size: 12px; color: #777; margin-top: 20px;">
                Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}.
            </p>
        </div>
    `;
}

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });
    }

    async sendSummary(games) {
        const mailOptions = {
            from: `"eShop Price Bot" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            subject: `🎮 Promoções eShop - ${new Date().toLocaleDateString('pt-BR')}`,
            html: generateGamesTableHtml(games)
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✉️ E-mail enviado com sucesso:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Erro ao enviar e-mail:', error);
            throw error;
        }
    }
}

export default MailService;