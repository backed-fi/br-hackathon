import React from "react";
import { AppBar, Box, IconButton, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const NavigationBar: React.FC = ({ ...props }) => {
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const onLogout = async () => {
    await authContext.logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      {...props}
      sx={({ zIndex }) => ({
        zIndex: zIndex.drawer + 1,
      })}
    >
      <Box
        sx={{
          p: "1.25rem 2rem",
          display: "flex",
          height: "80px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!authContext.isAuthenticated && (
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                paddingRight: "32px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/accounts/login")}
            >
              Login
            </Box>
            <Box
              sx={{
                cursor: "pointer",
              }}
              onClick={() => navigate("/accounts/register")}
            >
              Register user
            </Box>
          </Box>
        )}
        {authContext.isAuthenticated && (
          <Box
            sx={{
              gap: "0.75rem",
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
            }}
          >
            {authContext.isAdmin && (
              <Box
                sx={{
                  cursor: "pointer",
                  flexGrow: 1,
                }}
                onClick={() => navigate("/admin/orders")}
              >
                Orders management
              </Box>
            )}
            {!authContext.isAdmin && (
              <React.Fragment>
                <Box
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/client/placeOrder")}
                >
                  Place order
                </Box>
                <Box
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/client/holdings")}
                >
                  Holdings
                </Box>
              </React.Fragment>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                }}
              >
                {authContext.username}
              </Typography>
            </Box>

            <IconButton onClick={onLogout} aria-label="logout" color="inherit">
              <Logout fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </AppBar>
  );
};
