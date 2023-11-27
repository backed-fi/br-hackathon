import React from "react";
import { Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";

export const AccountPages = (
  <Route
    path="accounts"
  >
    <Route
      path="login"
      element={<LoginPage />}
    />
  </Route>
)

