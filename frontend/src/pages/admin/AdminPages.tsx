import { Route } from "react-router-dom";
import { OrdersPage } from "./pages/OrdersPage";

export const AdminPages = (
  <Route
    path="admin"
  >
    <Route
      path="orders"
      element={<OrdersPage />}
    />

  </Route>
);
