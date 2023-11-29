import React from "react";

import { ethers } from "ethers";
import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";

interface Props {
  orders: {
    token: string;
    amount: ethers.BigNumber;
    recipient: string;
    isBuyOrder: boolean;
  }[];
}

export const OrdersDialog: React.FC<Props> = ({ orders }) => {
  const [opened, setOpened] = React.useState(false);

  const toggle = () => setOpened(x => !x);

  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={opened}
        onClose={toggle}
      >
        <DialogContent>
          <Typography
            sx={{
              mb: "1rem",
              fontWeight: 600
            }}
          >
            Orders in settlement
          </Typography>

          {orders.map((order, index) => (
            <Box
              key={index}
              sx={{
                mb: "1rem",
                padding: ".5rem",
                border: "1px solid #D9D9D9",
                borderRadius: "4px"
              }}
            >

              <Typography>
                Amount: {ethers.utils.formatUnits(order.amount, order.isBuyOrder ? 6 : 18)}
              </Typography>

              <Typography>
                Order Type: {order.isBuyOrder ? "Buy Order" : "Sell Order"}
              </Typography>

              <Typography>
                Recipient: {order.recipient}
              </Typography>
            </Box>
          ))}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Button
              onClick={toggle}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>


      <Button onClick={toggle}>
        View Orders
      </Button>
    </React.Fragment>
  );
};
