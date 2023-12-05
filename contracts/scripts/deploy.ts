import { ethers } from "hardhat";
import { Signer } from 'ethers';
import { SignerWithAddress } from "../test/helpers";
import { ERC20Mock__factory, ERC20__factory, OrdersExchange__factory, ProxyAdmin__factory, TransparentUpgradeableProxy__factory } from "../typechain-types";

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
  const stablecoin = ERC20Mock__factory.connect('0xb1E34471421DEACda61e68897ED6DBE373169eE9', owner.signer);
  const tBillTokens = [
    '0xD73464667d5F2e15dd0A3C58C3610c39c1b1c2d4',
    '0x0d9D5372b5F889bCEcb930b1540f7D1595075177',
    '0x9019337Ecc929a777B9f87c91D28713496Fc6381'
  ]
  // Deploy system

  // Deploy orders exchange
  const implementation = await (await new OrdersExchange__factory(owner.signer).deploy()).waitForDeployment()
  const proxyAdmin = await (await new ProxyAdmin__factory(owner.signer).deploy(owner.address)).waitForDeployment()
  const proxy = await (await new TransparentUpgradeableProxy__factory(owner.signer).deploy(
    implementation.getAddress(),
    proxyAdmin.getAddress(),
    implementation.interface.encodeFunctionData("initialize", [await stablecoin.getAddress()])
  )).waitForDeployment()
  const exchange = OrdersExchange__factory.connect(await proxy.getAddress(), owner.signer);

  for(const tBill of tBillTokens) {
    await (await exchange.registerToken(tBill)).wait()
  }

  const tBill = ERC20Mock__factory.connect(tBillTokens[0], owner.signer)
  await (await tBill.mint(owner.address, 100000n*10n**18n)).wait()
  // await (await stablecoin.mint(owner.address, 100000n*10n**6n))
  await (await stablecoin.approve(exchange, 10000000000n*10n**6n)).wait()
  await (await exchange.scheduleOrder(tBill, 100n*10n**6n, true)).wait()
  await (await tBill.approve(exchange, 1000000000n*10n**18n)).wait()
  await (await exchange.scheduleOrder(tBill, 100n*10n**18n, false)).wait()
  await (await exchange.closeEpoch(tBill, 0)).wait()
  await (await exchange.settleOrders(tBill, 123n*10n**18n, 0)).wait()
  await (await stablecoin.approve(exchange, 1000n*10n**6n)).wait()
  await (await exchange.scheduleOrder(tBill, 100n*10n**6n, true)).wait()
  await (await tBill.approve(exchange, 1000n*10n**18n)).wait()
  await (await exchange.scheduleOrder(tBill, 100n*10n**18n, false)).wait()
  await (await exchange.closeEpoch(tBill, 1)).wait()

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
