import React from "react";
import { Box } from "@mui/material";
import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";

export const OrdersPage: React.FC = () => {
  return (
    <AuthenticatedOnly>
      <Box>

      </Box>
    </AuthenticatedOnly>

  );
};
