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
import {
  ERC20Mock__factory,
  OrdersExchange__factory,
} from "../../../../typechain";
import { BigNumber, ethers } from "ethers";
import { ASSETS } from "../../../../constants/Assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { useWeb3Context } from "../../../../context/Web3Context";

const Schema = z.object({
  amount: z.number().nonnegative().int(),
});

type SchemaType = z.infer<typeof Schema>;

export const InteractionsWidget: React.FC = () => {
  const snackbar = useSnackbar();
  const web3Context = useWeb3Context();

  const [value, setValue] = React.useState(0);
  const [asset, setAsset] = React.useState<"LFT" | "LFN" | "NTN-F">("LFT");
  const [loading, setLoading] = React.useState(false);

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
        .attach(process.env.REACT_APP_SWAP_CONTRACT_ADDRESS as string);
    }
  }, [signer]);
  const stableContract = React.useMemo(() => {
    if (signer) {
      return new ERC20Mock__factory()
        .connect(signer)
        .attach(process.env.REACT_APP_STABLE_ADDRESS as string);
    }
  }, [signer]);
  const confirm = async (data: SchemaType) => {
    if (contract && stableContract) {
      setLoading(true);
      try {
        if (!value) {
          const tx = await stableContract.approve(
            process.env.REACT_APP_SWAP_CONTRACT_ADDRESS as string,
            BigNumber.from(data.amount)
              .mul(BigNumber.from(10).pow(6))
              .toString()
          );

          await tx.wait();
        } else {
          const contract = new ERC20Mock__factory()
            .connect(signer!)
            .attach(ASSETS[asset].address! as string);

          const tx = await contract.approve(
            process.env.REACT_APP_SWAP_CONTRACT_ADDRESS as string,
            BigNumber.from(data.amount)
              .mul(BigNumber.from(10).pow(18))
              .toString()
          );

          await tx.wait();
        }
        const tx = await contract.scheduleOrder(
          ASSETS[asset].address!,
          BigNumber.from(data.amount)
            .mul(BigNumber.from(10).pow(!value ? 6 : 18))
            .toString(),
          !value
        );

        await tx.wait();

        setLoading(false);
        snackbar.enqueueSnackbar(`Order placed successfully`, {
          variant: "success",
        });
      } catch (e) {
        snackbar.enqueueSnackbar(`Order placement failed`, {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (web3Context) {
      setSigner({ signer: web3Context.signer, address: web3Context.account });
    }
  }, [web3Context]);

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
            onClick={web3Context.connectWallet}
          >
            Connect your wallet
          </Button>
        )}
        {signer && (
          <LoadingButton
            loading={loading}
            sx={{ width: "100%" }}
            variant="contained"
            onClick={form.handleSubmit(confirm)}
          >
            Confirm
          </LoadingButton>
        )}
      </CardActions>
    </Card>
  );
};
