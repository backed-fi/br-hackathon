import React, { useState } from "react";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, TextField, Typography } from "@mui/material";
import { useApiContext } from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";

const Schema = z.object({
  login: z.string().nonempty("The login is required!"),
  password: z.string().nonempty("The password is required!"),
});

type SchemaType = z.infer<typeof Schema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const { client } = useApiContext();

  const [loading, setLoading] = useState(false);

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const onRegister = async (data: SchemaType) => {
    try {
      setLoading(true);

      await client.post("/public/user/register", {
        username: data.login,
        password: data.password,
      });

      snackbar.enqueueSnackbar("Register success", {
        variant: "success",
      });

      setLoading(false);

      navigate("/accounts/login");
    } catch (e) {
      setLoading(false);

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

      <LoadingButton
        loading={loading}
        variant="contained"
        onClick={form.handleSubmit(onRegister)}
        sx={{
          backgroundColor: "#39429b",
          '&:hover': {
            backgroundColor: "#1976d2",
          },
        }}
      >
        Register
      </LoadingButton>
    </Box>
  );
};
