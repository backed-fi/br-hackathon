import React from "react";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAuthContext } from "../../../context/AuthContext";

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useAuthContext();

  const onAuthenticate = () => {
    authContext.authenticate();

    navigate("/admin/orders");
  };

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

      <Button onClick={onAuthenticate}>
        Login
      </Button>
    </Box>
  );
};
