import React from "react";
import { Box } from "@mui/material";
import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";
import { InteractionsWidget } from "./components/InteractionsWidget";

export const IssuePage: React.FC = () => {
  return (
    <AuthenticatedOnly>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <InteractionsWidget></InteractionsWidget>
      </Box>
    </AuthenticatedOnly>
  );
};
