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
};
