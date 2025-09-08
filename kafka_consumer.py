# kafka_consumer.py
imkafka_consumer.pyport json
from kafka import KafkaConsumer
from neo4j import GraphDatabase

# --- Neo4j Connection ---
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "your_password") # Change to your Neo4j password
driver = GraphDatabase.driver(URI, auth=AUTH)

def write_to_neo4j(tx):
    """Writes a single transaction to the Neo4j database."""
    with driver.session() as session:
        session.execute_write(create_transaction_graph, tx)

def create_transaction_graph(tx_neo, tx_data):
    """Cypher query to create nodes and relationships."""
    query = (
        "MERGE (from:Account {id: $from_account}) "
        "MERGE (to:Account {id: $to_account}) "
        "CREATE (from)-[:SENT {tx_id: $tx_id, amount: $amount, timestamp: datetime($timestamp), pattern: $pattern}]->(to)"
    )
    tx_neo.run(query, **tx_data)

# --- Kafka Consumer Configuration ---
consumer = KafkaConsumer(
    'financial_transactions',
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='earliest',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

print("Consumer started. Listening for transactions...")
for message in consumer:
    transaction = message.value
    print(f"Received: {transaction}")
    try:
        write_to_neo4j(transaction)
        print(f"Successfully wrote transaction {transaction['tx_id']} to Neo4j.")
    except Exception as e:
        print(f"Error writing to Neo4j: {e}")