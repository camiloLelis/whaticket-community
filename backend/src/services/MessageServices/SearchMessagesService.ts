import Message from "../../models/Message"; // Certifique-se de que este caminho está correto
import { Op, Sequelize } from "sequelize";

interface SearchMessagesParams {
    ticketId: number;
    searchTerm: string;
    page: number;
}

const SearchMessagesService = async ({ ticketId, searchTerm, page }: SearchMessagesParams) => {
    const limit = 20; // Número de mensagens por página
    const offset = (page - 1) * limit;

    try {
        // Executa a busca FULLTEXT no campo 'body' da mensagem
        const { count, rows: messages } = await Message.findAndCountAll({
            where: {
                ticketId: ticketId,
                // Usando a busca FULLTEXT no campo 'body'
                [Op.and]: Sequelize.literal(`MATCH (body) AGAINST ('${searchTerm}' IN NATURAL LANGUAGE MODE)`)
            },
            limit: limit,
            offset: offset,
            order: [["createdAt", "DESC"]]
        });

        console.log("Resultado da busca FULLTEXT", count, messages);

        return {
            count,
            messages,
            hasMore: count > offset + messages.length
        };
    } catch (error) {
        throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }
};

export default SearchMessagesService;
