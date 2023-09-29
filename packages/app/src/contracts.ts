import DareDropContractData from "@web3-scaffold/contracts/deploys/arbitrum/DareDropContract.json";
import {
    DareDropContract__factory,
    ERC20__factory,
} from "@web3-scaffold/contracts/types";
import { useContractRead } from "wagmi";

import { provider, targetChainId } from "./EthereumProviders";
import { randomizerAbi } from "./abi/randomizer";
import getConfig from "./constants";

export const dareDropContract = DareDropContract__factory.connect(
    DareDropContractData.deployedTo,
    provider({ chainId: targetChainId })
);

export const assetContract = (address: string) => {
    return ERC20__factory.connect(
        address,
        provider({ chainId: targetChainId })
    );
};

export const useAssetContractRead = (
    readConfig: Omit<Parameters<typeof useContractRead>[0], "address" | "abi">
) =>
    useContractRead({
        ...readConfig,
        address: getConfig().asset,
        abi: ERC20__factory.abi,
    });

export const useDareDropContractRead = (
    readConfig: Omit<Parameters<typeof useContractRead>[0], "address" | "abi">
) =>
    useContractRead({
        ...readConfig,
        address: DareDropContractData.deployedTo,
        abi: DareDropContract__factory.abi,
    });

//export const useRandomizerContractRead = (
//    readConfig: Omit<Parameters<typeof useContractRead>[0], "abi">
//) =>
//    useContractRead({
//        ...readConfig,
//        abi: randomizerAbi,
//    });
