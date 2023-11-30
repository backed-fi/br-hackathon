import React from "react";
import * as z from "zod";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Button,
  Box,
  Select,
  TextField,
  Tabs,
  Tab,
  MenuItem,
} from "@mui/material";
import { OrdersExchange__factory } from "../../../../typechain";
import { ethers } from "ethers";
import { ASSETS } from "../../../../constants/Assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";

const Schema = z.object({
  amount: z.number().nonnegative().int(),
});

type SchemaType = z.infer<typeof Schema>;

export const InteractionsWidget: React.FC = () => {
  const snackbar = useSnackbar();

  const [value, setValue] = React.useState(0);
  const [asset, setAsset] = React.useState<"LFT" | "LFN" | "NTN-F">("LFT");

  const form = useForm<SchemaType>({
    resolver: zodResolver(Schema),
  });

  const [{ signer }, setSigner] = React.useState<{
    address?: string;
    signer?: ethers.Signer;
  }>({});

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const contract = React.useMemo(() => {
    if (signer) {
      return new OrdersExchange__factory()
        .connect(signer)
        .attach(process.env["REACT_APP_SWAP_CONTRACT_ADDRESS"] as string);
    }
  }, [signer]);
  const confirm = async (data: SchemaType) => {
    if (contract) {
      try {
        await contract.scheduleOrder(
          ASSETS[asset].address!,
          ethers.utils.parseEther(data.amount.toString()),
          !!value
        );

        snackbar.enqueueSnackbar("Login success", {
          variant: "success",
        });
      } catch (e) {
        snackbar.enqueueSnackbar("Login failed", {
          variant: "error",
        });
      }
    }
  };

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

  return (
    <Card sx={{ width: 350 }}>
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Buy" sx={{ flexGrow: 1 }} />
            <Tab label="Sell" sx={{ flexGrow: 1 }} />
          </Tabs>
        </Box>
        <Box
          sx={{
            display: "flex",
            paddingTop: "32px",
            flexDirection: "column",
          }}
        >
          <Typography>Select asset:</Typography>
          <Select
            value={asset}
            label="Asset"
            onChange={(v) => setAsset(v.target.value as any)}
          >
            <MenuItem value={"LFT"}>{ASSETS.LFT.name}</MenuItem>
            <MenuItem value={"LFN"}>{ASSETS.LFN.name}</MenuItem>
            <MenuItem value={"NTN-T"}>{ASSETS["NTN-F"].name}</MenuItem>
          </Select>

          <Typography>Amount:</Typography>
          <TextField
            type="number"
            {...form.register("amount", {
              valueAsNumber: true,
            })}
          ></TextField>
        </Box>
      </CardContent>
      <CardActions>
        {!signer && (
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            onClick={connectWallet}
          >
            Connect your wallet
          </Button>
        )}
        {signer && (
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            onClick={form.handleSubmit(confirm)}
          >
            Confirm
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
