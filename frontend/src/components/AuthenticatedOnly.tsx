import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthContext } from "../context/AuthContext";

// region Props

interface Props extends React.PropsWithChildren {
  /**
   * Allow the page to be rendered only if admin user is authenticated
   */
  onlyAdmin?: boolean;
}

// endregion

export const AuthenticatedOnly: React.FC<Props> = ({ onlyAdmin, children }) => {
  const location = useLocation();
  const authContext = useAuthContext();

  if (!authContext.isAuthenticated) {
    return (
      <Navigate
        to="/accounts/login"
        state={{
          from: location
        }}
      />
    );
  }

  if (onlyAdmin && !authContext.isAdmin) {
    return (
      <Navigate
        to="/errors/unauthorized"
      />
    );
  }

  return (children as any) ?? null;
};
