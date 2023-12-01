import React from "react";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useApiContext } from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";

const Schema = z.object({
  login: z.string().nonempty("The login is required!"),
  password: z.string().nonempty("The password is required!"),
});

type SchemaType = z.infer<typeof Schema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const { client } = useApiContext();
  const snackbar = useSnackbar();

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const onRegister = async (data: SchemaType) => {
    try {
      const { data: response } = await client.post("/public/user/register", {
        username: data.login,
        password: data.password,
      });

      const { user } = response;

      snackbar.enqueueSnackbar("Register success", {
        variant: "success",
      });

      navigate("/accounts/login");
    } catch (e) {
      snackbar.enqueueSnackbar("Register failed", {
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
      <Typography variant="subtitle1">Register</Typography>

      <TextField {...form.register("login")} />

      <Typography variant="subtitle1">Password</Typography>
      <TextField type="password" {...form.register("password")} />

      <Button variant="contained" onClick={form.handleSubmit(onRegister)}>
        Register
      </Button>
    </Box>
  );
};
