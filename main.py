# main.py
from fastapi import FastAPI
from neo4j import GraphDatabase

app = FastAPI()

# --- Neo4j Connection ---
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "your_password")
driver = GraphDatabase.driver(URI, auth=AUTH)

@app.get("/api/detect-circular-transactions")
def detect_circles():
    """
    Finds paths of length 3 that start and end at the same account.
    This is a simple, non-GNN approach to get started.
    """
    query = """
    MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
    WHERE a <> b AND b <> c AND a <> c
    RETURN a.id AS start_node, b.id AS second_node, c.id AS third_node,
           r1.amount AS amount1, r2.amount AS amount2, r3.amount as amount3
    LIMIT 25
    """
    with driver.session() as session:
        result = session.run(query)
        data = [record.data() for record in result]
    return {"detected_circles": data}

# You will add more endpoints here later for other agents and for Power BI