// services/messageSearchService.ts
import { match } from 'assert';
import { client } from '../ElasticSearchService/index';

interface SearchResult {
  _source: {
    message_body: string;
    [key: string]: any;
    message_date: string;
  };
  total: number;
}
interface SearchQuery {
  query: string;
  ticketId: number;
  page: number;
  size: number;
}

// Função para buscar mensagens com paginação
export const SearchService = async ({ query, ticketId, page, size=40 }: SearchQuery): Promise<SearchResult[]> => {
  
  let from = 0;
  if (page > 1) {
   from = 40 * page - 1;
  }
  size = 40;

  const response = await client.search({
    index: 'messages',
    body: {
      "from": from,
      "size": size,

      query: {
        bool: {
          must: [
            { term: { ticketId } },  // Filtrar por ticketId
            {
              match: {
                message_body: {
                  query,
                  fuzziness: "AUTO",      // Considerar variações
                  operator: "and"         // Exigir que todas as palavras da consulta apareçam no resultado
                }
              }
            }
          ]
        }
      },
    }
  });
  



  const total = response.body.hits.total.value - size * (page - 1);
  const searchResul = response.body.hits.hits;
  return [searchResul, total] as SearchResult[];
};


