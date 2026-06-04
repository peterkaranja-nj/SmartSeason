const DEMO_AGENTS = [
  {
    id: 'demo-agent',
    name: 'Demo Agent',
    email: 'agent@demo.com',
    role: 'agent',
    field_count: 3,
    created_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Wanjiku',
    email: 'jane@smartseason.com',
    role: 'agent',
    field_count: 2,
    created_at: '2026-02-03T11:00:00Z'
  }
];

const DEMO_FIELDS = [
  {
    id: 1,
    name: 'North Maize Block',
    crop_type: 'Maize',
    planting_date: '2026-03-15',
    area_hectares: 12.5,
    location: 'Nakuru North',
    stage: 'growing',
    status: 'active',
    assigned_agent_id: 'demo-agent',
    agent_name: 'Demo Agent',
    updated_at: '2026-05-20T10:30:00Z',
    updates: [
      {
        id: 1,
        previous_stage: null,
        new_stage: 'planted',
        notes: 'Seeds sown after first rains. Soil moisture adequate.',
        created_at: '2026-03-15T07:00:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 2,
        previous_stage: 'planted',
        new_stage: 'growing',
        notes: 'Good germination — 85% stand count. Applied DAP fertiliser.',
        created_at: '2026-05-20T10:30:00Z',
        agent_name: 'Demo Agent'
      }
    ]
  },
  {
    id: 2,
    name: 'South Wheat Field',
    crop_type: 'Wheat',
    planting_date: '2026-02-01',
    area_hectares: 8.0,
    location: 'Eldoret South',
    stage: 'ready',
    status: 'active',
    assigned_agent_id: 'demo-agent',
    agent_name: 'Demo Agent',
    updated_at: '2026-05-28T14:15:00Z',
    updates: [
      {
        id: 3,
        previous_stage: null,
        new_stage: 'planted',
        notes: 'Planted certified seed variety K-Fahari.',
        created_at: '2026-02-01T06:30:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 4,
        previous_stage: 'planted',
        new_stage: 'growing',
        notes: 'Steady growth, irrigation applied twice. No pest pressure.',
        created_at: '2026-03-12T07:30:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 5,
        previous_stage: 'growing',
        new_stage: 'ready',
        notes: 'Grain head fully formed. Ready for harvest within 10–14 days.',
        created_at: '2026-05-28T14:15:00Z',
        agent_name: 'Demo Agent'
      }
    ]
  },
  {
    id: 3,
    name: 'East Barley Plot',
    crop_type: 'Barley',
    planting_date: '2026-04-01',
    area_hectares: 5.5,
    location: 'Kitale East',
    stage: 'planted',
    status: 'at_risk',
    assigned_agent_id: 2,
    agent_name: 'Jane Wanjiku',
    updated_at: '2026-04-03T09:00:00Z',
    updates: [
      {
        id: 6,
        previous_stage: null,
        new_stage: 'planted',
        notes: 'Planted but delayed rains. Topsoil very dry — germination at risk. Monitoring closely.',
        created_at: '2026-04-03T09:00:00Z',
        agent_name: 'Jane Wanjiku'
      }
    ]
  },
  {
    id: 4,
    name: 'West Sorghum Farm',
    crop_type: 'Sorghum',
    planting_date: '2025-11-10',
    area_hectares: 20.0,
    location: 'Kisumu West',
    stage: 'harvested',
    status: 'completed',
    assigned_agent_id: 'demo-agent',
    agent_name: 'Demo Agent',
    updated_at: '2026-03-05T16:00:00Z',
    updates: [
      {
        id: 7,
        previous_stage: null,
        new_stage: 'planted',
        notes: 'Planted Gadam variety. Soil prepared with conservation tillage.',
        created_at: '2025-11-10T07:00:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 8,
        previous_stage: 'planted',
        new_stage: 'growing',
        notes: 'Healthy stand, 90% germination. Top-dressed with CAN.',
        created_at: '2025-12-01T08:00:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 9,
        previous_stage: 'growing',
        new_stage: 'ready',
        notes: 'Grain filling complete. Heads bent over — drying in field.',
        created_at: '2026-02-10T10:00:00Z',
        agent_name: 'Demo Agent'
      },
      {
        id: 10,
        previous_stage: 'ready',
        new_stage: 'harvested',
        notes: 'Harvest complete. Final yield: 3.2 t/ha. Grain stored on-farm.',
        created_at: '2026-03-05T16:00:00Z',
        agent_name: 'Demo Agent'
      }
    ]
  },
  {
    id: 5,
    name: 'Central Bean Patch',
    crop_type: 'Beans',
    planting_date: '2026-04-20',
    area_hectares: 3.2,
    location: 'Nairobi Central',
    stage: 'growing',
    status: 'active',
    assigned_agent_id: 2,
    agent_name: 'Jane Wanjiku',
    updated_at: '2026-05-15T11:00:00Z',
    updates: [
      {
        id: 11,
        previous_stage: null,
        new_stage: 'planted',
        notes: 'Rose coco variety planted in rows. Adequate moisture at planting.',
        created_at: '2026-04-20T08:00:00Z',
        agent_name: 'Jane Wanjiku'
      },
      {
        id: 12,
        previous_stage: 'planted',
        new_stage: 'growing',
        notes: 'Flowering started. Applied foliar fertilizer. No aphid pressure.',
        created_at: '2026-05-15T11:00:00Z',
        agent_name: 'Jane Wanjiku'
      }
    ]
  }
];

const ADMIN_DASHBOARD = {
  total_fields: 5,
  stage_breakdown: { planted: 1, growing: 2, ready: 1, harvested: 1 },
  status_breakdown: { active: 3, at_risk: 1, completed: 1 },
  recent_updates: [
    {
      id: 5,
      field_id: 2,
      field_name: 'South Wheat Field',
      previous_stage: 'growing',
      new_stage: 'ready',
      notes: 'Grain head fully formed. Ready for harvest within 10–14 days.',
      created_at: '2026-05-28T14:15:00Z'
    },
    {
      id: 12,
      field_id: 5,
      field_name: 'Central Bean Patch',
      previous_stage: 'planted',
      new_stage: 'growing',
      notes: 'Flowering started. Applied foliar fertilizer.',
      created_at: '2026-05-15T11:00:00Z'
    },
    {
      id: 2,
      field_id: 1,
      field_name: 'North Maize Block',
      previous_stage: 'planted',
      new_stage: 'growing',
      notes: 'Good germination — 85% stand count. Applied DAP fertiliser.',
      created_at: '2026-05-20T10:30:00Z'
    },
    {
      id: 6,
      field_id: 3,
      field_name: 'East Barley Plot',
      previous_stage: null,
      new_stage: 'planted',
      notes: 'Planted but delayed rains. Monitoring closely.',
      created_at: '2026-04-03T09:00:00Z'
    },
    {
      id: 10,
      field_id: 4,
      field_name: 'West Sorghum Farm',
      previous_stage: 'ready',
      new_stage: 'harvested',
      notes: 'Harvest complete. Final yield: 3.2 t/ha.',
      created_at: '2026-03-05T16:00:00Z'
    }
  ],
  agent_summary: [
    { id: 'demo-agent', name: 'Demo Agent', email: 'agent@demo.com', field_count: 3 },
    { id: 2, name: 'Jane Wanjiku', email: 'jane@smartseason.com', field_count: 2 }
  ]
};

const AGENT_FIELDS = DEMO_FIELDS.filter(f => f.assigned_agent_id === 'demo-agent');

const AGENT_DASHBOARD = {
  total_fields: 3,
  stage_breakdown: { planted: 0, growing: 1, ready: 1, harvested: 1 },
  status_breakdown: { active: 2, at_risk: 0, completed: 1 },
  recent_updates: [
    {
      id: 5,
      field_id: 2,
      field_name: 'South Wheat Field',
      previous_stage: 'growing',
      new_stage: 'ready',
      notes: 'Grain head fully formed. Ready for harvest within 10–14 days.',
      created_at: '2026-05-28T14:15:00Z'
    },
    {
      id: 2,
      field_id: 1,
      field_name: 'North Maize Block',
      previous_stage: 'planted',
      new_stage: 'growing',
      notes: 'Good germination — 85% stand count. Applied DAP fertiliser.',
      created_at: '2026-05-20T10:30:00Z'
    },
    {
      id: 10,
      field_id: 4,
      field_name: 'West Sorghum Farm',
      previous_stage: 'ready',
      new_stage: 'harvested',
      notes: 'Harvest complete. Final yield: 3.2 t/ha.',
      created_at: '2026-03-05T16:00:00Z'
    }
  ],
  agent_summary: []
};

function respond(data, config) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {}
  });
}

export function mockAdapter(config) {
  const demoUser = JSON.parse(localStorage.getItem('demo_mode') || 'null');
  const isAdmin = demoUser?.role === 'admin';
  const url = config.url;
  const method = (config.method || 'get').toLowerCase();

  if (url === '/dashboard') {
    return respond(isAdmin ? ADMIN_DASHBOARD : AGENT_DASHBOARD, config);
  }

  if (url === '/fields' && method === 'get') {
    return respond(isAdmin ? DEMO_FIELDS : AGENT_FIELDS, config);
  }

  if (url === '/fields' && method === 'post') {
    const body = JSON.parse(config.data || '{}');
    return respond({ id: 99, stage: 'planted', status: 'active', ...body }, config);
  }

  const fieldMatch = url.match(/^\/fields\/([^/]+)$/);
  if (fieldMatch) {
    const id = parseInt(fieldMatch[1], 10);
    if (method === 'get') {
      const field = DEMO_FIELDS.find(f => f.id === id);
      return respond(field || {}, config);
    }
    if (method === 'put' || method === 'delete') {
      return respond({ success: true }, config);
    }
  }

  const updatesMatch = url.match(/^\/fields\/([^/]+)\/updates$/);
  if (updatesMatch && method === 'post') {
    return respond({ id: 99, message: 'Update recorded' }, config);
  }

  if (url === '/users' && method === 'get') {
    return respond(DEMO_AGENTS, config);
  }

  if (url === '/users' && method === 'post') {
    const body = JSON.parse(config.data || '{}');
    return respond({ id: 99, role: 'agent', field_count: 0, created_at: new Date().toISOString(), ...body }, config);
  }

  const userMatch = url.match(/^\/users\/([^/]+)$/);
  if (userMatch && method === 'delete') {
    return respond({ success: true }, config);
  }

  return respond({}, config);
}
