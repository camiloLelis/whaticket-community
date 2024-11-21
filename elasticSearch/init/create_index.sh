
// só rodar direto no terminal

curl -X PUT "http://localhost:9200/messages?pretty" -H 'Content-Type: application/json' -d'
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
      },
      "ticketId": {
        "type": "integer"
      }
    }
  }
}'
