import React from "react";

// region Types

type AuthContextNotAuthenticated = {
  isAuthenticated: false
}

type AuthContextAuthenticated = {
  isAuthenticated: true;

  userId: string;
  isAdmin: boolean;
}

type AuthFns = {
  authenticate: () => void;
}

type AuthContext = (AuthContextAuthenticated | AuthContextNotAuthenticated);

// endregion

const defaultContext: AuthContext = {
  isAuthenticated: false
};

const AuthContext = React.createContext<AuthContext & AuthFns>(defaultContext as any);

export const AuthContextProvider: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
  const [authContext, setAuthContext] = React.useState<AuthContext>(defaultContext);


  return (
    <AuthContext.Provider
      value={{
        ...authContext,

        authenticate: () => {
          setAuthContext((pr) => ({
            ...pr,
            isAdmin: true,
            userId: "demo-user",
            isAuthenticated: true
          }));
        }
      }}
      children={children}
    />
  );
};

export const useAuthContext = () => React.useContext(AuthContext);
