import { Route } from "react-router-dom";
import { OrdersPage } from "./pages/OrdersPage";
import { SettlementsPage } from "./pages/SettlementsPage";

export const AdminPages = (
  <Route
    path="admin"
  >
    <Route
      path="orders"
      element={<OrdersPage />}
    />

    <Route
      path="settlements"
      element={<SettlementsPage />}
    />
  </Route>
);
