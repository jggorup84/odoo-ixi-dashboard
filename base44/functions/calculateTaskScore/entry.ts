import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { task_id } = await req.json();

    if (!task_id) {
      return Response.json({ error: "task_id required" }, { status: 400 });
    }

    // Récupérer la tâche
    const tasks = await base44.entities.Task.filter({ id: task_id });
    if (tasks.length === 0) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const task = tasks[0];

    // Calcul du score: urgence + impact argent + impact client + risque + blocage
    const total_score = (task.urgence_score || 0) +
                       (task.impact_money_score || 0) +
                       (task.impact_client_score || 0) +
                       (task.risk_score || 0) +
                       (task.blocage_score || 0);

    // Déterminer la priorité basée sur le score
    let priority = "P4";
    if (total_score >= 20) priority = "P0";
    else if (total_score >= 15) priority = "P1";
    else if (total_score >= 10) priority = "P2";
    else if (total_score >= 5) priority = "P3";

    // Mettre à jour la tâche
    await base44.entities.Task.update(task_id, {
      total_score,
      priority,
    });

    return Response.json({
      task_id,
      total_score,
      priority,
      components: {
        urgence: task.urgence_score || 0,
        impact_money: task.impact_money_score || 0,
        impact_client: task.impact_client_score || 0,
        risk: task.risk_score || 0,
        blocage: task.blocage_score || 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});