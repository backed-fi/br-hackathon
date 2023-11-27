import { ethers } from "hardhat";
import { Signer } from 'ethers';
import { SignerWithAddress } from "../test/helpers";
import { ERC20__factory, OrdersExchange__factory, ProxyAdmin__factory, TransparentUpgradeableProxy__factory } from "../typechain-types";

async function main() {

  let accounts: Signer[];

  let owner: SignerWithAddress;


  accounts = await ethers.getSigners();

  // Initialize environment

  // Setup used accounts
  const getSigner = async (index: number): Promise<SignerWithAddress> => ({
    signer: accounts[index],
    address: await accounts[index].getAddress(),
  });
  owner = await getSigner(0);

  accounts = await ethers.getSigners();
  const stablecoin = ERC20__factory.connect('0xb1E34471421DEACda61e68897ED6DBE373169eE9', owner.signer);
  // Deploy system

  // Deploy orders exchange
    const implementation = await (await new OrdersExchange__factory(owner.signer).deploy()).waitForDeployment()
    const proxyAdmin = await (await new ProxyAdmin__factory(owner.signer).deploy()).waitForDeployment()
    const proxy = await (await new TransparentUpgradeableProxy__factory(owner.signer).deploy(
      implementation.getAddress(),
      proxyAdmin.getAddress(),
      implementation.interface.encodeFunctionData("initialize", [await stablecoin.getAddress()])
    )).waitForDeployment()
    const exchange = OrdersExchange__factory.connect(await proxy.getAddress(), owner.signer);

  const state = {
    exchange: await exchange.getAddress(),
  }
  console.log(state)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
