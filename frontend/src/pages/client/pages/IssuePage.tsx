import React from "react";
import { Box } from "@mui/material";
import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";

export const IssuePage: React.FC = () => {
  return (
    <AuthenticatedOnly>
      <Box>Isssue!</Box>
    </AuthenticatedOnly>
  );
};
