import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AdminPages } from "./pages/admin/AdminPages";
import { AccountPages } from "./pages/account/AccountPages";

import { AuthContextProvider } from "./context/AuthContext";
import { ForbiddenPage } from "./pages/errors/ForbiddenPage";

function App() {
  return (
    <React.Fragment>
      <CssBaseline />

      <Router>
        <AuthContextProvider>
          <Routes>
            {AdminPages}
            {AccountPages}

            <Route
              path="errors"
            >
              <Route
                path="unauthorized"
                element={<ForbiddenPage />}
              />
            </Route>
          </Routes>
        </AuthContextProvider>
      </Router>
    </React.Fragment>
  );
}

export default App;
