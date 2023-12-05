import React from "react";
import { Box, Button } from "@mui/material";
import { AuthenticatedOnly } from "../../../components/AuthenticatedOnly";
import { ASSETS, SUPPORTED_ASSETS } from "../../../constants/Assets";
import { ethers } from "ethers";
import { OrdersExchange__factory } from "../../../typechain";
import { useWeb3Context } from "../../../context/Web3Context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export const PastTransactionsPage: React.FC = () => {
  const web3Context = useWeb3Context();

  const [{ signer }, setSigner] = React.useState<{
    address?: string;
    signer?: ethers.Signer;
  }>({});

  const [history, setHistory] = React.useState<{
    createdAt: Date,
    amount: number,
    amountCurrency: string,
    side: 'Buy' | 'Sell'
    token: string
  }[]>();

  const fetchHistory = async () => {
    const address = await signer!.getAddress();
    debugger
    let x: typeof history = [];
    const contract = OrdersExchange__factory
      .connect(process.env.REACT_APP_SWAP_CONTRACT_ADDRESS!, signer!);
    for await (const asset of SUPPORTED_ASSETS) {
      const token = ASSETS[asset as "LFT" | "LFN"].address! as string;

      const orders = await contract.userOrders(address, token).catch(() => []);

      console.log(orders.toString());
      x = x.concat(orders.map(x => ({
        id: `${token}:${x.createdAt.toNumber()}`,
        createdAt: new Date(x.createdAt.toNumber() * 1000),
        amount: x.isBuyOrder ? parseFloat(x.amount.toString()) / 1e6 : parseFloat(x.amount.toString()) / 1e18,
        amountCurrency: x.isBuyOrder ? 'BRLC' : asset,
        side: x.isBuyOrder ? 'Buy' : 'Sell',
        token: asset
      })))
    }
    x = x.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())
    setHistory(x);
  };

  React.useEffect(() => {
    if (web3Context) {
      setSigner({ signer: web3Context.signer, address: web3Context.account });
    }
  }, [web3Context]);

  React.useEffect(() => {
    if (signer) {
      fetchHistory();
    }
  // eslint-disable-next-line
  }, [signer]);

  const columns: GridColDef[] = [
    { field: 'createdAt', type: 'dateTime', headerName: 'Created at', width: 260 },
    { field: 'token', headerName: 'For Token', width: 130 },
    { field: 'side', headerName: 'Side', width: 130 },
    { field: 'amount', headerName: 'Traded with', width: 130, renderCell: (params) => {
        return <>{params.row.amount} {params.row.amountCurrency}</>
    }, }
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   width: 160,
    //   valueGetter: getFullName,
    // },
  ];

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
          <Button variant="contained" onClick={web3Context.connectWallet}>
            Connect your wallet
          </Button>
        )}
        {signer && history && (
        <DataGrid rows={history} columns={columns} />
        )}
      </Box>
    </AuthenticatedOnly>
  );
};
