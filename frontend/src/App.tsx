import React from "react";
import { SnackbarProvider } from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { AdminPages } from "./pages/admin/AdminPages";
import { AccountPages } from "./pages/account/AccountPages";

import { AuthContextProvider } from "./context/AuthContext";
import { ApiContextProvider } from "./context/ApiContext";
import { ForbiddenPage } from "./pages/errors/ForbiddenPage";
import { ClientPages } from "./pages/client/ClientPages";

function App() {
  return (
    <React.Fragment>
      <CssBaseline />

      <Router>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <AuthContextProvider>
            <ApiContextProvider>
              <Routes>
                {AdminPages}
                {ClientPages}
                {AccountPages}

                <Route path="errors">
                  <Route path="unauthorized" element={<ForbiddenPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/accounts/login" />} />
              </Routes>
            </ApiContextProvider>
          </AuthContextProvider>
        </SnackbarProvider>
      </Router>
    </React.Fragment>
  );
}

export default App;
