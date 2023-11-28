import React from "react";
import axios, { AxiosInstance } from "axios";

// region Types

type ApiContext = {
  client: AxiosInstance;
};

// endregion

const defaultApiContext: ApiContext = {
  client: axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  }),
};

const ApiContext = React.createContext<ApiContext>(defaultApiContext as any);

export const ApiContextProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const [apiContext, setApiContext] =
    React.useState<ApiContext>(defaultApiContext);

  return <ApiContext.Provider value={apiContext} children={children} />;
};

export const useApiContext = () => React.useContext(ApiContext);
