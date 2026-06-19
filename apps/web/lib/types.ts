export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Finding = {
  id: string;
  domain: string;
  severity: Severity;
  title: string;
  status: string;
  agent: string;
  evidence?: {
    artifact: string;
    location?: string;
    quote?: string;
  }[];
};

export type Event = {
  id: string;
  ts: string;
  type: string;
  from: string;
  message: string;
  severity?: Severity;
  structured?: Record<string, unknown>;
};

export type Agent = {
  name: string;
  status: string;
  role: string;
};

export type Remediation = {
  id: string;
  title: string;
  owner: string;
  severity: string;
  status: string;
};

export type Approval = {
  domain: string;
  status: string;
};

export type Review = {
  id: string;
  title: string;
  description?: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  decision: string;
  bandRoom?: {
    id: string | null;
    name: string | null;
    status: string;
  };
  agents: Agent[];
  findings: Finding[];
  events: Event[];
  remediations: Remediation[];
  approvals: Approval[];
  humanDecision?: {
    decision: string;
    reason: string;
  };
};

export type DossierResponse = {
  review_id: string;
  format: "markdown";
  content: string;
};
