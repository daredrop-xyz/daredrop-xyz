import { BigNumber } from "ethers";
import { usePromiseFn } from "../usePromiseFn";
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
    symbol: string;
};
const useWithdraw = ({ connector, address, chain, symbol }: Props) => {
    const [withdrawResult, withdraw] = usePromiseFn(
        async (quantity: number, onProgress: (message: string) => void) => {
            if (!connector) {
                throw new Error("wallet not connected");
            }
            if (!address) {
                throw new Error("address not found");
            }
            const assetAddress = getConfig(
                chain ? chain.name : "Arbitrum"
            ).asset;

            onProgress("Preparing wallet...");
            await switchChain(connector);
            const signer = await connector.getSigner();
            const contract = DareDropContract.connect(signer);
            let underlyingAssetContract = assetContract(assetAddress);

            underlyingAssetContract = underlyingAssetContract.connect(signer);
            const decimals = await underlyingAssetContract.decimals();
            let num;
            try {
                num = BigNumber.from(quantity * 10 ** decimals);
            } catch {
                num = BigNumber.from(quantity).mul(10 ** decimals);
            }
            try {
                onProgress(
                    `Withdrawing ${pluralize(
                        quantity,
                        symbol,
                        symbol
                    )} from the pool...`
                );

                const tx = await promiseNotify(
                    contract.withdraw(num.toString())
                ).after(1000 * 5, () =>
                    onProgress("Please confirm transaction in your wallet...")
                );
                console.log("withdraw tx", tx);
                onProgress("Finalizing transaction...");
                const receipt = await promiseNotify(tx.wait())
                    .after(1000 * 15, () =>
                        onProgress(
                            "It can sometimes take a while to finalize a transaction.."
                        )
                    )
                    .after(1000 * 30, () =>
                        onProgress("Still working on it...")
                    );
                console.log("withdraw receipt", receipt);

                return { receipt };
            } catch (error) {
                console.error("transaction error: ", error);
                const contractError = extractContractError(error);
                throw new Error(`Transaction Error: ${contractError}`);
            }
        },
        [connector, address]
    );

    return { withdrawResult: withdrawResult, withdraw: withdraw };
};

export default useWithdraw;
