import React from 'react';
import './App.css';

function App() {
  // In a real app, you'd fetch this data from your API
  const alerts = [
    { alert_id: "alert-001", risk_score: 95, reason: "Suspicious circular transaction pattern detected." },
    { alert_id: "alert-002", risk_score: 88, reason: "Anomalous high-velocity transactions." },
    { alert_id: "alert-003", risk_score: 76, reason: "Transaction with a sanctioned entity." },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Aegis - Security Operations Center</h1>
      </header>
      <main className="App-main">
        <div className="dashboard-container">
          <div className="panel alert-feed">
            <h2>Real-time Alert Feed</h2>
            <ul>
              {alerts.map(alert => (
                <li key={alert.alert_id}>
                  <span className="risk-score" style={{ color: alert.risk_score > 90 ? '#ff4d4d' : '#ffc107' }}>
                    {alert.risk_score}
                  </span>
                  <div className="alert-details">
                    <strong>{alert.reason}</strong>
                    <span>ID: {alert.alert_id}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel powerbi-panel">
            <h2>System Analytics Dashboard</h2>
            <p>(Power BI Dashboard will be embedded here)</p>
            {/* 
              This is where you'll use the powerbi-client-react component.
              <PowerBIEmbed
                embedConfig={{
                  type: 'report',
                  id: 'your-report-id',
                  embedUrl: 'your-embed-url',
                  accessToken: 'your-access-token',
                  tokenType: models.TokenType.Embed,
                }}
              />
            */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;