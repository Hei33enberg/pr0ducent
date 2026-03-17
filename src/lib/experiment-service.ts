import { supabase } from "@/integrations/supabase/client";
import type { Experiment, ExperimentRun, EditorialScores, AccountModel } from "@/types/experiment";

export async function createExperimentInDb(
  userId: string,
  prompt: string,
  selectedTools: string[],
  accountModel: AccountModel,
  runs: ExperimentRun[],
  useCaseTags?: string[]
): Promise<string | null> {
  const { data: exp, error: expErr } = await supabase
    .from("experiments")
    .insert({
      user_id: userId,
      prompt,
      account_model: accountModel,
      selected_tools: selectedTools,
      use_case_tags: useCaseTags || [],
    } as any)
    .select("id")
    .single();

  if (expErr || !exp) {
    console.error("Error creating experiment:", expErr);
    return null;
  }

  const runRows = runs.map((r) => ({
    experiment_id: exp.id,
    tool_id: r.toolId,
    status: r.status,
    started_at: new Date(r.startedAt).toISOString(),
    time_to_prototype: r.timeToFirstPrototype ?? null,
    description: r.description,
    scores: r.scores as any,
    pros: r.pros as any,
    cons: r.cons as any,
  }));

  const { error: runsErr } = await supabase
    .from("experiment_runs")
    .insert(runRows);

  if (runsErr) {
    console.error("Error creating runs:", runsErr);
  }

  return exp.id;
}

export async function loadExperimentsFromDb(userId: string): Promise<Experiment[]> {
  const { data: exps, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !exps) return [];

  const expIds = exps.map((e) => e.id);
  const { data: allRuns } = await supabase
    .from("experiment_runs")
    .select("*")
    .in("experiment_id", expIds);

  const runsMap = new Map<string, ExperimentRun[]>();
  (allRuns || []).forEach((r) => {
    const run: ExperimentRun = {
      toolId: r.tool_id,
      status: r.status as ExperimentRun["status"],
      startedAt: new Date(r.started_at).getTime(),
      completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
      timeToFirstPrototype: r.time_to_prototype ?? undefined,
      description: r.description,
      scores: r.scores as unknown as EditorialScores,
      pros: r.pros as unknown as string[],
      cons: r.cons as unknown as string[],
    };
    const list = runsMap.get(r.experiment_id) || [];
    list.push(run);
    runsMap.set(r.experiment_id, list);
  });

  return exps.map((e: any) => ({
    id: e.id,
    prompt: e.prompt,
    selectedTools: e.selected_tools,
    accountModel: e.account_model as AccountModel,
    createdAt: new Date(e.created_at).getTime(),
    runs: runsMap.get(e.id) || [],
    useCaseTags: e.use_case_tags || [],
    isPublic: e.is_public ?? false,
  }));
}

export async function updateRunStatusInDb(
  experimentId: string,
  toolId: string,
  status: string,
  completedAt?: number
) {
  const update: Record<string, any> = { status };
  if (completedAt) update.completed_at = new Date(completedAt).toISOString();

  await supabase
    .from("experiment_runs")
    .update(update)
    .eq("experiment_id", experimentId)
    .eq("tool_id", toolId);
}

export async function logReferralClick(userId: string, experimentId: string, toolId: string) {
  await supabase.from("referral_clicks").insert({
    user_id: userId,
    experiment_id: experimentId,
    tool_id: toolId,
  });
}

export async function deleteExperimentFromDb(experimentId: string) {
  await supabase.from("experiments").delete().eq("id", experimentId);
}
