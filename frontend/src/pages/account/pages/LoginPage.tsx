import React, { useState } from "react";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useApiContext } from "../../../context/ApiContext";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";

const Schema = z.object({
  login: z.string().nonempty("The login is required!"),
  password: z.string().nonempty("The password is required!"),
});

type SchemaType = z.infer<typeof Schema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const { client } = useApiContext();
  const { authenticate } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const onLogin = async (data: SchemaType) => {
    try {
      setLoading(true);

      const { data: response } = await client.post("/public/auth/login", {
        username: data.login,
        password: data.password,
      });

      const { accessToken } = response;

      const auth = await authenticate(accessToken);

      setLoading(false);

      if (auth.isAdmin) {
        navigate("/admin/orders");
      } else {
        navigate("/client/placeOrder");
      }

      snackbar.enqueueSnackbar("Login success", {
        variant: "success",
      });
    } catch (e) {
      setLoading(false);

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

      <TextField type="password" {...form.register("password")} />

      <LoadingButton
        loading={loading}
        variant="contained"
        onClick={form.handleSubmit(onLogin)}
      >
        Login
      </LoadingButton>
      <Button onClick={() => navigate("/accounts/register")}>Register</Button>
    </Box>
  );
};
