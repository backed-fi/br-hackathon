import { Box, Typography } from "@mui/material";
import React from "react";

export const ForbiddenPage: React.FC = () => {
  return (
    <Box textAlign="center">
      <Typography
        color="error"
        variant="h1"
      >
        Unauthorized
      </Typography>

      <Typography>
        Some pages were just not meant to be seen. The paged you attempted to visit was one of them.
      </Typography>
    </Box>
  );
};
