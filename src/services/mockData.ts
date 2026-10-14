import { HazardReport, DashboardStats } from '../types';

export const INITIAL_MOCK_REPORTS: HazardReport[] = [
  {
    id: 1,
    report_code: "CS-2025-0101",
    title: "Severe Pothole Cluster on Oakridge Main Road",
    description: "Deep asphalt crater roughly 1.5m across right in front of Oakridge Community School. Two two-wheelers skidded this morning during rush hour. Immediate patching needed before rain fills it.",
    category: "Road Damage / Pothole",
    severity: "High",
    general_location: "Oakridge District, Near School Gate #2",
    landmark: "Opposite Oakridge High School",
    latitude: 37.7749,
    longitude: -122.4194,
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    status: "Verified",
    verification_status: "Verified",
    ai_suggested_category: "Road Damage / Pothole",
    ai_suggested_priority: "High",
    ai_risk_score: 78.5,
    ai_explanation: "Category baseline risk evaluated at 58/100. High severity multiplier applied (1.2x). Detected sensitive proximity indicator: 'school', 'rush hour'. Photographic evidence attached increases credibility.",
    ai_confidence: 0.92,
    is_ai_fallback: true,
    ai_duplicate_count: 1,
    support_count: 14,
    moderator_notes: "Verified on-site by Ward Field Inspector Martinez. School administration notified.",
    resolution_notes: null,
    resolution_evidence_url: null,
    verified_by: "Officer Elena Vance (Ward Inspector)",
    verified_at: new Date(Date.now() - 172800000).toISOString(),
    resolved_at: null,
    reporter_name: "Marcus Vance",
    is_demo_data: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    status_history: [
      {
        id: 1,
        to_status: "Submitted",
        changed_by: "Marcus Vance",
        notes: "Initial submission via web application",
        timestamp: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: 2,
        from_status: "Submitted",
        to_status: "Verified",
        changed_by: "Officer Elena Vance",
        notes: "Physical inspection confirmed road surface hazard. Flagged for priority crew.",
        timestamp: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  },
  {
    id: 2,
    report_code: "CS-2025-0102",
    title: "Large Crater near Oakridge School Pedestrian Crossing",
    description: "Vehicle damaged tires on a massive depression in the road 80 meters from Oakridge School gate. Cars swerving dangerously into oncoming traffic.",
    category: "Road Damage / Pothole",
    severity: "High",
    general_location: "Oakridge District, 100m West of School Crossing",
    landmark: "Near Blue Horizon Cafe",
    latitude: 37.7758,
    longitude: -122.4208,
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=800&q=80",
    status: "Submitted",
    verification_status: "Unverified",
    ai_suggested_category: "Road Damage / Pothole",
    ai_suggested_priority: "High",
    ai_risk_score: 76.0,
    ai_explanation: "Category baseline risk for 'Road Damage / Pothole' evaluated at 58/100. Potential duplicate candidate detected within 180m radius of Oakridge Main Road report CS-2025-0101.",
    ai_confidence: 0.88,
    is_ai_fallback: true,
    ai_duplicate_count: 1,
    support_count: 6,
    moderator_notes: "AI flagged as potential duplicate of CS-2025-0101. Awaiting merge or secondary verification.",
    resolution_notes: null,
    resolution_evidence_url: null,
    verified_by: null,
    verified_at: null,
    resolved_at: null,
    reporter_name: "Anita Roy",
    is_demo_data: true,
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date(Date.now() - 21600000).toISOString(),
    status_history: [
      {
        id: 3,
        to_status: "Submitted",
        changed_by: "Anita Roy",
        notes: "Submitted from mobile device with GPS.",
        timestamp: new Date(Date.now() - 21600000).toISOString()
      }
    ]
  },
  {
    id: 3,
    report_code: "CS-2025-0103",
    title: "Submerged Underpass & Rising Waterlogged Carriageway",
    description: "Storm drain blockage caused over 1.5 feet of stagnant flood water at Riverfront Transit Underpass. Bus service redirected, compact cars stalling in middle.",
    category: "Waterlogging",
    severity: "Critical",
    general_location: "Riverfront Sector, Metro Underpass #4",
    landmark: "Adjacent to Central Metro Line Entry",
    latitude: 37.7810,
    longitude: -122.4080,
    image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    status: "In Progress",
    verification_status: "Verified",
    ai_suggested_category: "Waterlogging",
    ai_suggested_priority: "Critical",
    ai_risk_score: 93.0,
    ai_explanation: "Category baseline risk for 'Waterlogging' evaluated at 75/100. Critical multiplier (1.35x). Sensitive proximity: 'metro', 'underpass', 'transit'. Urgent public transit impact.",
    ai_confidence: 0.94,
    is_ai_fallback: true,
    ai_duplicate_count: 3,
    support_count: 28,
    moderator_notes: "High priority emergency alert dispatched to Municipal Drainage Unit.",
    resolution_notes: "Municipal de-watering high-capacity pumps operating. Water level reduced by 8 inches. Crew clearing drain grates.",
    resolution_evidence_url: null,
    verified_by: "Lead Moderator Sarah Jenkins",
    verified_at: new Date(Date.now() - 86400000).toISOString(),
    resolved_at: null,
    reporter_name: "David Kim",
    is_demo_data: true,
    created_at: new Date(Date.now() - 115200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    status_history: [
      {
        id: 4,
        to_status: "Submitted",
        changed_by: "David Kim",
        notes: "Citizen reported flooding hazard.",
        timestamp: new Date(Date.now() - 115200000).toISOString()
      },
      {
        id: 5,
        from_status: "Submitted",
        to_status: "Verified",
        changed_by: "Lead Moderator Sarah Jenkins",
        notes: "Confirmed severe transit obstruction. Expedited dispatch.",
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 6,
        from_status: "Verified",
        to_status: "In Progress",
        changed_by: "Public Works Dispatch",
        notes: "Pumping equipment deployed on site.",
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  {
    id: 4,
    report_code: "CS-2025-0104",
    title: "Uncovered Storm Manhole on Pedestrian Sidewalk",
    description: "Metal manhole cover broken or stolen. Open 6-foot vertical drop directly on pedestrian walking path used by evening joggers and families. Extremely dangerous in dim lighting.",
    category: "Open Drain / Manhole",
    severity: "Critical",
    general_location: "Greenway Boulevard, East Promenade",
    landmark: "Between 4th & 5th Avenue Trees",
    latitude: 37.7682,
    longitude: -122.4312,
    image_url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    status: "Needs Review",
    verification_status: "Unverified",
    ai_suggested_category: "Open Drain / Manhole",
    ai_suggested_priority: "Critical",
    ai_risk_score: 91.5,
    ai_explanation: "Category baseline 82/100. Critical multiplier applied. Proximity keywords: 'pedestrian', 'children', 'dim lighting'. High fall risk requires immediate barricading.",
    ai_confidence: 0.91,
    is_ai_fallback: true,
    ai_duplicate_count: 0,
    support_count: 9,
    moderator_notes: null,
    resolution_notes: null,
    resolution_evidence_url: null,
    verified_by: null,
    verified_at: null,
    resolved_at: null,
    reporter_name: "Priya Sharma",
    is_demo_data: true,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
    status_history: [
      {
        id: 7,
        to_status: "Submitted",
        changed_by: "Priya Sharma",
        notes: "Citizen flagged open manhole on pedestrian path.",
        timestamp: new Date(Date.now() - 10800000).toISOString()
      }
    ]
  },
  {
    id: 5,
    report_code: "CS-2025-0105",
    title: "Fallen Banyan Branch Snapping Overhead Electric Cables",
    description: "Heavy gale storm snapped massive oak branch which is now resting on overhead power lines. Sparks witnessed intermittently. Pedestrians warned to stay back.",
    category: "Electrical Hazard",
    severity: "Critical",
    general_location: "Pinewood Terrace, Near Substation Block C",
    landmark: "Substation Pole #88",
    latitude: 37.7895,
    longitude: -122.4150,
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    status: "Verified",
    verification_status: "Verified",
    ai_suggested_category: "Electrical Hazard",
    ai_suggested_priority: "Critical",
    ai_risk_score: 97.2,
    ai_explanation: "Category baseline 88/100. Detected critical keywords: 'sparks', 'power lines', 'electric cables', 'overhead'. Top priority triage score.",
    ai_confidence: 0.96,
    is_ai_fallback: true,
    ai_duplicate_count: 2,
    support_count: 31,
    moderator_notes: "Power Grid Safety Officer contacted immediately. Emergency crew on scene.",
    resolution_notes: null,
    resolution_evidence_url: null,
    verified_by: "City Dispatch Coordinator Miller",
    verified_at: new Date(Date.now() - 50400000).toISOString(),
    resolved_at: null,
    reporter_name: "Liam O'Connor",
    is_demo_data: true,
    created_at: new Date(Date.now() - 64800000).toISOString(),
    updated_at: new Date(Date.now() - 50400000).toISOString(),
    status_history: [
      {
        id: 8,
        to_status: "Submitted",
        changed_by: "Liam O'Connor",
        notes: "Urgent citizen submission with electrical hazard warning.",
        timestamp: new Date(Date.now() - 64800000).toISOString()
      },
      {
        id: 9,
        from_status: "Submitted",
        to_status: "Verified",
        changed_by: "City Dispatch Coordinator Miller",
        notes: "Grid isolation commanded. Field linesmen dispatched.",
        timestamp: new Date(Date.now() - 50400000).toISOString()
      }
    ]
  },
  {
    id: 6,
    report_code: "CS-2025-0106",
    title: "Broken Streetlight Array Plunging Intersection into Darkness",
    description: "Four consecutive LED street poles non-functional for past week. Intersection is pitch black at night, making zebra crossing unsafe for pedestrians crossing towards the transit hub.",
    category: "Broken Streetlight",
    severity: "Medium",
    general_location: "Market & 9th Street Crossing",
    landmark: "Near Central Library Plaza",
    latitude: 37.7770,
    longitude: -122.4160,
    image_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    status: "Resolved",
    verification_status: "Verified",
    ai_suggested_category: "Broken Streetlight",
    ai_suggested_priority: "Medium",
    ai_risk_score: 52.0,
    ai_explanation: "Category baseline 42/100. Medium severity. Proximity to transit crossing noted. Full photographic verification submitted.",
    ai_confidence: 0.89,
    is_ai_fallback: true,
    ai_duplicate_count: 0,
    support_count: 19,
    moderator_notes: "Ticket #PW-8812 logged with City Lighting Dept.",
    resolution_notes: "Municipal electrical maintenance team replaced faulty junction box and all four LED modules. Luminance verified at 45 lux.",
    resolution_evidence_url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    verified_by: "Moderator Sarah Jenkins",
    verified_at: new Date(Date.now() - 432000000).toISOString(),
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
    reporter_name: "Carlos Mendez",
    is_demo_data: true,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    status_history: [
      {
        id: 10,
        to_status: "Submitted",
        changed_by: "Carlos Mendez",
        notes: "Reported repeated lighting failure at intersection.",
        timestamp: new Date(Date.now() - 604800000).toISOString()
      },
      {
        id: 11,
        from_status: "Submitted",
        to_status: "Verified",
        changed_by: "Moderator Sarah Jenkins",
        notes: "Verified with Ward 4 Public Lighting schedule.",
        timestamp: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 12,
        from_status: "Verified",
        to_status: "Resolved",
        changed_by: "Field Inspector Thompson",
        notes: "Repair confirmed. All four fixtures operational.",
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: 7,
    report_code: "CS-2025-0107",
    title: "Overflowing Public Waste Bins Blocking Sidewalk Ramp",
    description: "Commercial waste dumped beside municipal bins. Debris spills across wheelchair accessible curb ramp, forcing pedestrians into the vehicle lane.",
    category: "Waste Accumulation",
    severity: "Low",
    general_location: "Civic Center Commercial Lane",
    landmark: "Opposite City Hall Annex",
    latitude: 37.7792,
    longitude: -122.4182,
    image_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    status: "Submitted",
    verification_status: "Unverified",
    ai_suggested_category: "Waste Accumulation",
    ai_suggested_priority: "Low",
    ai_risk_score: 41.0,
    ai_explanation: "Category baseline 36/100. Low severity. Accessible ramp blockage noted. Standard sanitation routing suggested.",
    ai_confidence: 0.87,
    is_ai_fallback: true,
    ai_duplicate_count: 0,
    support_count: 4,
    moderator_notes: null,
    resolution_notes: null,
    resolution_evidence_url: null,
    verified_by: null,
    verified_at: null,
    resolved_at: null,
    reporter_name: "Fatima Al-Mansoor",
    is_demo_data: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    status_history: [
      {
        id: 13,
        to_status: "Submitted",
        changed_by: "Fatima Al-Mansoor",
        notes: "Submitted hazard report for sanitation clearance.",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  }
];

export function getMockDashboardStats(reports: HazardReport[]): DashboardStats {
  const total = reports.length;
  const awaiting = reports.filter(r => r.status === 'Submitted' || r.status === 'Needs Review').length;
  const verified = reports.filter(r => r.status === 'Verified').length;
  const in_progress = reports.filter(r => r.status === 'In Progress').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  const category_counts: Record<string, number> = {};
  const severity_counts: Record<string, number> = {};
  const status_counts: Record<string, number> = {};

  reports.forEach(r => {
    category_counts[r.category] = (category_counts[r.category] || 0) + 1;
    severity_counts[r.severity] = (severity_counts[r.severity] || 0) + 1;
    status_counts[r.status] = (status_counts[r.status] || 0) + 1;
  });

  const recent_trend = [
    { date: "Day 1", submitted: 2, resolved: 1 },
    { date: "Day 2", submitted: 3, resolved: 0 },
    { date: "Day 3", submitted: 1, resolved: 2 },
    { date: "Day 4", submitted: 4, resolved: 1 },
    { date: "Day 5", submitted: 2, resolved: 3 },
    { date: "Day 6", submitted: 3, resolved: 2 },
    { date: "Today", submitted: total, resolved: resolved },
  ];

  return {
    total_reports: total,
    awaiting_review: awaiting,
    verified_hazards: verified,
    in_progress: in_progress,
    confirmed_resolutions: resolved,
    average_review_hours: 3.8,
    category_counts,
    severity_counts,
    status_counts,
    recent_trend,
    is_demo_mode: true
  };
}
