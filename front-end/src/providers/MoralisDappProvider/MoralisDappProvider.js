import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import MoralisDappContext from "./context";
import { contractAddresses, contractABI } from "../../constants";

function MoralisDappProvider({ children }) {
  const { web3, Moralis, user } = useMoralis();
  const [walletAddress, setWalletAddress] = useState();
  const [chainId, setChainId] = useState();
  const [adminWalletAddress, setAdminWalletAddress] = useState("0x4C72a622b9c0359B3c5Af411Ac7f8f26FEaeb859");

  const [contractAddress, setContractAddress] = useState(contractAddresses["80001"][0]); //Smart Contract Address
  const [contractgABI, setContractgABI] = useState(contractABI); //Smart Contract ABI here

  useEffect(() => {
    Moralis.onChainChanged(function (chain) {
      setChainId(chain);
    });

    Moralis.onAccountsChanged(function (address) {
      setWalletAddress(address[0]);
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setChainId(web3.givenProvider?.chainId));
  useEffect(() => setWalletAddress(web3.givenProvider?.selectedAddress || user?.get("ethAddress")), [web3, user]);

  return (
    <MoralisDappContext.Provider
      value={{
        adminWalletAddress,
        walletAddress,
        chainId,
        contractAddress,
        contractgABI,
      }}
    >
      {children}
    </MoralisDappContext.Provider>
  );
}

function useMoralisDapp() {
  const context = React.useContext(MoralisDappContext);
  if (context === undefined) {
    throw new Error("useMoralisDapp must be used within a MoralisDappProvider");
  }
  return context;
}

export { MoralisDappProvider, useMoralisDapp };
