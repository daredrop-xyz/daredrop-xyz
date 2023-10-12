import { BigNumber } from "ethers";
import { usePromiseFn } from "../hooks/usePromiseFn";
import { switchChain } from "../switchChain";
import { extractContractError } from "../extractContractError";
import { promiseNotify } from "../promiseNotify";
import { pluralize } from "../pluralize";
import getConfig from "../constants";
import { provider, targetChainId } from "../EthereumProviders";
import {
    dareDropContract as DareDropContract,
    assetContract,
} from "../contracts";
import DareDropContractData from "@web3-scaffold/contracts/deploys/arbitrum/DareDropContract.json";

type Props = {
    //@TODO strict typing
    connector: any;
    address: string;
    chain: any;
    fee: BigNumber;
    symbol: string;
};
const useDeposit = ({ connector, address, chain, fee, symbol }: Props) => {
    const [depositResult, deposit] = usePromiseFn(
        async (
            isDare: boolean,
            quantity: number,
            onProgress: (message: string) => void
        ) => {
            if (!connector) {
                throw new Error("Wallet not connected");
            }
            if (!address) {
                throw new Error("address not found");
            }

            const assetAddress = getConfig(
                chain ? chain.name : "Arbitrum"
            ).asset;

            onProgress("Preparing wallet…");
            await switchChain(connector);
            const signer = await connector.getSigner();
            const contract = DareDropContract.connect(signer);
            let underlyingAssetContract = assetContract(assetAddress);
            underlyingAssetContract = underlyingAssetContract.connect(signer);

            const allowance = await underlyingAssetContract.allowance(
                address,
                DareDropContractData.deployedTo
            );
            const decimals = await underlyingAssetContract.decimals();

            let num;
            try {
                num = BigNumber.from(quantity * 10 ** decimals);
            } catch {
                num = BigNumber.from(quantity).mul(10 ** decimals);
            }

            console.log("allowance", allowance);
            console.log("numAmount", num.toString());
            if (allowance.gt(num)) {
                try {
                    onProgress(
                        isDare
                            ? `Daring with a wager of ${pluralize(
                                  quantity,
                                  symbol,
                                  symbol
                              )} ...`
                            : `Depositing ${pluralize(
                                  quantity,
                                  symbol,
                                  symbol
                              )} into the pool…`
                    );

                    const tx = await promiseNotify(
                        isDare
                            ? contract.dare(num.toString(), {
                                  value: fee.toString(),
                              })
                            : contract.drop(num.toString())
                    ).after(1000 * 5, () =>
                        onProgress("Please confirm transaction in your wallet…")
                    );

                    console.log("deposit tx", tx);

                    onProgress("Finalizing transaction…");
                    const receipt = await promiseNotify(tx.wait())
                        .after(1000 * 15, () =>
                            onProgress(
                                "It can sometimes take a while to finalize a transaction…"
                            )
                        )
                        .after(1000 * 30, () =>
                            onProgress("Still working on it…")
                        );
                    console.log("deposit receipt", receipt);

                    return { receipt };
                } catch (error) {
                    console.error("Transaction error:", error);
                    const contractError = extractContractError(error);
                    throw new Error(`Transaction error: ${contractError}`);
                }
            } else {
                try {
                    onProgress(`Approving…`);

                    const tx = await promiseNotify(
                        underlyingAssetContract.approve(
                            DareDropContractData.deployedTo,
                            num.toString()
                        )
                    ).after(1000 * 5, () =>
                        onProgress("Please confirm transaction in your wallet…")
                    );
                    console.log("deposit tx", tx);

                    onProgress("Finalizing transaction…");
                    const receipt = await promiseNotify(tx.wait())
                        .after(1000 * 15, () =>
                            onProgress(
                                "It can sometimes take a while to finalize a transaction…"
                            )
                        )
                        .after(1000 * 30, () =>
                            onProgress("Still working on it…")
                        );
                    console.log("approve receipt", receipt);

                    //   return { receipt };
                } catch (error) {
                    console.error("Transaction error:", error);
                    const contractError = extractContractError(error);
                    throw new Error(`Transaction error: ${contractError}`);
                }
                try {
                    onProgress(
                        isDare
                            ? `Daring with a wager of ${pluralize(
                                  quantity,
                                  symbol,
                                  symbol
                              )} ...`
                            : `Depositing ${pluralize(
                                  quantity,
                                  symbol,
                                  symbol
                              )} into the pool…`
                    );

                    const tx = await promiseNotify(
                        isDare
                            ? contract.dare(num.toString(), {
                                  value: fee,
                              })
                            : contract.drop(num.toString())
                    ).after(1000 * 5, () =>
                        onProgress("Please confirm transaction in your wallet…")
                    );

                    console.log("deposit tx", tx);

                    onProgress("Finalizing transaction…");
                    const receipt = await promiseNotify(tx.wait())
                        .after(1000 * 15, () =>
                            onProgress(
                                "It can sometimes take a while to finalize a transaction…"
                            )
                        )
                        .after(1000 * 30, () =>
                            onProgress("Still working on it…")
                        );
                    console.log("mint receipt", receipt);

                    return { receipt };
                } catch (error) {
                    console.error("Transaction error:", error);
                    const contractError = extractContractError(error);
                    throw new Error(`Transaction error: ${contractError}`);
                }
            }
        },
        [connector, address, fee]
    );

    return { depositResult: depositResult, deposit: deposit };
};

export default useDeposit;
