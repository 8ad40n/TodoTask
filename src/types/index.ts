import { User, UserCredential } from "firebase/auth";

export interface AuthContextType {
    LoginWithGoogle: () => Promise<UserCredential>;
    Logout: () => Promise<void>;
    loading: boolean;
    user: User | null;
  }
  