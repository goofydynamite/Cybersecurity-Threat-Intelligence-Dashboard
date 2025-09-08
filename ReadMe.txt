# Aegis - Autonomous Financial Crime & Anomaly Detection Network

![Aegis Architecture](docs/architecture_diagram.png) <!-- You will create this diagram -->

Aegis is a real-time, multi-agent AI system designed to detect and investigate sophisticated financial crimes like money laundering and market manipulation. It moves beyond traditional rule-based systems by using a network of collaborative AI agents to analyze transaction graphs, learn behavioral baselines, and generate human-readable intelligence reports.

## Features

- **Real-time Monitoring:** Ingests and processes financial transactions via a Kafka stream.
- **Graph-Based Detection:** Uses a Neo4j graph database and Graph Neural Networks (GNNs) to identify suspicious network topologies (e.g., layering, mule accounts).
- **Adaptive Behavioral Analysis:** A Reinforcement Learning (RL) agent learns normal transaction patterns and flags significant deviations in real-time.
- **AI-Powered Investigations:** An LLM-based Investigator Agent (using RAG) automatically generates detailed "dossiers" on high-risk alerts, pulling data from internal agents and external sources.
- **Interactive SOC Dashboard:** A sleek frontend built with React, embedding a dynamic Power BI dashboard for deep analysis and visualization.

## Tech Stack

- **Backend:** Python (FastAPI), Kafka, Neo4j, Redis
- **AI/ML:** PyTorch, PyG (for GNNs), Stable-Baselines3 (for RL), LangChain, Transformers (for LLMs)
- **Frontend:** React, Nivo (for charts)
- **Visualization:** Power BI
- **DevOps:** Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Node.js and npm
- A Power BI Desktop account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YourUsername/aegis-financial-crime-detection.git
    cd aegis-financial-crime-detection
    ```

2.  **Start the infrastructure (Kafka, Neo4j):**
    ```bash
    docker-compose up -d
    ```

3.  **Set up the Python environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

4.  **Run the data pipeline and API:**
    - Start the Kafka consumer to populate Neo4j:
      ```bash
      python src/data_processing/kafka_consumer.py
      ```
    - In a new terminal, start the FastAPI backend:
      ```bash
      uvicorn src.api.main:app --reload
      ```

5.  **Run the data simulator:**
    - In another terminal, start streaming simulated data:
      ```bash
      python scripts/data_simulator.py
      ```

6.  **Set up the frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

The application should now be running!
- API Docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:3000`
- Neo4j Browser: `http://localhost:7474`