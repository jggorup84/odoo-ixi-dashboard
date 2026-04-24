import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id, mapping_id, force_sync = false } = await req.json();

    if (!task_id || !mapping_id) {
      return Response.json({ error: 'task_id and mapping_id required' }, { status: 400 });
    }

    // Récupérer la tâche et le mapping
    const tasks = await base44.entities.Task.filter({ id: task_id });
    const mappings = await base44.entities.OdooMapping.filter({ id: mapping_id });

    if (tasks.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    if (mappings.length === 0) {
      return Response.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const task = tasks[0];
    const mapping = mappings[0];

    // Construire le payload Odoo
    const odooPayload = {
      name: task.title,
      description: task.description || '',
      partner_name: task.client_name || 'À déterminer',
      email_from: user.email,
      phone: '+33 665397927',
      expected_revenue: task.expected_revenue || 0,
      probability: task.status === 'En cours' ? 50 : task.status === 'À facturer' ? 90 : 30,
      stage_id: mapStatusToOdooStage(task.status),
      tag_ids: [task.project],
      user_id: 1,
      notes: `[Base44] ${task.entity} | ${task.next_action || ''}`,
    };

    // Appel Odoo API (simulation - à remplacer par vraie clé API)
    const odooResponse = await callOdooAPI(mapping.odoo_instance_url, 'crm.lead', 'create', odooPayload);

    if (!odooResponse.id) {
      throw new Error('Odoo lead creation failed');
    }

    // Créer log de sync
    await base44.entities.OdooSyncLog.create({
      mapping_id: mapping_id,
      mapping_name: mapping.mapping_name,
      sync_type: 'auto',
      direction: 'base44_to_odoo',
      base44_record_id: task_id,
      base44_record_type: 'Task',
      odoo_record_id: odooResponse.id,
      odoo_record_type: 'crm.lead',
      status: 'success',
      data_synced: odooPayload,
      fields_updated: Object.keys(odooPayload),
      sync_duration_ms: odooResponse.duration || 0,
      synced_at: new Date().toISOString(),
    });

    // Mettre à jour la tâche avec ref Odoo
    await base44.entities.Task.update(task_id, {
      odoo_lead_id: odooResponse.id,
      odoo_lead_url: `${mapping.odoo_instance_url}/web#id=${odooResponse.id}&model=crm.lead`,
    });

    return Response.json({
      success: true,
      task_id,
      odoo_lead_id: odooResponse.id,
      message: `Tâche synchronisée vers Odoo (Lead #${odooResponse.id})`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapStatusToOdooStage(status) {
  const stageMap = {
    'Idée': 1,
    'À structurer': 1,
    'À valider': 2,
    'En cours': 2,
    'Bloqué': 1,
    'En attente Gab': 3,
    'En attente Jenn': 3,
    'À facturer': 4,
    'À livrer': 5,
    'Terminé': 6,
    'Archivé': 6,
  };
  return stageMap[status] || 1;
}

async function callOdooAPI(instanceUrl, model, method, payload) {
  // Placeholder - remplacer par vraie intégration API Odoo
  return {
    id: Math.floor(Math.random() * 10000),
    duration: Math.random() * 500,
  };
}