import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";

export const DashboardLayout = () => {
  return (
    <Box>
      <NavigationBar />

      <Box sx={{ display: "grid" }}>
        <Box
          sx={{
            paddingTop: "80px",
            minHeight: "100vh",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url(/mandala.png)",
              backgroundSize: "cover",
              opacity: 0.15,
              zIndex: -1,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
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
