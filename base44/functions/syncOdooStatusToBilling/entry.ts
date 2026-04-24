import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { odoo_invoice_id, mapping_id } = await req.json();

    if (!odoo_invoice_id || !mapping_id) {
      return Response.json({ error: 'odoo_invoice_id and mapping_id required' }, { status: 400 });
    }

    // Récupérer le mapping
    const mappings = await base44.entities.OdooMapping.filter({ id: mapping_id });
    if (mappings.length === 0) {
      return Response.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const mapping = mappings[0];

    // Récupérer statut depuis Odoo
    const odooInvoice = await fetchOdooInvoice(mapping.odoo_instance_url, odoo_invoice_id);

    // Mapper statut Odoo vers statut Base44
    const base44Status = mapOdooStatusToBase44(odooInvoice.state);

    // Chercher la tâche associée
    const tasks = await base44.entities.Task.filter({
      odoo_invoice_id: odoo_invoice_id,
    });

    let syncedTask = null;
    if (tasks.length > 0) {
      const task = tasks[0];
      
      // Mettre à jour le statut
      await base44.entities.Task.update(task.id, {
        status: base44Status,
        payment_status: mapOdooPaymentStatus(odooInvoice.payment_state),
      });

      syncedTask = task;
    }

    // Créer log de sync
    await base44.entities.OdooSyncLog.create({
      mapping_id: mapping_id,
      mapping_name: mapping.mapping_name,
      sync_type: 'webhook',
      direction: 'odoo_to_base44',
      odoo_record_id: odoo_invoice_id,
      odoo_record_type: 'account.invoice',
      base44_record_id: syncedTask?.id,
      base44_record_type: 'Task',
      status: 'success',
      data_synced: {
        odoo_state: odooInvoice.state,
        odoo_payment_state: odooInvoice.payment_state,
        base44_status: base44Status,
      },
      fields_updated: ['status', 'payment_status'],
      synced_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      odoo_invoice_id,
      base44_status,
      task_id: syncedTask?.id,
      message: `Statut de facturation synchronisé: ${base44Status}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapOdooStatusToBase44(odooState) {
  const statusMap = {
    'draft': 'À valider',
    'posted': 'À facturer',
    'cancel': 'Archivé',
  };
  return statusMap[odooState] || 'En cours';
}

function mapOdooPaymentStatus(paymentState) {
  const paymentMap = {
    'not_paid': 'pending',
    'in_payment': 'partial',
    'paid': 'paid',
  };
  return paymentMap[paymentState] || 'pending';
}

async function fetchOdooInvoice(instanceUrl, invoiceId) {
  // Placeholder - remplacer par vraie intégration API Odoo
  return {
    id: invoiceId,
    state: 'posted',
    payment_state: 'not_paid',
  };
}