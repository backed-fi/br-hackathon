import React from "react";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";

// ---- User state types ---- //

interface Web3ContextValues {
  connected: boolean;
  provider?: ethers.providers.Web3Provider;
  account?: string;
  chainId?: number;
  signer?: ethers.Signer;
}

interface Web3ContextFns {
  connectWallet: () => Promise<any>;
}

const Web3Context = React.createContext<Web3ContextValues & Web3ContextFns>(
  {} as any
);

export const Web3ContextProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const snackbar = useSnackbar();

  const defaultWeb3ContextData = {
    connected: false,
  };

  const [web3ContextState, setWeb3ContextState] =
    React.useState<Web3ContextValues>(defaultWeb3ContextData);
  const connectWallet = async () => {
    if (web3ContextState.provider) {
      try {
        await web3ContextState.provider.send("eth_requestAccounts", []);
        const signer = web3ContextState.provider.getSigner();
        const account = await signer.getAddress();
        const network = await web3ContextState.provider.getNetwork();

        snackbar.enqueueSnackbar("Successfully connected account.", {
          variant: "success",
        });

        setWeb3ContextState({
          ...web3ContextState,
          signer: signer,
          account: account,
          chainId: network.chainId,
          connected: true,
        });
      } catch (e) {
        snackbar.enqueueSnackbar("Failed to connect account.", {
          variant: "error",
        });
      }
    }
  };
  // endregion

  // region Effects

  React.useEffect(() => {
    if ((window as any).ethereum) {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum,
        "any"
      );

      const setAccountChanged = (accounts: any[]) => {
        snackbar.enqueueSnackbar("Account  change detected.", {
          variant: "info",
        });
        if (accounts.length > 0) {
          setWeb3ContextState((prev) => ({
            ...prev,
            account: accounts[0],
          }));
        } else {
          setWeb3ContextState((prev) => ({
            ...prev,
            connected: false,
            account: undefined,
          }));
        }
      };
      (window as any).ethereum.on("accountsChanged", setAccountChanged);

      const setChainChanged = (chainId: string) => {
        snackbar.enqueueSnackbar("Network change detected.", {
          variant: "info",
        });

        setWeb3ContextState((prev) => ({
          ...prev,
          chainId: parseInt(chainId),
        }));
      };
      (window as any).ethereum.on("chainChanged", setChainChanged);

      setWeb3ContextState({
        ...web3ContextState,
        provider: provider,
      });

      return () => {
        (window as any).ethereum?.removeListener(
          "accountsChanged",
          setAccountChanged
        );
        (window as any).ethereum?.removeListener(
          "chainChanged",
          setChainChanged
        );
      };
    }

    return;
  }, []);

  // Update the context on graphql data changes

  // endregion

  return (
    <Web3Context.Provider
      value={{
        ...web3ContextState,
        connectWallet,
      }}
      children={children}
    />
  );
};

export const useWeb3Context = () => React.useContext(Web3Context);
