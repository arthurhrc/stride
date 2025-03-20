-- Use stride schema for all tables
SET search_path TO stride, public;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT '📁',
    "methodologyType" TEXT NOT NULL DEFAULT 'kanban',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'active',
    "spaceId" TEXT NOT NULL,
    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "spaceId" TEXT NOT NULL,
    CONSTRAINT "TaskList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "storyPoints" INTEGER,
    "listId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "sprintId" TEXT,
    "assigneeId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planning',
    "order" INTEGER NOT NULL DEFAULT 0,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'on_track',
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "unit" TEXT NOT NULL DEFAULT '%',
    "order" INTEGER NOT NULL DEFAULT 0,
    "objectiveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasCard" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#fef9c3',
    "order" INTEGER NOT NULL DEFAULT 0,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CanvasCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetroCard" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetroCard_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");

-- Indexes
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");
CREATE INDEX "Space_workspaceId_idx" ON "Space"("workspaceId");
CREATE INDEX "TaskStatus_spaceId_idx" ON "TaskStatus"("spaceId");
CREATE INDEX "TaskList_spaceId_idx" ON "TaskList"("spaceId");
CREATE INDEX "Task_listId_idx" ON "Task"("listId");
CREATE INDEX "Task_statusId_idx" ON "Task"("statusId");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");
CREATE INDEX "Sprint_spaceId_idx" ON "Sprint"("spaceId");
CREATE INDEX "Objective_spaceId_idx" ON "Objective"("spaceId");
CREATE INDEX "KeyResult_objectiveId_idx" ON "KeyResult"("objectiveId");
CREATE INDEX "CanvasCard_spaceId_idx" ON "CanvasCard"("spaceId");
CREATE INDEX "RetroCard_spaceId_idx" ON "RetroCard"("spaceId");

-- Foreign keys
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Space" ADD CONSTRAINT "Space_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_listId_fkey"
    FOREIGN KEY ("listId") REFERENCES "TaskList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey"
    FOREIGN KEY ("statusId") REFERENCES "TaskStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey"
    FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey"
    FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Objective" ADD CONSTRAINT "Objective_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Objective" ADD CONSTRAINT "Objective_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey"
    FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CanvasCard" ADD CONSTRAINT "CanvasCard_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RetroCard" ADD CONSTRAINT "RetroCard_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RetroCard" ADD CONSTRAINT "RetroCard_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
