import { usePromiseFn } from "../usePromiseFn";
import { switchChain } from "../switchChain";
import { useDareDropContractRead } from "../contracts";
import { extractContractError } from "../extractContractError";
import { promiseNotify } from "../promiseNotify";
import getConfig from "../constants";
import { dareDropContract as DareDropContract } from "../contracts";

import { provider, targetChainId } from "../EthereumProviders";

type Props = {
    //@TODO strict typing
    connector: any;
    address: string;
    symbol: string;
};
const useClaimRewards = ({ connector, address, symbol }: Props) => {
    const findGameIdsWithRewards = async (
        upperBound: number,
        lowerBound: number
    ) => {
        await switchChain(connector);
        const signer = await connector.getSigner();
        const contract = await DareDropContract.connect(signer);
        const unclaimedRewards = [];
        for (let i = upperBound; i >= lowerBound; i--) {
            const userBalance = await contract.userBalance(address, i);
            if (userBalance.toNumber() > 0) {
                unclaimedRewards.push(i);
            }
        }

        return unclaimedRewards;
    };
    const findRewards = async (gameId: any) => {
        await switchChain(connector);
        const signer = await connector.getSigner();
        const contract = await DareDropContract.connect(signer);
        const game = await DareDropContract.games(gameId);
        const userBalance = await contract.userBalance(address, gameId);
        const rewards = game[0].toNumber();
        const poolBalance = game[1].toNumber();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const userRewards = (rewards * userBalance) / poolBalance;
        return userRewards;
    };
    const [claimRewardsResult, claimRewards] = usePromiseFn(
        async (gameId: number, onProgress: (message: string) => void) => {
            if (!connector) {
                throw new Error("wallet not connected");
            }
            if (!address) {
                throw new Error("address not found");
            }

            onProgress("Preparing wallet...");
            await switchChain(connector);
            const signer = await connector.getSigner();
            const contract = DareDropContract.connect(signer);
            try {
                onProgress(`Claiming ${symbol} rewards...`);

                const tx = await promiseNotify(
                    contract.claimRewards(gameId)
                ).after(1000 * 5, () =>
                    onProgress("Please confirm transaction in your wallet...")
                );
                console.log("claimRewards tx", tx);
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
                console.log("claimRewards receipt", receipt);

                return { receipt };
            } catch (error) {
                console.error("transaction error: ", error);
                const contractError = extractContractError(error);
                throw new Error(`Transaction Error: ${contractError}`);
            }
        },
        [connector, address]
    );

    return {
        claimRewardsResult: claimRewardsResult,
        claimRewards: claimRewards,
        findGameIdsWithRewards: findGameIdsWithRewards,
        findRewards: findRewards,
    };
};

export default useClaimRewards;
