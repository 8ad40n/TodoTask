import { User, UserCredential } from "firebase/auth";

export interface AuthContextType {
    LoginWithGoogle: () => Promise<UserCredential>;
    Logout: () => Promise<void>;
    loading: boolean;
    user: User | null;
  }

export interface ITodo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
  userId: string;
}
  