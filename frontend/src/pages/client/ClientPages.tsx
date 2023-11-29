import { Route } from "react-router-dom";
import { IssuePage } from "./pages/IssuePage";

export const ClientPages = (
  <Route path="client">
    <Route path="issue" element={<IssuePage />} />
  </Route>
);
