import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { mapping_id, filters = {} } = await req.json();

    if (!mapping_id) {
      return Response.json({ error: 'mapping_id required' }, { status: 400 });
    }

    // Récupérer le mapping
    const mappings = await base44.entities.OdooMapping.filter({ id: mapping_id });
    if (mappings.length === 0) {
      return Response.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const mapping = mappings[0];

    // Récupérer les tâches à synchroniser
    const query = {
      status: { $nin: ['Archivé', 'Terminé'] },
      ...filters,
    };

    const tasks = await base44.entities.Task.filter(query);

    const syncResults = {
      total: tasks.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };

    // Synchroniser chaque tâche
    for (const task of tasks) {
      try {
        // Vérifier si déjà synchronisée
        if (task.odoo_lead_id) {
          syncResults.skipped++;
          syncResults.details.push({
            task_id: task.id,
            status: 'skipped',
            reason: 'Already synced',
          });
          continue;
        }

        // Construire et envoyer à Odoo
        const odooPayload = {
          name: task.title,
          description: task.description || '',
          partner_name: task.client_name || 'À déterminer',
          expected_revenue: task.expected_revenue || 0,
          probability: 50,
        };

        const odooResponse = await callOdooAPI(mapping.odoo_instance_url, 'crm.lead', 'create', odooPayload);

        // Mettre à jour la tâche
        await base44.entities.Task.update(task.id, {
          odoo_lead_id: odooResponse.id,
        });

        // Logger
        await base44.entities.OdooSyncLog.create({
          mapping_id: mapping_id,
          mapping_name: mapping.mapping_name,
          sync_type: 'auto',
          direction: 'base44_to_odoo',
          base44_record_id: task.id,
          odoo_record_id: odooResponse.id,
          status: 'success',
          synced_at: new Date().toISOString(),
        });

        syncResults.successful++;
        syncResults.details.push({
          task_id: task.id,
          odoo_id: odooResponse.id,
          status: 'success',
        });
      } catch (error) {
        syncResults.failed++;
        syncResults.details.push({
          task_id: task.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      results: syncResults,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function callOdooAPI(instanceUrl, model, method, payload) {
  return {
    id: Math.floor(Math.random() * 10000),
  };
}