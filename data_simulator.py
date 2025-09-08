# data_simulator.py
import json
import random
import time
from faker import Faker
from kafka import KafkaProducer

fake = Faker()

# Kafka Producer Configuration
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = 'financial_transactions'

# --- Generate a pool of accounts ---
accounts = [{"account_id": fake.uuid4(), "name": fake.name(), "country": fake.country()} for _ in range(200)]

print(f"Generated {len(accounts)} accounts. Starting transaction stream...")

def create_transaction():
    """Generates a single transaction, with a chance of being part of a laundering scheme."""
    tx_type = random.choice(['normal', 'suspicious_circle', 'suspicious_layering'])
    
    # --- Normal Transaction ---
    if tx_type == 'normal' or len(accounts) < 4:
        from_acc, to_acc = random.sample(accounts, 2)
        return {
            "tx_id": fake.uuid4(),
            "from_account": from_acc['account_id'],
            "to_account": to_acc['account_id'],
            "amount": round(random.uniform(10.0, 5000.0), 2),
            "currency": "USD",
            "timestamp": fake.iso8601(),
            "pattern": "normal"
        }
        
    # --- Suspicious: Circular Payment (A -> B -> C -> A) ---
    elif tx_type == 'suspicious_circle':
        acc_a, acc_b, acc_c = random.sample(accounts, 3)
        base_amount = round(random.uniform(20000.0, 50000.0), 2)
        # Create a list of transactions to be sent in sequence
        return [
            {"tx_id": fake.uuid4(), "from_account": acc_a['account_id'], "to_account": acc_b['account_id'], "amount": base_amount - round(random.uniform(10,100),2), "timestamp": fake.iso8601(), "pattern": "circular_1"},
            {"tx_id": fake.uuid4(), "from_account": acc_b['account_id'], "to_account": acc_c['account_id'], "amount": base_amount - round(random.uniform(200,300),2), "timestamp": fake.iso8601(), "pattern": "circular_2"},
            {"tx_id": fake.uuid4(), "from_account": acc_c['account_id'], "to_account": acc_a['account_id'], "amount": base_amount - round(random.uniform(400,500),2), "timestamp": fake.iso8601(), "pattern": "circular_3"},
        ]

# --- Main Loop to Stream Data ---
while True:
    transaction_data = create_transaction()
    if isinstance(transaction_data, list): # For multi-step suspicious patterns
        for tx in transaction_data:
            producer.send(KAFKA_TOPIC, value=tx)
            print(f"Sent SUSPICIOUS transaction: {tx['from_account'][-6:]} -> {tx['to_account'][-6:]}")
    else: # For normal, single transactions
        producer.send(KAFKA_TOPIC, value=transaction_data)
        print(f"Sent NORMAL transaction: {transaction_data['from_account'][-6:]} -> {transaction_data['to_account'][-6:]}")
        
    producer.flush()
    time.sleep(random.uniform(0.5, 3))