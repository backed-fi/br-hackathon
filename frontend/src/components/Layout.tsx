import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";

export const DashboardLayout = () => {
  return (
    <Box>
      <NavigationBar />

      <Box
        sx={{
          display: "grid",
        }}
      >
        {/* This is so that the sidebar stays here */}

        <Box
          sx={{
            paddingTop: "80px",
            minHeight: "100vh",
            backgroundColor: "#f2f4f8",
          }}
        >
          <Box
            sx={{
              padding: "3rem",
              height: "100%",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
