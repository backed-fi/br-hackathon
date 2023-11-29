import React from "react";

// region Types

type AuthContextNotAuthenticated = {
  isAuthenticated: false;
};

type AuthContextAuthenticated = {
  isAuthenticated: true;

  userId: string;
  isAdmin: boolean;
};

type AuthContextType = AuthContextAuthenticated | AuthContextNotAuthenticated;

// endregion

const defaultContext: AuthContextType = {
  isAuthenticated: false,
};

const AuthContext = React.createContext<AuthContextType>(defaultContext as any);

export const AuthContextProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const [authContext] = React.useState<AuthContextType>(defaultContext);

  return <AuthContext.Provider value={authContext} children={children} />;
};

export const useAuthContext = () => React.useContext(AuthContext);
