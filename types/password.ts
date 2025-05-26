export type PasswordItemList = {
  id: number;
  serviceName: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InputPassword = {
  serviceName: string;
  password: string;
  username?: string;
  email?: string;
  url?: string;
  description?: string;
};

export type PasswordItemDetail = {
  id: number;
  serviceName: string;
  password: string;
  username?: string;
  email?: string;
  url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};
