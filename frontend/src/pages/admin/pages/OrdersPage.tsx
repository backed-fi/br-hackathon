import React from "react";
import { BigNumber, ethers } from "ethers";

import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";

import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";
import { OrdersDialog } from "./components/OrdersDialog";
import { SettleDialog } from "./components/SettleDialog";
import { OrdersExchange__factory } from "../../../typechain";
import { ASSETS, SUPPORTED_ASSETS } from "../../../constants/Assets";

export const OrdersPage: React.FC = () => {
  const [tokenDetails, setTokenDetails] = React.useState<{
    tokenDetails: {
      tokenAddress: string;
      currentEpoch: ethers.BigNumber;
    };
    epochList: Array<{
      id: number;
      token: string;
      valueBought: ethers.BigNumber;
      amountSold: ethers.BigNumber;
      settled: boolean;
      orders: {
        token: string;
        amount: BigNumber;
        recipient: string;
        isBuyOrder: boolean;
      }[];
    }>;
  }>();

  const [{ signer, address }, setSigner] = React.useState<{
    address?: string;
    signer?: ethers.Signer;
  }>({});

  const contract = React.useMemo(() => {
    if (signer) {
      return new OrdersExchange__factory()
        .connect(signer)
        .attach(process.env["REACT_APP_SWAP_CONTRACT_ADDRESS"] as string);
    }
  }, [signer]);

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    setSigner({
      signer,
      address: await signer.getAddress(),
    });
  };

  const loadToken = (tokenAddress: string) => async () => {
    if (!contract) {
      return;
    }

    // Get the token details
    const details = await contract.availableTokens(tokenAddress);

    const epochList: Record<
      number,
      Awaited<ReturnType<typeof contract.epochDetails>> & {
        orders: Awaited<ReturnType<typeof contract.epochOrders>>;
      }
    > = {};

    await Promise.all(
      Array.from(Array(details.currentEpoch.toNumber() + 1)).map(
        async (_, index) => {
          epochList[index] = {
            ...((await contract.epochDetails(tokenAddress, index)) as any),
            orders: await contract.epochOrders(tokenAddress, index),
          };
        }
      )
    );

    setTokenDetails({
      tokenDetails: {
        tokenAddress,
        currentEpoch: details.currentEpoch,
      },
      epochList: Object.entries(epochList)
        .map(([key, value]) => ({ id: Number(key), ...value }))
        .sort((a, b) => b.id - a.id) as any,
    });
  };

  console.log(tokenDetails);

  return (
    <AuthenticatedOnly>
      <Box
        sx={{
          mt: "64px",
          display: "flex",
          flexFlow: "column",
          alignItems: "center",
        }}
      >
        {!signer && (
          <Button onClick={connectWallet}>Connect your wallet</Button>
        )}

        {signer && (
          <React.Fragment>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: "700",
                ...(tokenDetails && {
                  cursor: "pointer",
                }),
              }}
              onClick={() => setTokenDetails(null as any)}
            >
              {tokenDetails ? "Go back to asset selection" : "Select an asset"}
            </Typography>

            {!tokenDetails &&
              SUPPORTED_ASSETS.map((supportedToken) => (
                <Box
                  sx={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    marginTop: "1rem",
                    padding: "1rem",
                    width: "400px",
                    border: "1px solid #D9D9D9",
                  }}
                  onClick={loadToken(
                    ASSETS[supportedToken as "LFT" | "LFN"].address!
                  )}
                >
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {ASSETS[supportedToken as "LFT" | "LFN"].name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "500",
                      opacity: ".5",
                    }}
                  >
                    {ASSETS[supportedToken as "LFT" | "LFN"].address}
                  </Typography>
                </Box>
              ))}

            {tokenDetails && (
              <DataGrid
                sx={{
                  width: "100%",
                  maxWidth: "1024px",
                }}
                rows={tokenDetails.epochList}
                columns={[
                  {
                    field: "settled",
                    headerName: "Is Settled",
                    renderCell: ({ value }) => (value ? "Yes" : "No"),
                  },
                  {
                    minWidth: 200,
                    field: "valueBought",
                    headerName: "Value Bought",
                    renderCell: ({ value }) =>
                      `~${ethers.utils.formatUnits(value, 6)} BRL`,
                  },
                  {
                    minWidth: 200,
                    field: "amountSold",
                    headerName: "Amount Sold",
                    renderCell: ({ value }) =>
                      `~${ethers.utils.formatUnits(value, 18)} units`,
                  },
                  {
                    minWidth: 200,
                    field: "orders",
                    headerName: "Orders in settlement",
                    renderCell: ({ value }) => value.length,
                  },
                  {
                    flex: 1,
                    field: "id",
                    headerName: "Actions",
                    renderCell: ({ value, row }) => {
                      return (
                        <Box
                          sx={{
                            gap: "1rem",
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <OrdersDialog orders={row.orders} />

                          {!row.settled && (
                            <SettleDialog
                              onSettled={loadToken}
                              exchangeContract={contract!}
                              epochId={row.id}
                              tokenAddress={
                                tokenDetails?.tokenDetails.tokenAddress!
                              }
                            />
                          )}
                        </Box>
                      );
                    },
                  },
                ]}
              />
            )}
          </React.Fragment>
        )}
      </Box>
    </AuthenticatedOnly>
  );
};
