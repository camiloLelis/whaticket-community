import { client } from '../ElasticSearchService'; 
import  Message  from '../../models/Message'; 

//  sincronizar a mensagem com o Elasticsearch
export const syncMessageToElasticSearch = async (message: Message) => {
  try {
    const document = {
      message_body: message.body, 
      message_date: message.createdAt,
      ticketId: message.ticketId
    };

    const response = await client.index({
      index: 'messages', 
      id: message.id, 
      body: document 
    });

  } catch (error) {
    console.error("Erro ao sincronizar no Elasticsearch:", error);
  }
};
