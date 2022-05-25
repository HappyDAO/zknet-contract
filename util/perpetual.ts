import * as zksync from "zksync-web3";

import { Perpetual } from "../typechain-l2";
import { BaseRuntime } from "./base";

export const ERC20_ADDRESS = "0x3fad2b2e21ea1c96618cc76a42fb5a77c3f71c6f";

export class PerpetualRuntime extends BaseRuntime {
  public erc20Address: string;

  constructor(erc20Address?: string) {
    super();
    this.erc20Address = ERC20_ADDRESS;
    if (erc20Address !== undefined) {
      this.erc20Address = erc20Address;
    }
  }

  public async deployPerpetual(): Promise<Perpetual> {
    return (await this.deployL2Contract("Perpetual")) as Perpetual;
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
}
