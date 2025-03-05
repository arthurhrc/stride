export type Priority = string;

export type TaskStatusType = "not_started" | "active" | "done" | "cancelled";

export type MethodologyType = "kanban" | "scrum" | "okr" | "canvas" | "retro";

export interface UserSummary {
  id: string;
  name: string;
  avatarColor: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface SpaceSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  methodologyType: string;
  workspaceId: string;
}

export interface TaskStatusData {
  id: string;
  name: string;
  color: string;
  order: number;
  type: string;
}

export interface TaskListData {
  id: string;
  name: string;
  order: number;
  spaceId: string;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  order: number;
  storyPoints?: number | null;
  sprintId?: string | null;
  listId: string;
  statusId: string;
  assigneeId?: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  status: TaskStatusData;
  assignee?: UserSummary | null;
  creator: UserSummary;
  list: TaskListData;
  _count?: { comments: number };
}

export interface CommentData {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: UserSummary;
}

export interface SprintData {
  id: string;
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  order: number;
  spaceId: string;
  createdAt: string;
}

export interface KeyResultData {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  order: number;
  objectiveId: string;
  createdAt: string;
}

export interface ObjectiveData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  ownerId?: string | null;
  dueDate?: string | null;
  order: number;
  spaceId: string;
  createdAt: string;
  owner?: UserSummary | null;
  keyResults: KeyResultData[];
}

export interface CanvasCardData {
  id: string;
  content: string;
  block: string;
  color: string;
  order: number;
  spaceId: string;
  createdAt: string;
}

export interface RetroCardData {
  id: string;
  content: string;
  column: string;
  votes: number;
  order: number;
  authorId: string;
  spaceId: string;
  createdAt: string;
  author: UserSummary;
}

export interface SpaceWithData extends SpaceSummary {
  statuses: TaskStatusData[];
  lists: (TaskListData & { tasks: TaskData[] })[];
  sprints?: SprintData[];
  objectives?: (ObjectiveData)[];
  canvasCards?: CanvasCardData[];
  retroCards?: RetroCardData[];
}
