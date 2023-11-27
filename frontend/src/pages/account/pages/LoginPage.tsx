import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";

export const LoginPage: React.FC = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        pt: "128px",
        margin: "0 auto",
        maxWidth: "512px",
        width: "90vw",
        gap: "1rem",
        display: "flex",
        flexFlow: "column"
      }}
    >
      <Typography variant="subtitle1">
        Login
      </Typography>

      <TextField
        label="Email"
      />

      <TextField
        label="Password"
        type="password"
      />

      <Button>
        Login
      </Button>
    </Box>
  );
};
