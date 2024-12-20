export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
};

export type LoginDtoType = {
  email: string;
  password: string;
};

export type RegisterDtoType = LoginDtoType & {
  firstName: string;
  lastName: string;
} & { id?: string };

export type UserContextType = {
  user: User | null;
  login: (data: LoginDtoType) => Promise<User>;
  register: (data: RegisterDtoType) => Promise<User | null>;
  logout: () => void;
  handleWebAuthRegister: () => Promise<User | null>;
  setUser: (user: User | null) => void;
};
