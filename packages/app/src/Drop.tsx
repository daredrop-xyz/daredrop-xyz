import { useState } from "react";
import { toast } from "react-toastify";
import InputNumber from "react-input-number";
import { Button } from "./Button";
import { useDareDropContractRead, useAssetContractRead } from "./contracts";
import { useIsMounted } from "./useIsMounted";

type Props = {
    setAmount: (amount: number) => void;
    debouncedAmount: number;
    isConnected: boolean;
    depositResult: any; //tricky typing
    deposit: any; //tricky typing
    withdrawResult: any; //tricky typing
    withdraw: any; //tricky typing
    claimRewardsResult: any; //tricky typing
    claimRewards: any; //tricky typing
    address: string;
    userAssetBalance: number | null;
    userBalance: number | null;
    isMounted: boolean;
    rewards: number | null;
    decimals: number | null;
    symbol: string | null;
    poolBalance: number | null;
    lock: number | null;
};

const Drop = ({
    setAmount,
    debouncedAmount,
    isConnected,
    depositResult,
    deposit,
    withdrawResult,
    withdraw,
    claimRewardsResult,
    claimRewards,
    address,
    userAssetBalance,
    userBalance,
    isMounted,
    rewards,
    decimals,
    symbol,
    poolBalance,
    lock
}: Props) => {
    const [action, setAction] = useState("deposit");
    return (
        <>
            <div className="flex flex-col justify-around items-center h-full">
                <span className="flex flex-row sm:justify-center md:justify-around items-center h-1/8 text-[#c9f2f2] relative md:top-10  md:right-[10.5rem] font-semibold text-sm md:font-base">
                    balance:{" "}
                    {isMounted && userAssetBalance && decimals
                        ? userAssetBalance / 10 ** decimals
                        : "??"}
                    &nbsp;{symbol ?? ""}
                </span>
                <span className=" flex flex-row justify-around md:justify-between relative md:left-[12rem] w-[250px] md:w-[175px]">
                    <Button
                        className={`${action === "deposit" ? "text-slate-800" : "bg-slate-400 text-slate-800"} h-[25px] flex px-9 py-5 rounded-none justify-center items-center text-center w-[100px] md:w-[50px] bg-[#67a0fc]  text-sm font-semibold hover:bg-[#c9f2f2]`}
                        onClick={() => setAction("deposit")}
                    >Deposit</Button>
                    <Button
                        className={`${action === "withdraw" ? "text-slate-800" : "bg-slate-400 text-slate-800"} h-[25px] flex px-9 py-5 rounded-none justify-center items-center text-center w-[100px] md:w-[50px] bg-[#67a0fc] text-sm font-semibold hover:bg-[#c9f2f2]`}
                        onClick={() => setAction("withdraw")}
                    >Withdraw</Button>
                </span>

                <span className="flex flex-row justify-around items-center w-full ">
                    <InputNumber
                        disabled={!isConnected || lock === 1}
                     
                        className="border-2 border-black p-2 h-1/2 w-1/2 md:w-[344px] bg-[#2B2A33] text-[#c9f2f2] h-[50px]"
                        placeholder="amount"
                        onChange={setAmount}
                    />
                    <Button
                        disabled={debouncedAmount === 0 || !isConnected || lock === 1}
                        pending={depositResult.type === "pending"}
                        
                        className={`text-base md:text-2xl font-semibold text-slate-800 h-1/2 flex flex-col justify-center items-center text-center w-1/4 md:w-[172px] bg-[#67a0fc] text-[#091f3f] disabled:bg-slate-400 disabled:bg-slate-400 hover:bg-[#c9f2f2]`}
                        onClick={(event) => {
                            event.preventDefault();
                            const toastId = toast.loading("Starting…");
                            switch (action) {
                                case "deposit":
                                    deposit(
                                        false,
                                        debouncedAmount,
                                        (message:any) => {
                                            toast.update(toastId, {
                                                render: message,
                                            });
                                        }
                                    ).then(
                                        () => {
                                            // TODO: show etherscan link?
                                            toast.update(toastId, {
                                                isLoading: false,
                                                type: "success",
                                                render: `Transaction success!`,
                                                autoClose: 5000,
                                                closeButton: true,
                                            });
                                        },
                                        (error:any) => {
                                            toast.update(toastId, {
                                                isLoading: false,
                                                type: "error",
                                                render: String(error.message),
                                                autoClose: 5000,
                                                closeButton: true,
                                            });
                                        }
                                    );

                                    break;
                                case "withdraw":
                                    withdraw(debouncedAmount, (message:any) => {
                                        toast.update(toastId, {
                                            render: message,
                                        });
                                    }).then(
                                        () => {
                                            // TODO: show etherscan link?
                                            toast.update(toastId, {
                                                isLoading: false,
                                                type: "success",
                                                render: `Transaction success!`,
                                                autoClose: 5000,
                                                closeButton: true,
                                            });
                                        },
                                        (error:any) => {
                                            toast.update(toastId, {
                                                isLoading: false,
                                                type: "error",
                                                render: String(error.message),
                                                autoClose: 5000,
                                                closeButton: true,
                                            });
                                        }
                                    );

                                    break;
                            }
                        }}
                    >
                        {"Submit"}
                    </Button>
                </span>
                <span className=" font-semibold flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] relative right-[5rem] text-sm md:text-base md:right-[13.5rem]">
                    stake: {isMounted && userBalance !== null && decimals ? userBalance/10**decimals : "??"}&nbsp;{symbol}

                </span>
                <span className=" font-semibold flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] relative left-[4rem] text-sm md:text-base md:left-[12.25rem] bottom-6">
                    &#128176; rewards:{" "}
                    {isMounted && rewards !== null && userBalance !== null && decimals && poolBalance !== null
                        ? rewards === 0 || poolBalance === 0
                            ? 0
                            : Math.floor(
                                  10 ** decimals *
                                      (userBalance /
                                          poolBalance /
                                          10 ** decimals) *
                                      rewards
                              ) /
                              10 ** decimals
                        : "??"}
                    &nbsp;{symbol}
                </span>

                {/*
pan className="flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] relative top-3 right-[13.5rem]">
                    stake:{" "}
                    {isMounted && userBalance && decimals
                        ? userBalance / 10 ** decimals
                        : "??"}
                    &nbsp;{symbol ?? ''}
                </span>

                <span className="flex flex-row justify-around items-center h-1/4 w-full text-[#c9f2f2]">
                    <InputNumber
                        disabled={!isConnected}
                        className="border-2 border-black p-2 h-1/2 w-[344px] bg-[#2B2A33] text-[#c9f2f2] h-[50px]"
                        placeholder="withdraw amount"
                        onChange={setAmount}
                    />
                    <Button
                        className="h-1/2 flex flex-col justify-center items-center text-center w-[172px] bg-[#67a0fc] text-[#111827] text-xl"
                        disabled={debouncedAmount === 0 || !isConnected}
                        pending={withdraw.type === "pending"}
                        onClick={(event) => {
                            event.preventDefault();
                            const toastId = toast.loading("Starting…");

                            withdraw(debouncedAmount, (message) => {
                                toast.update(toastId, { render: message });
                            }).then(
                                () => {
                                    // TODO: show etherscan link?
                                    toast.update(toastId, {
                                        isLoading: false,
                                        type: "success",
                                        render: `Transaction success!`,
                                        autoClose: 5000,
                                        closeButton: true,
                                    });
                                },
                                (error) => {
                                    toast.update(toastId, {
                                        isLoading: false,
                                        type: "error",
                                        render: String(error.message),
                                        autoClose: 5000,
                                        closeButton: true,
                                    });
                                }
                            );
                        }}
                    >
                        {"Withdraw."}
                    </Button>
                </span>

                    }
                <s                {/*
                <span className="flex flex-row justify-around items-center h-1/4 w-full text-lime-300 ">
                    <span className="text-center flex flex-col justify-center items-center w-[344px]">
                        unclaimed rewards:{" "}
                        {isMounted && rewards
                            ? rewards
                            : "??"}
                    &nbsp; USDC
                    </span>
                    <Button
                        className="h-1/2 flex flex-col justify-center items-center  w-[172px]"
                        disabled={debouncedAmount === 0 || !isConnected}
                        pending={withdraw.type === "pending"}
                        onClick={(event) => {
                            event.preventDefault();
                            const toastId = toast.loading("Starting…");

                            claimRewards((message) => {
                                toast.update(toastId, { render: message });
                            }).then(
                                () => {
                                    // TODO: show etherscan link?
                                    toast.update(toastId, {
                                        isLoading: false,
                                        type: "success",
                                        render: `Rewards claimed!`,
                                        autoClose: 5000,
                                        closeButton: true,
                                    });
                                },
                                (error) => {
                                    toast.update(toastId, {
                                        isLoading: false,
                                        type: "error",
                                        render: String(error.message),
                                        autoClose: 5000,
                                        closeButton: true,
                                    });
                                }
                            );
                        }}
                    >
                        {"Claim."}
                    </Button>
                </span>
                  */}
            </div>
        </>
    );
};

export default Drop;
