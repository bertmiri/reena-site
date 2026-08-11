export const CLIENT_STATUSES = [
  "new",
  "documents_requested",
  "documents_received",
  "under_review",
  "submitted",
  "completed",
  "archived",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const STATUS_LABELS: Record<ClientStatus, string> = {
  new: "New",
  documents_requested: "Documents Requested",
  documents_received: "Documents Received",
  under_review: "Under Review",
  submitted: "Submitted",
  completed: "Completed",
  archived: "Archived",
};
