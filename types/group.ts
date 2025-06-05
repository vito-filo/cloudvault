export type GroupList = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupInput = {
  name: string;
  description?: string;
  membersEmail?: string[];
};

export type GroupDetails = {
  id: string;
  description?: string;
  name: string;
  members: { user: { name: string; email: string }; isAdmin: boolean }[];
  updatedAt: Date;
  createdAt: Date;
};
