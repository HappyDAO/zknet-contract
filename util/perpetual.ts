import * as zksync from "zksync-web3";

import { ITrade, Perpetual } from "../typechain-l2";
import { BaseRuntime } from "./base";

export const ERC20_ADDRESS = "0x3fad2b2e21ea1c96618cc76a42fb5a77c3f71c6f";

const orderTypes = {
  Order: [
    { name: "id", type: "uint256" },
    { name: "typ", type: "string" },
    { name: "trader", type: "address" },
    { name: "positionId", type: "uint64" },
    { name: "positionToken", type: "uint32" },
    { name: "positionAmount", type: "int256" },
    { name: "fee", type: "uint256" },
    { name: "extend", type: "string" },
    { name: "timestamp", type: "uint32" },
  ],
};

export class PerpetualRuntime extends BaseRuntime {
  constructor(
    public erc20Address: string = ERC20_ADDRESS,
    private eip712DomainName: string = "ZKnet Perpetual",
    private eip712DomainVersion: string = "1",
    private eip712ChainId: number = 0,
  ) {
    super();
  }

  public async deployPerpetual(): Promise<Perpetual> {
    return (await this.deployL2Contract("Perpetual", [this.eip712DomainName, this.eip712DomainVersion])) as Perpetual;
  }

  public async prepareL2Wallet(ethAmount: string, erc20Amount?: string, l1PrivateKey?: string): Promise<zksync.Wallet> {
    const randWallet = await super.prepareL2Wallet(ethAmount, l1PrivateKey);

    if (erc20Amount !== undefined) {
      // deposit erc20 to l2
      await (
        await this.deployWallet.deposit({
          to: randWallet.address,
          token: this.erc20Address,
          amount: erc20Amount,
          approveERC20: true,
        })
      ).wait();
    }

    return randWallet;
  }

  public async signOrder(
    wallet: zksync.Wallet,
    contractAddress: string,
    order: ITrade.OrderStruct,
  ): Promise<ITrade.OrderStruct> {
    const domain = {
      name: this.eip712DomainName,
      version: this.eip712DomainVersion,
      chainId: this.eip712ChainId,
      verifyingContract: contractAddress,
    };

    order.trader = wallet.address;
    const message = {
      id: order.id,
      typ: order.typ,
      trader: order.trader,
      positionId: order.positionId,
      positionToken: order.positionToken,
      positionAmount: order.positionAmount,
      fee: order.fee,
      extend: order.extend,
      timestamp: order.timestamp,
    };
    order.signature = await wallet._signTypedData(domain, orderTypes, message);
    return order;
  }
}
