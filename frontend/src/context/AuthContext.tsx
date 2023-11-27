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

type AuthContext = AuthContextAuthenticated | AuthContextNotAuthenticated;

// endregion

const defaultContext: AuthContext = {
  isAuthenticated: false
};

const AuthContext = React.createContext<AuthContext>(defaultContext as any);

export const AuthContextProvider: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
  const [authContext, setAuthContext] = React.useState<AuthContext>(defaultContext);

  return (
    <AuthContext.Provider
      value={authContext}
      children={children}
    />
  );
};

export const useAuthContext = () => React.useContext(AuthContext);
