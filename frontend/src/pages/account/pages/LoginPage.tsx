import React from "react";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useApiContext } from "../../../context/ApiContext";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Schema = z.object({
  login: z.string().nonempty("The comment is required!"),
  password: z.string().nonempty("The comment is required!"),
});

type SchemaType = z.infer<typeof Schema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const { client } = useApiContext();
  const { authenticate } = useAuthContext();
  const snackbar = useSnackbar();

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const onLogin = async (data: SchemaType) => {
    try {
      const { data: response } = await client.post("/public/auth/login", {
        username: data.login,
        password: data.password,
      });

      const { accessToken } = response;

      const auth = await authenticate(accessToken);

      if (auth.isAdmin) {
        navigate("/admin/orders");
      } else {
        navigate("/client/issue");
      }

      snackbar.enqueueSnackbar("Login success", {
        variant: "success",
      });
    } catch (e) {
      snackbar.enqueueSnackbar("Login failed", {
        variant: "error",
      });
    }
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
        flexFlow: "column",
      }}
    >
      <Typography variant="subtitle1">Login</Typography>

      <TextField {...form.register("login")} />

      <TextField {...form.register("password")} />

      <Button onClick={form.handleSubmit(onLogin)}>Login</Button>
    </Box>
  );
};
