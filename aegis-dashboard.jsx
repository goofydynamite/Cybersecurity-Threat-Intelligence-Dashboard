import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Cpu, FileText, GitFork, Activity, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---
// This data simulates the output from your AI agents.
const mockKpiData = {
  networkRiskScore: 85,
  activeAlerts: 12,
  agents: [
    { name: 'Graph Agent', status: 'Online' },
    { name: 'Behavioral Agent', status: 'Online' },
    { name: 'Investigator LLM', status: 'Online' },
  ],
};

const mockAlerts = [
  { id: 'AZ-481', type: 'Sophisticated Layering', entity: 'Acc-789-X (Vortex Holdings)', score: 92, timestamp: '3 minutes ago' },
  { id: 'BX-231', type: 'Anomalous Velocity', entity: 'Acc-123-Y (Apex Traders)', score: 85, timestamp: '15 minutes ago' },
  { id: 'CZ-994', type: 'Sanctions List Hit', entity: 'Globex Corporation', score: 100, timestamp: '42 minutes ago' },
  { id: 'DV-102', type: 'Circular Transaction', entity: 'Acc-456-Z (Orion Imports)', score: 78, timestamp: '1 hour ago' },
  { id: 'EF-556', type: 'Rapid Asset Liquidation', entity: 'Acc-901-A (Phoenix Digital)', score: 88, timestamp: '2 hours ago' },
];

const mockBehaviorData = {
    'AZ-481': [
      { time: '00:00', activity: 400, normalRange: [100, 500] }, { time: '03:00', activity: 300, normalRange: [100, 500] },
      { time: '06:00', activity: 15000, normalRange: [200, 600] }, { time: '09:00', activity: 700, normalRange: [400, 800] },
      { time: '12:00', activity: 900, normalRange: [500, 1000] }, { time: '15:00', activity: 800, normalRange: [500, 1000] },
      { time: '18:00', activity: 22000, normalRange: [400, 900] }, { time: '21:00', activity: 600, normalRange: [300, 800] },
    ],
    'BX-231': [
      { time: '00:00', activity: 200, normalRange: [50, 250] }, { time: '03:00', activity: 8000, normalRange: [50, 300] },
      { time: '06:00', activity: 300, normalRange: [100, 400] }, { time: '09:00', activity: 450, normalRange: [200, 500] },
      { time: '12:00', activity: 500, normalRange: [250, 600] }, { time: '15:00', activity: 9500, normalRange: [250, 600] },
      { time: '18:00', activity: 300, normalRange: [200, 550] }, { time: '21:00', activity: 200, normalRange: [150, 400] },
    ],
    'CZ-994': [
        { time: '00:00', activity: 100, normalRange: [0, 200] }, { time: '03:00', activity: 50, normalRange: [0, 200] },
        { time: '06:00', activity: 150, normalRange: [0, 200] }, { time: '09:00', activity: 50000, normalRange: [0, 300] },
        { time: '12:00', activity: 100, normalRange: [0, 300] }, { time: '15:00', activity: 200, normalRange: [0, 300] },
        { time: '18:00', activity: 150, normalRange: [0, 250] }, { time: '21:00', activity: 100, normalRange: [0, 250] },
    ],
    'DV-102': [
        { time: '00:00', activity: 2000, normalRange: [1000, 3000] }, { time: '03:00', activity: 1500, normalRange: [1000, 3000] },
        { time: '06:00', activity: 2500, normalRange: [1000, 3000] }, { time: '09:00', activity: 2800, normalRange: [1000, 3000] },
        { time: '12:00', activity: 10000, normalRange: [1000, 4000] },
        { time: '12:05', activity: 10000, normalRange: [1000, 4000] },
        { time: '18:00', activity: 2200, normalRange: [1000, 3000] }, { time: '21:00', activity: 1800, normalRange: [1000, 3000] },
    ],
    'EF-556': [
        { time: '00:00', activity: 500, normalRange: [200, 1000] }, { time: '03:00', activity: 800, normalRange: [200, 1000] },
        { time: '06:00', activity: 600, normalRange: [200, 1000] }, { time: '09:00', activity: 900, normalRange: [200, 1000] },
        { time: '12:00', activity: 75000, normalRange: [500, 2000] },
        { time: '15:00', activity: 700, normalRange: [500, 2000] }, { time: '18:00', activity: 1200, normalRange: [500, 2000] },
        { time: '21:00', activity: 1000, normalRange: [500, 2000] },
    ],
};

const mockDossierData = {
    'AZ-481': {
        title: 'AEGIS Dossier: Alert AZ-481',
        summary: "High-confidence alert for a sophisticated layering scheme involving account Acc-789-X (Vortex Holdings). The account received multiple structured deposits from three intermediary accounts, which were themselves funded by over 50 disparate sources within a 2-hour window. This pattern is a strong indicator of an attempt to obfuscate the origin of funds.",
        evidence: [
            'GNN identified a "star-burst" consolidation pattern, indicative of fund funneling.',
            'Behavioral agent flagged transaction velocity as 97% above the established baseline for this entity type.',
            'Investigator LLM cross-referenced sources and found no legitimate business purpose for the rapid, structured inflows.'
        ]
    },
    'BX-231': {
        title: 'AEGIS Dossier: Alert BX-231',
        summary: "Alert triggered for anomalous transaction velocity on account Acc-123-Y (Apex Traders). The account initiated rapid, high-volume outgoing transfers to multiple offshore accounts immediately after receiving a large, single deposit. This deviates significantly from the account's 180-day behavioral profile.",
        evidence: [
            'Transaction velocity exceeded the 99th percentile of normal behavior.',
            'RL model flagged a pattern deviation score of 0.92.',
            'The receiving accounts are located in high-risk jurisdictions with weak AML regulations.'
        ]
    },
    'CZ-994': {
        title: 'AEGIS Dossier: Alert CZ-994',
        summary: "CRITICAL ALERT: Direct transaction detected with an entity on the OFAC sanctions list. Account held by Globex Corporation sent funds to a known prohibited counterparty. This constitutes a severe compliance breach.",
        evidence: [
            'RAG Agent matched the recipient entity against the latest consolidated sanctions list.',
            'Transaction amount of $50,000 USD exceeds reporting thresholds.',
            'Immediate regulatory reporting is required.'
        ]
    },
    'DV-102': {
        title: 'AEGIS Dossier: Alert DV-102',
        summary: "GNN Agent has detected a high-probability circular transaction pattern originating from Acc-456-Z (Orion Imports). Funds were moved through a 4-step chain of accounts, returning to an account controlled by the originator within minutes. This is a classic money laundering typology.",
        evidence: [
            'Graph analysis revealed a closed-loop path with a cycle length of 4.',
            'Total transaction time for the loop was under 5 minutes, indicating automated structuring.',
            'No clear economic purpose for the series of transactions was identified.'
        ]
    },
    'EF-556': {
        title: 'AEGIS Dossier: Alert EF-556',
        summary: "Behavioral agent flagged a rapid asset liquidation event in account Acc-901-A (Phoenix Digital). The account, which typically maintains a stable balance, sold off 95% of its digital asset holdings and transferred the fiat equivalent to an external, newly-created account. This behavior is anomalous and can be a precursor to absconding with funds.",
        evidence: [
            'Account balance dropped from ~$80,000 to under $4,000 in a single transaction.',
            'The liquidation event is a 3-sigma deviation from normal volatility for this account.',
            'The beneficiary account has no prior transaction history.'
        ]
    },
};

// --- Reusable Components ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-[#1F2937] border border-[#4B5563] rounded-xl shadow-lg ${className}`}>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;
    return (
      <div className="p-3 bg-[#111827] border border-[#4B5563] rounded-lg shadow-xl text-sm">
        <p className="font-bold text-[#E5E7EB]">{`Time: ${label}`}</p>
        <p className="text-red-400">{`Anomalous Activity: $${(data.activity || 0).toLocaleString()}`}</p>
        <p className="text-[#9CA3AF]">{`Normal Range: $${(data.normalRange[0] || 0).toLocaleString()} - $${(data.normalRange[1] || 0).toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

// --- SVG Graph Component (100% Stable, No Physics, Pure SVG & CSS) ---
const GraphVisualization = ({ alertId }) => {
    const getNodeColor = (risk) => {
        switch(risk) {
            case 'critical': return '#ef4444';
            case 'high': return '#f87171';
            case 'medium': return '#facc15';
            default: return '#6b7280';
        }
    };
    
    const commonDefs = (
        <defs>
            <style>{`
                .link-pulse { stroke-dasharray: 4; animation: dash 1.5s linear infinite; }
                @keyframes dash { to { stroke-dashoffset: -12; } }
                .node-text {
                    font-size: 10px;
                    fill: #E5E7EB;
                    pointer-events: none;
                    text-anchor: middle;
                    font-weight: 500;
                    paint-order: stroke;
                    stroke: #111827;
                    stroke-width: 3px;
                    stroke-linecap: butt;
                    stroke-linejoin: miter;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .node-group:hover .node-text { opacity: 1; }
            `}</style>
             <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    );

    const renderGraphPattern = () => {
        const Node = ({ x, y, risk, label }) => (
            <g transform={`translate(${x}, ${y})`} className="cursor-pointer group node-group">
                <circle r={risk === 'high' || risk === 'critical' ? 12 : 9} fill={getNodeColor(risk)} className="transition-all duration-300 group-hover:brightness-125" style={{ filter: `url(#glow)` }} />
                <text dy="25" className="node-text">{label}</text>
            </g>
        );
        const Link = ({ x1, y1, x2, y2 }) => <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-gray-600 stroke-[1.5px] group-hover:stroke-cyan-400 group-hover:stroke-2 group-hover:link-pulse" />;
        
        const renderLinksAndNodes = (links, nodes) => (
             <g>
                {links.map((link, i) => (
                    <g key={`lg-${i}`} className="group">
                        {link}
                    </g>
                ))}
                {nodes.map((node, i) => <g key={`ng-${i}`}>{node}</g>)}
            </g>
        );
        
        switch (alertId) {
            case 'AZ-481': { // Layering
                const sources = Array.from({length: 10}, (_,i) => ({x: 50 + (i%5)*40, y: i < 5 ? 50 : 350}));
                const intermediaries = [{x: 150, y: 125}, {x: 150, y: 275}, {x: 350, y: 200}];
                const target = {x: 450, y: 200};
                
                const links = [
                    ...sources.slice(0, 3).map((s, i) => <Link key={`l-s1-${i}`} x1={s.x} y1={s.y} x2={intermediaries[0].x} y2={intermediaries[0].y} />),
                    ...sources.slice(3, 6).map((s, i) => <Link key={`l-s2-${i}`} x1={s.x} y1={s.y} x2={intermediaries[2].x} y2={intermediaries[2].y} />),
                    ...sources.slice(6, 10).map((s, i) => <Link key={`l-s3-${i}`} x1={s.x} y1={s.y} x2={intermediaries[1].x} y2={intermediaries[1].y} />),
                    ...intermediaries.map((iNode, i) => <Link key={`l-i-${i}`} x1={iNode.x} y1={iNode.y} x2={target.x} y2={target.y} />),
                ];
                const nodes = [
                    <Node key="n-t" {...target} risk="high" label="Acc-789-X" />,
                    ...intermediaries.map((n, i) => <Node key={`n-i-${i}`} {...n} risk="medium" label={`Int-${i+1}`} />),
                    ...sources.map((n, i) => <Node key={`n-s-${i}`} {...n} risk="low" label={`Src-${i+1}`} />),
                ];
                return renderLinksAndNodes(links, nodes);
            }
            case 'DV-102': { // Circular
                const r = 100;
                const points = Array.from({length: 4}, (_,i) => ({x: 250 + r * Math.cos(i*2*Math.PI/4), y: 200 + r * Math.sin(i*2*Math.PI/4)}));
                const links = points.map((p, i) => <Link key={`l-c-${i}`} x1={p.x} y1={p.y} x2={points[(i+1)%4].x} y2={points[(i+1)%4].y} />);
                const nodes = [
                    <Node key="n-c-0" {...points[0]} risk="high" label="Acc-456-Z" />,
                    <Node key="n-c-1" {...points[1]} risk="medium" label="Hop-1" />,
                    <Node key="n-c-2" {...points[2]} risk="medium" label="Hop-2" />,
                    <Node key="n-c-3" {...points[3]} risk="medium" label="Hop-3" />,
                ];
                return renderLinksAndNodes(links, nodes);
            }
            case 'CZ-994': { // Sanctions
                 const links = [<Link key="l-sn-1" x1={150} y1={200} x2={350} y2={200} />];
                 const nodes = [
                    <Node key="n-sn-1" x={150} y={200} risk="high" label="Globex Corp" />,
                    <Node key="n-sn-2" x={350} y={200} risk="critical" label="Sanctioned Entity" />
                 ];
                 return renderLinksAndNodes(links, nodes);
            }
            default: { // Default Velocity Pattern
                 const r = 120;
                 const points = Array.from({length: 6}, (_,i) => ({x: 380 + r * Math.cos(i*2*Math.PI/6), y: 200 + r * Math.sin(i*2*Math.PI/6)}));
                 const links = points.map((p, i) => <Link key={`l-d-${i}`} x1={120} y1={200} x2={p.x} y2={p.y} />);
                 const nodes = [
                    <Node key="n-d-p" x={120} y={200} risk="high" label="Primary Entity" />,
                    ...points.map((p, i) => <Node key={`n-d-${i}`} {...p} risk="medium" label={`Cpty-${i+1}`} />)
                 ];
                 return renderLinksAndNodes(links, nodes);
            }
        }
    };

    return (
        <div className="h-full w-full bg-[#111827]/50 rounded-b-xl">
            <svg width="100%" height="100%" viewBox="0 0 500 400">
                {commonDefs}
                {renderGraphPattern()}
            </svg>
        </div>
    );
};


// --- Dashboard Components ---
const KPIBar = () => {
  const score = mockKpiData.networkRiskScore;
  const circumference = 2 * Math.PI * 15.9155;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score > 80) return 'text-red-500';
    if (score > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Network Risk Score */}
        <div className="flex items-center p-4 bg-[#111827] rounded-lg">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-current text-[#4B5563]" strokeWidth="2" />
              <circle cx="18" cy="18" r="15.9155" fill="none" className={`stroke-current ${getScoreColor()}`} strokeWidth="2.5" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getScoreColor()}`}>
              {score}
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-[#E5E7EB]">Network Risk Score</h3>
            <p className={`text-sm font-bold ${getScoreColor()}`}>
              {score > 80 ? 'CRITICAL' : (score > 60 ? 'ELEVATED' : 'NOMINAL')}
            </p>
          </div>
        </div>
        
        {/* Active Alerts */}
        <div className="flex items-center p-4 bg-[#111827] rounded-lg">
          <div className="p-3 bg-cyan-500/10 rounded-full">
             <ShieldAlert className="w-8 h-8 text-[#22d3ee]" />
          </div>
          <div className="ml-4">
            <h3 className="text-3xl font-bold text-[#E5E7EB]">{mockKpiData.activeAlerts}</h3>
            <p className="text-sm text-[#9CA3AF]">Active High-Priority Alerts</p>
          </div>
        </div>

        {/* Agent Status */}
        <div className="flex flex-col justify-center p-4 bg-[#111827] rounded-lg">
          <h3 className="font-semibold mb-2 text-[#E5E7EB]">Agent Status</h3>
          <div className="flex flex-col space-y-1">
            {mockKpiData.agents.map(agent => (
                <div key={agent.name} className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[#9CA3AF]">{agent.name}:</span>
                    <span className="text-green-400 font-medium">{agent.status}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const AlertQueue = ({ onSelectAlert, selectedAlertId }) => {
  const getScoreColor = (score) => {
    if (score >= 95) return 'border-red-500';
    if (score >= 80) return 'border-yellow-400';
    return 'border-yellow-600';
  };

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-xl font-bold p-4 border-b border-[#4B5563] text-[#E5E7EB]">Alert Triage Queue</h2>
      <div className="flex-grow overflow-y-auto p-2">
        <div className="space-y-2">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert.id)}
              className={`p-3 rounded-lg cursor-pointer border-l-4 transition-all duration-200 ease-in-out ${
                selectedAlertId === alert.id 
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                  : `bg-[#111827] ${getScoreColor(alert.score)} hover:bg-[#4B5563]/50`
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#E5E7EB]">{alert.type}</p>
                  <p className="text-sm text-[#9CA3AF]">{alert.entity}</p>
                </div>
                <span className={`text-xl font-bold ${getScoreColor(alert.score).replace('border-', 'text-')}`}>{alert.score}</span>
              </div>
              <div className="flex items-center text-xs text-[#9CA3AF] mt-2">
                <Clock size={12} className="mr-1.5" />
                <span>{alert.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const InvestigationWorkspace = ({ alertId }) => {
  const [activeTab, setActiveTab] = useState('dossier');
  
  const chartData = useMemo(() => {
    const behavior = mockBehaviorData[alertId];
    if (!behavior) return [];
    return behavior.map(d => ({
        ...d,
        normal_lower: d.normalRange[0],
        normal_range_height: d.normalRange[1] - d.normalRange[0],
    }));
  }, [alertId]);

  const dossier = useMemo(() => mockDossierData[alertId], [alertId]);

  useEffect(() => {
    setActiveTab('dossier');
  }, [alertId]);

  const TabButton = ({ id, icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${ activeTab === id ? 'bg-[#22d3ee] text-gray-900' : 'text-[#9CA3AF] hover:bg-[#4B5563]/50' }`} >
      {React.createElement(icon, { size: 16 })}
      <span>{label}</span>
    </button>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'graph':
        return <GraphVisualization alertId={alertId} />;
      case 'behavior':
        return (
          <div className="h-full p-4 bg-[#111827]/50 rounded-b-xl">
             <h3 className="font-bold text-lg mb-4 text-[#E5E7EB]">Behavioral Analysis: Transaction Volume (USD)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value/1000)}k`}/>
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="normal_lower" stackId="1" stroke={false} fill="transparent" />
                    <Area type="monotone" dataKey="normal_range_height" stackId="1" stroke={false} fill="#4B5563" fillOpacity={0.6} name="Normal Range"/>
                    <Area type="monotone" dataKey="activity" stroke="#f87171" fill="url(#colorActivity)" strokeWidth={2} name="Anomalous Activity" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      case 'dossier':
      default:
        return (
          <div className="p-6 space-y-4 overflow-y-auto h-full bg-[#111827]/50 rounded-b-xl">
            <h3 className="font-bold text-lg text-cyan-400">{dossier.title}</h3>
            <p className="text-[#9CA3AF] leading-relaxed">{dossier.summary}</p>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#4B5563]">
              <h4 className="font-semibold text-[#E5E7EB] mb-2">Key Evidence & Triggers:</h4>
              <ul className="list-disc list-inside text-[#9CA3AF] space-y-2 text-sm">
                {dossier.evidence.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex p-2 bg-[#1F2937] border-b border-[#4B5563] space-x-2 flex-shrink-0">
        <TabButton id="dossier" icon={FileText} label="Aegis Dossier" />
        <TabButton id="graph" icon={GitFork} label="Graph Visualization" />
        <TabButton id="behavior" icon={Activity} label="Behavioral Analysis" />
      </div>
      <div className="flex-grow min-h-0">{renderContent()}</div>
    </Card>
  );
};

// --- Main App Component ---
export default function App() {
  const [selectedAlertId, setSelectedAlertId] = useState('AZ-481');
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectAlert = (alertId) => {
    if (alertId === selectedAlertId) return;
    setIsLoading(true);
    setTimeout(() => {
        setSelectedAlertId(alertId);
        setIsLoading(false);
    }, 300); // Simulate network delay for a smooth transition
  };
  
  return (
    <div className="bg-[#111827] min-h-screen text-[#E5E7EB] font-sans p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-[#E5E7EB] tracking-wider">
              <span className="text-[#22d3ee]">AEGIS</span>
              <span className="text-[#9CA3AF]"> // Autonomous Detection Network</span>
            </h1>
        </div>
        <div className="text-right">
            <p className="font-medium text-[#E5E7EB]">{dateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-[#9CA3AF]">{new Date().toLocaleTimeString()} - Bengaluru, Karnataka</p>
        </div>
      </header>
      
      <main className={`flex flex-col gap-6 transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}>
        <KPIBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{height: 'calc(100vh - 200px)'}}>
          <div className="lg:col-span-1 h-full">
            <AlertQueue selectedAlertId={selectedAlertId} onSelectAlert={handleSelectAlert} />
          </div>
          <div className="lg:col-span-2 h-full">
            <InvestigationWorkspace alertId={selectedAlertId} />
          </div>
        </div>
      </main>
    </div>
  );
}

