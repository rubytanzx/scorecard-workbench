export interface ConnectorItem {
  id: string;
  name: string;
  description: string;
}

export interface MessageAction {
  label: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'typing';
  content: string;
  timestamp: string;
  actions?: MessageAction[];
  connectors?: ConnectorItem[];
}

export const MCP_CONNECTORS: ConnectorItem[] = [
  { id: 'wbg-scorecard',  name: 'WBG Scorecard',              description: 'FY25 results framework, country scorecards & outcome indicators' },
  { id: 'ifc',            name: 'IFC',                         description: 'Private sector investment data, advisory services & portfolio results' },
  { id: 'miga',           name: 'MIGA',                        description: 'Guarantee portfolio, political risk insurance & investment facilitation' },
  { id: 'ida',            name: 'IDA',                         description: 'IDA commitments, credits & grants supporting the world\'s poorest countries' },
  { id: 'wb-operations',  name: 'WB Operations Portal',        description: 'Active & pipeline project data, financial commitments & supervision ratings' },
  { id: 'wdi',            name: 'WDI',                         description: 'World Development Indicators — country-level statistical database' },
  { id: 'cpf',            name: 'Country Partnership Frameworks', description: 'CPF objectives, results matrices & completion and learning reviews' },
  { id: 'open-data',      name: 'WB Open Data',                description: 'Public datasets covering economy, population, climate & governance' },
];

export const USER_MESSAGE: Message = {
  id: 'msg-1',
  role: 'user',
  content:
    'I am an Operations Officer writing the new CPF for Mexico. Using FY25 scorecard data, give me a ranked list of 3–5 priority Outcome Areas where Mexico has the biggest gaps compared to Chile, Brazil, Colombia and Peru. For each gap, show me which projects in the current portfolio are contributing to that indicator, how much, and whether that contribution is growing or stalling. Flag where evidence is limited. I need this as a brief I can take into a decision meeting.',
  timestamp: 'Just now',
};

export const TYPING_MESSAGE: Message = {
  id: 'msg-typing',
  role: 'typing',
  content: '',
  timestamp: '',
};

export const AI_MESSAGE: Message = {
  id: 'msg-2',
  role: 'assistant',
  content:
    "I've added 3 priority gap cards to your canvas based on FY25 data.\n\nMexico's biggest gaps vs its peer group are in **Learning Poverty**, **Social Protection Coverage**, and **Financial Account Ownership**.\n\nFor each, I've shown the current portfolio contribution and whether it's growing or stalling. The education gap has limited evidence — flagged on the card.\n\nScroll right on the canvas to see all three.",
  timestamp: 'Just now',
  actions: [
    { label: 'Show me the underlying data for each gap' },
    { label: 'Compare Mexico\'s portfolio against Brazil\'s education projects' },
    { label: 'Generate a CPF brief from this analysis' },
  ],
};

export const CONNECTOR_MESSAGE: Message = {
  id: 'msg-connectors',
  role: 'assistant',
  content: 'Before we begin, select the data connections you want to include in this workspace. I\'ll use these to pull live data as we work.',
  timestamp: '',
  connectors: MCP_CONNECTORS,
  actions: [{ label: 'Confirm connectors' }],
};

export const CONNECTOR_CONFIRMED_AI_MESSAGE: Message = {
  id: 'msg-connectors-confirmed',
  role: 'assistant',
  content: 'Connected to **WBG Scorecard FY25**, **IFC**, **MIGA**, **IDA**, **WB Operations Portal**, **WDI**, **Country Partnership Frameworks**, and **WB Open Data**.\n\nWhat would you like to create?',
  timestamp: 'Just now',
};

export const GREETING_MESSAGE: Message = {
  id: 'msg-greeting',
  role: 'assistant',
  content: 'What would you like to create?',
  timestamp: '',
};

export const OUTCOME_AREAS_MESSAGE: Message = {
  id: 'msg-outcome-areas',
  role: 'assistant',
  content:
    "I've added **5 Outcome Area cards** to your canvas — one per priority gap.\n\nEach card shows Mexico's current indicator value, the gap vs the peer group, which WB projects are contributing, and whether progress is growing or stalling. Use the navigation arrows on each card to move between them or drill deeper into the data.",
  timestamp: 'Just now',
  actions: [
    { label: 'Take me deeper into Learning Poverty' },
    { label: 'Compare Protection for the Poorest against peer benchmarks' },
    { label: 'Show which projects are contributing to each area' },
  ],
};

export const DATA_CARDS_MESSAGE: Message = {
  id: 'msg-data-cards',
  role: 'assistant',
  content:
    "**Learning poverty in Mexico is driven by systemic under-investment, not data gaps.**\n\nThe 47.6% rate reflects pre-pandemic 2019 figures — post-COVID deterioration likely pushes this higher. The structural issue: the WB has **zero active operations** contributing to education outcomes in Mexico, while Brazil alone has 6 education projects covering 48 million students.\n\nI've added the underlying data cards showing social protection coverage, financial account ownership, and safety net beneficiaries — these feed directly into the Protection for the Poorest outcome area.",
  timestamp: 'Just now',
  actions: [
    { label: 'Show comparable education projects in Brazil' },
    { label: 'Flag this gap for the CPF brief' },
    { label: 'Show me the full portfolio gap for Protection of the Poorest' },
  ],
};

export const IDA_CONNECTOR_MESSAGE: Message = {
  id: 'msg-ida-connectors',
  role: 'assistant',
  content: "To map IDA's social protection impact, I'll need access to portfolio data and development indicators. Select the connections below.",
  timestamp: '',
  connectors: MCP_CONNECTORS,
  actions: [{ label: 'Confirm connectors' }],
};

export const IDA_AI_MESSAGE: Message = {
  id: 'msg-ida-2',
  role: 'assistant',
  content: "I've built 4 initial cards for your IDA social protection analysis — **Context**, **Intervention**, **Evidence**, and **Impact**. Use the nav panel on the left to jump between them.\n\nIDA holds **$4.2 billion** in active commitments across **91 countries** for social protection and labor programs — the largest SP portfolio among multilateral development banks.\n\n**Safety nets are the core delivery vehicle.** More than 234 million people benefit from IDA-supported safety net programs, with Sub-Saharan Africa and South Asia accounting for over 80% of reach.\n\nThe critical gap: coverage in **fragile and conflict-affected states (FCS)** sits at just 18% — well below the 72% average for IBRD countries.",
  timestamp: 'Just now',
  actions: [
    { label: 'Break down coverage by region' },
    { label: 'Which IDA projects have the highest beneficiary counts?' },
    { label: 'Show the gender breakdown for financial inclusion' },
  ],
};

export const IDA_DATA_CARDS_MESSAGE: Message = {
  id: 'msg-ida-data-cards',
  role: 'assistant',
  content: "**Coverage gaps are deepest in fragile states — and growing.**\n\nOnly 18% of people in FCS countries are covered by any social protection program, vs 47% in stable IDA countries. IDA's financial inclusion programs reach **350 million people and businesses**, but female account ownership lags male ownership by 9 percentage points across the IDA portfolio.\n\nI've added the financial services access and gender equity cards to your canvas.",
  timestamp: 'Just now',
  actions: [
    { label: 'Show FCS country breakdown' },
    { label: 'Map financial inclusion gaps by region' },
    { label: 'Compare IDA vs IBRD gender equity results' },
  ],
};
