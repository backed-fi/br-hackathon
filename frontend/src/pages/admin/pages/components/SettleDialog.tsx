import React from "react";
import { ethers } from "ethers";
import { LoadingButton } from "@mui/lab";

import {
  Button,
  Dialog,
  DialogContent,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from "@mui/material";

import { OrdersExchange } from "../../../../typechain";

interface Props {
  epochId: number;
  tokenAddress: string;

  exchangeContract: OrdersExchange;
  onSettled: (tokenAddress: string) => any;
}

export const SettleDialog: React.FC<Props> = ({ exchangeContract, epochId, tokenAddress, onSettled }) => {
  const [opened, setOpened] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [price, setPrice] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);

  const toggle = () => setOpened(x => !x);


  // region Actions

  const onCloseEpoch = async () => {
    try {
      setLoading(true);

      const tokenDetails = await exchangeContract.availableTokens(tokenAddress);

      if (tokenDetails.currentEpoch.eq(epochId)) {
        const transaction = await exchangeContract
          .closeEpoch(
            tokenAddress,
            epochId
          );

        await transaction.wait();
      }


    } catch {
    } finally {
      setCurrentStep(1);
      setLoading(false);
    }
  };

  const onSettle = async () => {
    try {
      setLoading(true);
      console.log(tokenAddress, ethers.utils.parseUnits(price.toString(), 6), epochId)

      const tx = await exchangeContract.settleOrders(tokenAddress, ethers.utils.parseUnits(price.toString(), 6), epochId);

      await tx.wait();
      await onSettled(tokenAddress);

      toggle();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // endregion


  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth="xs"
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
            Settle
          </Typography>

          <Stepper
            orientation="vertical"
            activeStep={currentStep}
          >
            <Step>
              <StepLabel>
                Close the round
              </StepLabel>

              <StepContent>
                <Typography>
                  The first step is to close the settlement. This will make sure that a user
                  will not submit an order in the middle of the process
                </Typography>

                <LoadingButton
                  loading={loading}
                  onClick={onCloseEpoch}
                  variant="contained"
                  sx={{
                    mt: "1rem",
                    float: "right"
                  }}
                >
                  Close the round
                </LoadingButton>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>
                Settle the settlement
              </StepLabel>

              <StepContent>
                <Typography>
                  Submit the price at which the trades were executed. This will finalise the round
                  and calculate the payout values
                </Typography>

                <TextField
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  label="Price Per Share"
                  size="small"
                  sx={{
                    m: ".5rem 0"
                  }}
                />

                <LoadingButton
                  loading={loading}
                  onClick={onSettle}
                  variant="contained"
                  sx={{
                    mt: "1rem",
                    float: "right"
                  }}
                >
                  Settle
                </LoadingButton>

              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>

      </Dialog>


      <Button
        onClick={toggle}
        variant="outlined"
      >
        Settle Order
      </Button>
    </React.Fragment>
  );
};
