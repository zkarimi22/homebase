// ── Identity ──
export const profile = {
  user_id: "usr_001",
  name: "Alex Morgan",
  email: "alex@example.com",
  household_id: "hh_001",
  role: "owner",
};

// ── Property ──
export const property = {
  property_id: "prop_001",
  household_id: "hh_001",
  address: "742 Evergreen Terrace",
  city: "Portland",
  state: "OR",
  zip: "97201",
  type: "Single Family",
  year_built: 2004,
  sqft: 2_450,
  bedrooms: 4,
  bathrooms: 2.5,
  estimated_value: 685_000,
  purchase_price: 520_000,
  purchase_date: "2019-06-15",
};

// ── Documents ──
export const documents = [
  {
    id: "doc_001",
    name: "Mortgage Agreement",
    category: "mortgage",
    uploaded_at: "2024-01-10",
    size_kb: 2_400,
    type: "pdf",
  },
  {
    id: "doc_002",
    name: "Homeowners Insurance Policy",
    category: "insurance",
    uploaded_at: "2024-02-14",
    size_kb: 1_800,
    type: "pdf",
  },
  {
    id: "doc_003",
    name: "2024 Property Tax Statement",
    category: "tax",
    uploaded_at: "2024-03-01",
    size_kb: 450,
    type: "pdf",
  },
  {
    id: "doc_004",
    name: "Roof Repair Receipt",
    category: "receipt",
    uploaded_at: "2024-05-22",
    size_kb: 320,
    type: "pdf",
  },
  {
    id: "doc_005",
    name: "Home Inspection Report",
    category: "inspection",
    uploaded_at: "2019-05-30",
    size_kb: 5_100,
    type: "pdf",
  },
  {
    id: "doc_006",
    name: "Deed of Trust",
    category: "mortgage",
    uploaded_at: "2019-06-15",
    size_kb: 1_200,
    type: "pdf",
  },
  {
    id: "doc_007",
    name: "Appliance Warranty — HVAC",
    category: "warranty",
    uploaded_at: "2023-09-10",
    size_kb: 680,
    type: "pdf",
  },
  {
    id: "doc_008",
    name: "Flood Insurance Certificate",
    category: "insurance",
    uploaded_at: "2024-01-20",
    size_kb: 940,
    type: "pdf",
  },
];

// ── Finances ──
export const financeSummary = {
  home_value: 685_000,
  equity: 310_000,
  mortgage_balance: 375_000,
  monthly_payment: 2_340,
  interest_rate: 4.125,
  loan_term_years: 30,
  loan_start: "2019-06-15",
  property_tax_annual: 8_220,
  insurance_annual: 1_860,
  hoa_monthly: 0,
};

export const obligations = [
  { name: "Mortgage", amount: 2_340, due_day: 1, frequency: "monthly" },
  { name: "Property Tax", amount: 685, due_day: 15, frequency: "monthly" },
  { name: "Homeowners Insurance", amount: 155, due_day: 1, frequency: "monthly" },
];

// ── Projects ──
export const projects = [
  {
    id: "prj_001",
    title: "Kitchen Backsplash",
    status: "completed",
    priority: "medium",
    started_at: "2024-08-01",
    completed_at: "2024-08-18",
    budget: 2_200,
    spent: 1_950,
    description: "Install subway tile backsplash behind range and sink.",
  },
  {
    id: "prj_002",
    title: "Fence Replacement — West Side",
    status: "in_progress",
    priority: "high",
    started_at: "2025-03-10",
    completed_at: null,
    budget: 4_800,
    spent: 1_200,
    description: "Replace 60 ft cedar fence panels along the western property line.",
  },
  {
    id: "prj_003",
    title: "Bathroom Fan Upgrade",
    status: "planned",
    priority: "low",
    started_at: null,
    completed_at: null,
    budget: 350,
    spent: 0,
    description: "Replace noisy exhaust fan in upstairs bathroom with a quiet-rated unit.",
  },
  {
    id: "prj_004",
    title: "Exterior Paint Touch-Up",
    status: "planned",
    priority: "medium",
    started_at: null,
    completed_at: null,
    budget: 1_500,
    spent: 0,
    description: "Repaint trim and fascia boards on the south-facing side of the house.",
  },
  {
    id: "prj_005",
    title: "Smart Thermostat Install",
    status: "completed",
    priority: "low",
    started_at: "2024-11-05",
    completed_at: "2024-11-05",
    budget: 280,
    spent: 249,
    description: "Install Ecobee smart thermostat and connect to HVAC system.",
  },
];

// ── Neighborhood ──
export const neighborhoodFeed = [
  {
    id: "nf_001",
    type: "garbage",
    title: "Garbage Collection",
    body: "Pickup every Tuesday morning. Place bins curbside by 7 AM.",
    date: "2025-04-08",
  },
  {
    id: "nf_002",
    type: "recycling",
    title: "Recycling Pickup",
    body: "Bi-weekly recycling collection. Next pickup this Friday.",
    date: "2025-04-11",
  },
  {
    id: "nf_003",
    type: "alert",
    title: "Street Resurfacing Notice",
    body: "Evergreen Terrace will be resurfaced April 21–23. Expect detours.",
    date: "2025-04-21",
  },
  {
    id: "nf_004",
    type: "community",
    title: "Spring Block Party",
    body: "Annual neighborhood block party on May 3rd at Riverside Park, 2–6 PM.",
    date: "2025-05-03",
  },
  {
    id: "nf_005",
    type: "alert",
    title: "Water Main Maintenance",
    body: "Scheduled water main flushing on April 15, 10 PM – 2 AM. Brief low pressure expected.",
    date: "2025-04-15",
  },
  {
    id: "nf_006",
    type: "community",
    title: "Free Tree Planting Program",
    body: "The city is offering free street trees to homeowners. Apply by April 30.",
    date: "2025-04-30",
  },
];
