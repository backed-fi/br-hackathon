import React from "react";
import { SnackbarProvider } from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AdminPages } from "./pages/admin/AdminPages";
import { AccountPages } from "./pages/account/AccountPages";

import { AuthContextProvider } from "./context/AuthContext";
import { ApiContextProvider } from "./context/ApiContext";
import { ForbiddenPage } from "./pages/errors/ForbiddenPage";

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
                {AccountPages}

                <Route path="errors">
                  <Route path="unauthorized" element={<ForbiddenPage />} />
                </Route>
              </Routes>
            </ApiContextProvider>
          </AuthContextProvider>
        </SnackbarProvider>
      </Router>
    </React.Fragment>
  );
}

export default App;
