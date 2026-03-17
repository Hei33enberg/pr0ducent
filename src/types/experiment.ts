export type AccountModel = "own" | "broker";

export type RunStatus = "queued" | "running" | "completed" | "error";

export interface EditorialScores {
  uiQuality: number;       // 0-100
  backendLogic: number;     // 0-100
  speed: number;            // 0-100
  easeOfEditing: number;    // 0-100
}

export interface ExperimentRun {
  toolId: string;
  status: RunStatus;
  startedAt: number;
  completedAt?: number;
  timeToFirstPrototype?: number; // seconds
  description: string;
  scores: EditorialScores;
  pros: string[];
  cons: string[];
}

export interface Experiment {
  id: string;
  prompt: string;
  selectedTools: string[];
  accountModel: AccountModel;
  createdAt: number;
  runs: ExperimentRun[];
  useCaseTags?: string[];
  isPublic?: boolean;
}
