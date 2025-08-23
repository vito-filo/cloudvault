export type PasswordItemList = {
  id: string;
  serviceName: string;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordInput = {
  serviceName: string;
  password: string;
  username?: string;
  email?: string;
  url?: string;
  description?: string;
};

export type PasswordItemDetail = {
  id: string;
  serviceName: string;
  password: string;
  username?: string;
  email?: string;
  url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordUpdate = {
  serviceName?: string;
  password?: string;
  username?: string;
  email?: string;
  url?: string;
  description?: string;
};
