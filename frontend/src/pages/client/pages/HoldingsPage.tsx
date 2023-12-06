import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";
import { ASSETS, SUPPORTED_ASSETS } from "../../../constants/Assets";
import { BigNumber, ethers } from "ethers";
import { ERC20Mock__factory } from "../../../typechain";
import { useWeb3Context } from "../../../context/Web3Context";

export const HoldingsPage: React.FC = () => {
  const web3Context = useWeb3Context();

  const [{ signer }, setSigner] = React.useState<{
    address?: string;
    signer?: ethers.Signer;
  }>({});

  const [balances, setBalances] = React.useState<{ [key: string]: string }>();

  const fetchBalances = async () => {
    const address = await signer!.getAddress();

    let x = {};
    for await (const asset of SUPPORTED_ASSETS) {
      const contract = new ERC20Mock__factory()
        .connect(signer!)
        .attach(ASSETS[asset as "LFT" | "LFN"].address! as string);

      const balance = await contract.balanceOf(address);

      x = {
        ...x,
        [asset]: balance.div(BigNumber.from(10).pow(18)).toString(),
      };
    }

    setBalances(x);
  };

  React.useEffect(() => {
    if (web3Context) {
      setSigner({ signer: web3Context.signer, address: web3Context.account });
    }
  }, [web3Context]);

  React.useEffect(() => {
    if (signer) {
      fetchBalances();
    }
    // eslint-disable-next-line
  }, [signer]);

  return (
    <AuthenticatedOnly>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!signer && (
          <Button 
          sx={{
            backgroundColor: "#39429b",
            '&:hover': {
              backgroundColor: "#1976d2",
            },
          }}
          variant="contained" onClick={web3Context.connectWallet}>
            Connect your wallet
          </Button>
        )}
        {SUPPORTED_ASSETS.map((supportedToken) => (
          <Box
            sx={{
              borderRadius: "1rem",
              marginTop: "1rem",
              padding: "1rem",
              width: "400px",
              border: "1px solid #D9D9D9",
              backgroundColor: "#82a8d9",
            }}
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
                opacity: ".8",
              }}
            >
              {ASSETS[supportedToken as "LFT" | "LFN"].address}
            </Typography>
            {signer && balances && (
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                Balance: {new Intl.NumberFormat('en-US').format(Number(balances[supportedToken]))} {supportedToken}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </AuthenticatedOnly>
  );
};
