import { Route } from "react-router-dom";
import { IssuePage } from "./pages/IssuePage";
import { HoldingsPage } from "./pages/HoldingsPage";

export const ClientPages = (
  <Route path="client">
    <Route path="placeOrder" element={<IssuePage />} />
    <Route path="holdings" element={<HoldingsPage />} />
  </Route>
);
