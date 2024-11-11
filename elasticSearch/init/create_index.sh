#!/bin/bash

# Nome do índice
INDEX_NAME="messages"

# Verificar se o Elasticsearch está funcionando (ping)
echo "Verificando o status do Elasticsearch..."
curl -X GET "localhost:9200/_cluster/health?pretty" > /dev/null

# Criar o índice
echo "Criando o índice '$INDEX_NAME'..."
curl -X PUT "http://localhost:9200/$INDEX_NAME?pretty" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "tokenizer": {
        "whitespace": {
          "type": "whitespace"
        }
      },
      "filter": {
        "lowercase": {
          "type": "lowercase"
        }
      },
      "char_filter": {
        "remove_accent": {
          "type": "mapping",
          "mappings": ["á=>a", "é=>e", "í=>i", "ó=>o", "ú=>u", "ç=>c"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "message_date": {
        "type": "date"
      },
      "message_body": {
        "type": "text",
        "analyzer": "standard"
      }
        "ticketId" : {
        "type" : "integer"
      }
    }
  }
}
'

# Confirmar se o índice foi criado com sucesso
if [ $? -eq 0 ]; then
  echo "Índice '$INDEX_NAME' criado com sucesso."
else
  echo "Falha ao criar o índice '$INDEX_NAME'."
fi

# Finaliza o script, não é necessário reiniciar o Elasticsearch
echo "Processo de criação de índice concluído."
