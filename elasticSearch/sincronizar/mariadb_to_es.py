import pymysql
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

# Conectar ao MariaDB e buscar dados
def fetch_data_from_mariadb():
    connection = pymysql.connect(
        host="127.0.0.1",
        user="whaticket",
        password="whaticket",
        database="whaticket"
    )
    
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    # Selecionar apenas os campos necessários
    cursor.execute("SELECT id, body, ticketId, createdAt FROM Messages")
    rows = cursor.fetchall()
    connection.close()
    return rows

# Inserir dados no Elasticsearch
def insert_data_to_elasticsearch(data):
    es = Elasticsearch("http://localhost:9200")

    # Verificar se a conexão foi bem-sucedida
    if not es.ping():
        print("Erro ao conectar ao Elasticsearch. Verifique se o serviço está em execução.")
        return

    # Preparar os dados para inserção em massa com os nomes desejados
    actions = [
        {
            "_index": "messages",
            "_id": row["id"],  # Usar o ID do banco como _id no Elasticsearch
            "_source": {
                "message_body": row["body"],     # Mapear 'body' para 'message_body'
                "ticketId": row["ticketId"],     # Manter o nome como 'ticketId'
                "message_date": row["createdAt"] # Mapear 'createdAt' para 'message_date'
            }
        }
        for row in data
    ]
    
    # Inserção em massa
    success, _ = bulk(es, actions)
    print(f"{success} registros inseridos com sucesso no Elasticsearch.")

# Pipeline principal
if __name__ == "__main__":
    print("Buscando dados do MariaDB...")
    data = fetch_data_from_mariadb()
    
    if data:
        print("Inserindo dados no Elasticsearch...")
        insert_data_to_elasticsearch(data)
    else:
        print("Nenhum dado encontrado no MariaDB.")
