import React from "react";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useApiContext } from "../../../context/ApiContext";

const Schema = z.object({
  login: z.string().nonempty("The comment is required!"),
  password: z.string().nonempty("The comment is required!"),
});

type SchemaType = z.infer<typeof Schema>;

export const LoginPage: React.FC = () => {
  const { client } = useApiContext();
  const snackbar = useSnackbar();

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const onLogin = async (data: SchemaType) => {
    try {
      await client.post("/public/auth/login", {
        username: data.login,
        passowrd: data.password,
      });

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
