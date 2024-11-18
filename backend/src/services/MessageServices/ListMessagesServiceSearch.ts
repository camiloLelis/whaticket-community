import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketId: string;
  id: string;
  date?: string; // Supondo que `date` seja uma string no formato "YYYY-MM-DD"
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesServiceSearch = async ({
  date,
  ticketId,
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20;

  // Prepara o intervalo de data para buscar apenas mensagens do dia
  let startOfDay: Date | undefined;
  let endOfDay: Date | undefined;

  if (date) {
    const parsedDate = new Date(date); // Converte a string em um objeto Date
    startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0)); // Início do dia
    endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999)); // Fim do dia
  }

  // Condição de busca
  const whereCondition: any = {
    ticketId,
  };

  if (startOfDay && endOfDay) {
    whereCondition.createdAt = {
      [Op.gte]: startOfDay,
      [Op.lt]: endOfDay,
    };
  }

  const { count, rows: messages } = await Message.findAndCountAll({
    where: whereCondition,
    limit,
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > messages.length;

  return {
    messages: messages.reverse(),
    ticket,
    count,
    hasMore,
  };
};

export default ListMessagesServiceSearch;
