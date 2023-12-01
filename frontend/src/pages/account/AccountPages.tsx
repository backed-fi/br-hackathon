import React from "react";
import { Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export const AccountPages = (
  <Route
    path="accounts"
  >
    <Route
      path="login"
      element={<LoginPage />}
    />
    <Route
      path="register"
      element={<RegisterPage />}
    />
  </Route>
)

