import { ethers } from "hardhat";
import { Signer } from "ethers";
import { SignerWithAddress, cacheBeforeEach, mineBlocks } from "../helpers";
import { expect } from "chai";
import { ERC20Mock, ERC20Mock__factory, ERC20__factory, OrdersExchange, OrdersExchange__factory, ProxyAdmin__factory, TransparentUpgradeableProxy__factory, WhitelistController, WhitelistControllerAggregator__factory, WhitelistController__factory, WrappedBackedToken, WrappedBackedTokenFactory, WrappedBackedTokenFactory__factory, WrappedBackedToken__factory } from "../../typechain-types";

describe("OrdersExchange", function () {

  let accounts: Signer[];

  let owner: SignerWithAddress;
  let actor: SignerWithAddress;
  let initializer: SignerWithAddress;

  let factory: WrappedBackedTokenFactory;
  let stablecoin: ERC20Mock;
  let tBillToken: ERC20Mock;
  let exchange: OrdersExchange;


  cacheBeforeEach(async () => {
    accounts = await ethers.getSigners();
    const getSigner = async (index: number): Promise<SignerWithAddress> => ({
      signer: accounts[index],
      address: await accounts[index].getAddress(),
    });

    owner = await getSigner(0)
    initializer = await getSigner(1)
    actor = await getSigner(2)

    stablecoin = await new ERC20Mock__factory(owner.signer).deploy(
      "BRLC",
      "Brazilian Real Coin",
      6
    );
    await stablecoin.mint(owner.address, 10000n*10n**18n);
    tBillToken = await new ERC20Mock__factory(owner.signer).deploy(
      "tBillToken",
      "T-Bill token",
      18
    );
    await tBillToken.mint(owner.address, 10000n*10n**18n);
    const implementation = await new OrdersExchange__factory(owner.signer).deploy()
    const proxyAdmin = await new ProxyAdmin__factory(owner.signer).deploy()
    const proxy = await new TransparentUpgradeableProxy__factory(owner.signer).deploy(
      implementation.getAddress(),
      proxyAdmin.getAddress(),
      implementation.interface.encodeFunctionData("initialize", [await stablecoin.getAddress()])
    )
    exchange = OrdersExchange__factory.connect(await proxy.getAddress(), owner.signer);
  });

  describe('#exampleFlow', () => {
    let amount: bigint;
    let recipient: string;
    cacheBeforeEach(async () => {
      amount = 10n ** 18n
      recipient = owner.address
    })
    const subject = async () => {
      // return exchange.connect(actor.signer).transfer(recipient, amount)
    };
    it('should work if controller is set to zero address', async () => {
      await exchange.registerToken(tBillToken);
      await stablecoin.approve(exchange, 100n*10n**18n);
      await exchange.scheduleOrder(
        tBillToken,
        100n*10n**18n,
        true
      )
      const currentEpoch = (await exchange.availableTokens(tBillToken)).currentEpoch;
      await exchange.closeEpoch(tBillToken, currentEpoch);
      await tBillToken.approve(exchange, 100n*10n**18n);
      await exchange.settleOrders(tBillToken, 10n**18n, currentEpoch);
    })
  })
});