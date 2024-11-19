import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SearchMessagesService from "../services/MessageServices/SearchMessagesService";
import  { SearchService } from "../services/SearchService"
import ListMessagesServiceSearch from "../services/MessageServices/ListMessagesServiceSearch";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const searchMessagesControler = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { id, date } = req.query;
  if (!ticketId || !id) {
    return res.status(400).json({ error: "Parâmetros de ticketId e query são necessários" });
  }
  try {
    const { count, messages, ticket, hasMore } = await ListMessagesServiceSearch({
      date: String(date),
      ticketId,
      id: String(id)
    });

   const io = getIO();
    io.to(ticketId.toString()).emit("appMessage", {
      action: "wanted",
      message:{ count, messages, ticket, hasMore, id } 
    });

    return res.send()
 
  } catch (error) {
    console.error('Erro ao buscar mensagens no Elasticsearch:', error);
    return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
}


export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });


  return res.send();
};


export const searchMessagesControlerasync = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { query , page } = req.query;

  if (!ticketId || !query) {
    return res.status(400).json({ error: "Parâmetros de ticketId e query são necessários" });
  }

  try {
    const result = await SearchService({ 
      query: String(query),
      ticketId: Number(ticketId),
      page: Number(page) || 1,
      size: Number(10)
    });
     return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar mensagens no Elasticsearch:', error);
    return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
}




