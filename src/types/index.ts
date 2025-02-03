export type Priority = string;

export type TaskStatusType = "not_started" | "active" | "done" | "cancelled";

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

export interface SpaceWithData extends SpaceSummary {
  statuses: TaskStatusData[];
  lists: (TaskListData & { tasks: TaskData[] })[];
}
