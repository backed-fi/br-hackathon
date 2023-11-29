import React from "react";
import axios, { AxiosInstance } from "axios";

// region Types

type ApiContextType = {
  client: AxiosInstance;
};

// endregion

const defaultApiContext: ApiContextType = {
  client: axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  }),
};

const ApiContext = React.createContext<ApiContextType>(
  defaultApiContext as any
);

export const ApiContextProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const [apiContext, setApiContext] =
    React.useState<ApiContextType>(defaultApiContext);

  return <ApiContext.Provider value={apiContext} children={children} />;
};

export const useApiContext = () => React.useContext(ApiContext);
