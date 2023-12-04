export const ASSETS = {
  LFT: {
    name: 'Letras Financeiras do Tesouro',
    address: process.env.REACT_APP_TOKEN_LFT_ADDRESS
  },
  LFN: {
    name: 'Letras do Tesouro Nacional',
    address: process.env.REACT_APP_TOKEN_LFN_ADDRESS
  },
  "NTN-F": {
    name: 'Notas do Tesouro Nacional ',
    address: process.env.REACT_APP_TOKEN_NTN_ADDRESS
  }
}

export const SUPPORTED_ASSETS = Object.keys(ASSETS);