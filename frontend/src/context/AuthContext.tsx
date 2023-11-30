import React from "react";
import { JWTPayload, decodeJwt } from "jose";

import { LocalStorage } from "../constants/LocalStorage";

import isFuture from "date-fns/isFuture";
import { isPast } from "date-fns";

// region Types

interface AuthContextPayloadType {
  isAuthenticated: boolean;

  userId: string;
  isAdmin: boolean;
}

interface AuthContextHelpersType {
  /**
   * Function, used to properly set the authentication token the
   * user has successfully been authenticated
   *
   * @param token - The valid JWT auth token
   */
  authenticate: (token: string) => Promise<AuthContextPayloadType>;

  /**
   * Function, used for logging out the currently authenticated user
   */
  logout: () => Promise<void>;
}

type AuthContextType = AuthContextHelpersType & AuthContextPayloadType;

// endregion

// region Temporary Helpers

const isTokenValid = () => {
  const token = localStorage.getItem(LocalStorage.AuthToken);

  if (!token) {
    return false;
  }

  const decodedToken = decodeJwt(token);

  return isFuture(new Date((decodedToken.exp || 0) * 1000));
};

const decodeToken = (): { userId?: string; isAdmin?: boolean } & JWTPayload => {
  const token = localStorage.getItem(LocalStorage.AuthToken);

  if (!token) {
    return {};
  }

  return decodeJwt<{ userId: string; isAdmin: boolean }>(token);
};

// endregion

const defaultContextData: AuthContextPayloadType = {
  isAuthenticated: isTokenValid(),
  isAdmin: decodeToken().isAdmin || false,
  userId: decodeToken().userId || "",
};

const AuthContext = React.createContext<AuthContextType>(
  defaultContextData as any
);

export const AuthContextProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  // region State

  const [authContextState, setAuthContextState] =
    React.useState<AuthContextPayloadType>(defaultContextData);

  // endregion

  // region Actions

  const authenticate: AuthContextHelpersType["authenticate"] = async (
    token: string
  ) => {
    localStorage.setItem(LocalStorage.AuthToken, token);

    const decoded = decodeToken();

    setAuthContextState((prevState) => ({
      ...prevState,
      isAuthenticated: true,
      isAdmin: decoded.isAdmin!,
      userId: decoded.userId!,
    }));

    return authContextState;
  };

  const logout: AuthContextHelpersType["logout"] = async () => {
    localStorage.removeItem(LocalStorage.AuthToken);

    setAuthContextState((prevState) => ({
      ...prevState,

      isAuthenticated: false,
    }));
  };

  // endregion

  // region Effects

  React.useEffect(() => {
    const interval = setInterval(() => {
      const decodedToken = decodeToken();

      if (
        decodedToken.exp &&
        isPast(new Date((decodedToken.exp || 0) * 1000))
      ) {
        setAuthContextState((p) => ({
          ...p,
          authenticated: false,
        }));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // endregion

  return (
    <AuthContext.Provider
      value={{
        ...authContextState,
        authenticate,
        logout,
      }}
      children={children}
    />
  );
};

export const useAuthContext = () => React.useContext(AuthContext);
