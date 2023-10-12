import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Image from "next/image";
import { useFeeData, useContractRead, useNetwork, useAccount } from "wagmi";

import { useDareDropContractRead, useAssetContractRead } from "../contracts";
import { Interact } from "../Interact";
import { Games } from "../Games";
import { useIsMounted } from "../useIsMounted";
import { randomizerAbi } from "../abi/randomizer";
import { BigNumber as type } from "ethers";
import getConfig from "../constants";
import Logo from "../assets/logo.png";

const HomePage: NextPage = () => {
    const { chain } = useNetwork();
    const { connector, address } = useAccount();
    const randomizerAddress = getConfig(
        chain ? chain.name : "Arbitrum"
    ).randomizer;
    const assetAddress = getConfig(
        chain ? chain.name : "Arbitrum"
    ).asset;

    const [_poolBalance, setPoolBalance] = useState<BigNumber | null>(null);
    const [_lock, setLock] = useState<number | null>(null);
    const [_rewards, setRewards] = useState<BigNumber | null>(null);
    const [_decimals, setDecimals] = useState<number | null>(null);
    const [_symbol, setSymbol] = useState<string | null>(null);
    const [_gameId, setGameId] = useState<number | null>(null);
    const [_userBalance, setUserBalance] = useState<BigNumber | null>(null);
    const [_userAssetBalance, setUserAssetBalance] = useState<BigNumber | null>(
        null
    );
    const [_dareFeePriceData, setDareFeePriceData] = useState<BigNumber | null>(
        null
    );

    const { data: feeData }: any = useFeeData({ watch: true });
    const { data: dareFeePriceData }: any = useContractRead({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        name: "randomizer",
        address: randomizerAddress,
        abi: randomizerAbi,
        functionName: "estimateFeeUsingGasPrice",
        args: [200000, feeData?.gasPrice ?? 100000000],
        watch: true,
        onSuccess(data: any) {
            setDareFeePriceData(data.mul(150).div(100));
        },
    });

    const poolBalance: any = useDareDropContractRead({
        functionName: "getPoolBalance",
        watch: true,
        onSuccess(data: any) {
            setPoolBalance(data);
        },
    });
    const lock: any = useDareDropContractRead({
        functionName: "lock",
        watch: true,
        onSuccess(data: any) {
            setLock(data);
        },
    });
    const rewards: any = useDareDropContractRead({
        functionName: "getRewards",
        watch: true,
        onSuccess(data: any) {
            setRewards(data);
        },
    });
    const decimals: any = useAssetContractRead({
        functionName: "decimals",
        watch: true,
        onSuccess(data: any) {
            setDecimals(data);
        },
    });
    const symbol: any = useAssetContractRead({
        functionName: "symbol",
        watch: true,
        onSuccess(data: any) {
            setSymbol(data);
        },
    });

    const gameId: any = useDareDropContractRead({
        functionName: "gameId",
        watch: true,
        onSuccess(data: any) {
            setGameId(data.toNumber());
        },
    });
    const userBalance: any = useDareDropContractRead({
        functionName: "userBalance",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        args: [address, gameId.data ?? gameId.data],
        watch: true,
        onSuccess(data: any) {
            setUserBalance(data);
        },
    });
    const userAssetBalance: any = useAssetContractRead({
        functionName: "balanceOf",
        args: [address],
        watch: true,
        onSuccess(data: any) {
            setUserAssetBalance(data);
        },
    });

    const isMounted = useIsMounted();

    //isMounted &&
    //                  _dareFeePriceData &&
    //                  _poolBalance &&
    //                  _lock &&
    //                  _rewards &&
    //                  _decimals &&
    //                  _gameId &&
    //                  _userBalance &&
    //                  _userAssetBalance &&
    //                  _symbol ? (
    //
//    console.log("\n\n\n\n\n\n\n\n\n\n\n");
//    console.log("isMounted", isMounted);
//    console.log("_dareFeePriceData", _dareFeePriceData);
//    console.log("_poolBalance", _poolBalance);
//    console.log("_lock", _lock);
//    console.log("_rewards", _rewards);
//    console.log("_decimals", _decimals);
//    console.log("_gameId", _gameId);
//    console.log("_userBalance", _userBalance);
//    console.log("_userAssetBalance", _userAssetBalance);
//    console.log("_symbol", _symbol);
//    console.log("\n\n\n\n\n\n\n\n\n\n\n");

    return (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
            <div className="self-end p-2 z-20">
                <ConnectButton accountStatus="address" />
            </div>
            <div className="flex-grow flex flex-col gap-4 items-center justify-around p-8 pb-[50vh] ">
                <div className=" w-[300px] md:w-[750px] absolute mb-60 ">
                    <Image
                        src={Logo}
                        className="object-cover !hidden md:!block"
                        alt="brand logo"
                    />
                </div>
                {connector &&
                _symbol &&
                _gameId !== null &&
                _gameId >= 0 &&
                _decimals ? (
                    <Games
                        connector={connector}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        address={address}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore

                        symbol={_symbol}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore

                        gameId={_gameId}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore

                        decimals={_decimals}
                    />
                ) : (
                    <span className="absolute"></span>
                )}

                {/*
                    <h1 className="text-4xl text-slate-300 p-10 bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce relative top-10">
                    Dare or Drop!
                    </h1>

                  */}

                {/* Use isMounted to temporarily workaround hydration issues where
                    server-rendered markup doesn't match the client due to localStorage
                    caching in wagmi. See https://github.com/holic/web3-scaffold/pull/26 */}
                <div className=" flex flex-col items-center gap-8 justify-around relative top-40 md:top-20 ">
                    <p className=" text-2xl md:text-3xl text-slate-300 ">
                        <span className="">current game id:</span>
                        &nbsp;
                        <span className="text-[#c9f2f2] bg-slate-800">
                            {(isMounted && _gameId !== null
                                ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  //@ts-ignore

                                  _gameId
                                : null) ?? "??"}
                        </span>{" "}
                    </p>

                    <p className=" text-2xl md:text-3xl text-slate-300 ">
                        <span className=""> pool balance :</span>
                        &nbsp;
                        <span className="text-[#c9f2f2] bg-slate-800">
                            {isMounted && _poolBalance !== null && _poolBalance >= 0 && _decimals
                                ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  //@ts-ignore

                                  _poolBalance /
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  //@ts-ignore

                                  10 ** _decimals
                                : null ?? "??"}
                        </span>{" "}
                        <span className="text-[#c9f2f2]">
                            {isMounted && _symbol ? _symbol : "??"}
                        </span>
                    </p>
                    <p className="text-2xl md:text-3xl text-slate-300 ">
                        <span className="">pool rewards:</span>
                        &nbsp;
                        <span className="text-[#c9f2f2] bg-slate-800">
                            {(isMounted && _rewards !== null && _rewards >= 0 &&  _decimals
                                ? (_rewards / 10 ** _decimals).toString()
                                : null) ?? "??"}
                        </span>{" "}
                        <span className="text-[#c9f2f2]">
                            {isMounted && _symbol ? _symbol : "??"}
                        </span>
                    </p>
                    {/*
                        <p className=" text-3xl text-slate-300 flex flex-col justify-around">
                        <span className="">most recent successful dare:</span>
                        &nbsp;
                        <span className="text-lime-300 bg-slate-800 text-center flex flex-row justify-around">
                        <span>wager:</span>
                        <span className="text-cyan-300">USDC</span>
                        </span>{" "}
                        <span className="text-lime-300 bg-slate-800 text-center flex flex-row justify-around">
                        <span>payout:</span>
                        <span className="text-cyan-300">USDC</span>
                        </span>{" "}
                        </p>
                      */}
                    <div className="relative top-[28rem]  w-full">
                        {isMounted &&
                        _dareFeePriceData &&
                        _poolBalance !== null &&
                        _poolBalance >= 0 &&
                        _lock !== null &&
                        _lock >= 0 &&
                        _rewards !== null &&
                        _rewards >= 0 &&
                        _decimals &&
                        _gameId !== null &&
                        _gameId >= 0 &&
                        _userBalance !== null &&
                        _userBalance >= 0 &&
                        _userAssetBalance !== null &&
                        _userAssetBalance >= 0 &&
                        _symbol ? (
                            <Interact
                                dareFee={_dareFeePriceData}
                                poolBalance={_poolBalance}
                                lock={_lock}
                                rewards={_rewards}
                                decimals={_decimals}
                                gameId={_gameId}
                                userBalance={_userBalance}
                                userAssetBalance={_userAssetBalance}
                                isMounted={isMounted}
                                chain={chain}
                                connector={connector}
                                address={address ?? ""}
                                symbol={_symbol}
                            />
                        ) : (
                            <span></span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
