export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
