import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InputNumber from "react-input-number";
import { BigNumber as type } from "ethers";
import { Button } from "./Button";
import { useDareDropContractRead, useAssetContractRead } from "./contracts";

type Props = {
    setAmount: (amount: BigNumber) => void;
    debouncedAmount: number;
    isConnected: boolean;
    depositResult: any; //tricky typing
    deposit: any; //tricky typing
    address: string;
    poolBalance: BigNumber | null;
    userAssetBalance: BigNumber | null;
    decimals: number | null;
    isMounted: boolean;
    symbol: string;
    lock: number | null;
    gameId: number | null;
};
const Dare = ({
    setAmount,
    debouncedAmount,
    isConnected,
    depositResult,
    deposit,
    address,
    poolBalance,
    userAssetBalance,
    decimals,
    isMounted,
    symbol,
    lock,
    gameId,
}: Props) => {
    const [_gameId, setGameId] = useState<number | null>(gameId);
    const [dareSuccess, setDareSuccess] = useState<boolean>(false);
    const [displayResult, setDisplayResult] = useState<boolean>(false);
    //  const [resultPending, setResultPending] = useState<boolean>(false);
    const [_lock, setLock] = useState<number | null>(lock);

    //    useEffect(() => {
    //        if (gameId !== gameId) {
    //            setGameId(gameId);
    //        }
    //    }, [gameId]);
    useEffect(() => {
        console.log("lock", lock);
        if (lock !== _lock && lock === 1) {
            setLock(1);
        }
        if (lock !== _lock && lock === 0) {
            setLock(0);
            handleResultDisplay();
        }
    }, [lock]);
    useEffect(() => {
        if (gameId !== _gameId) {
            setDareSuccess(true);
            setGameId(gameId);
        }
    }, [gameId]);
    const handleResultDisplay = () => {
        setTimeout(() => {
            setDisplayResult(true);
        }, 300);
        setTimeout(() => {
            setDisplayResult(false);
            setDareSuccess(false);
        }, 3000);
    };

    return (
        <>
            <div className="flex flex-col justify-around items-center h-full ">
                <span className=" font-semibold flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] relative top-7 md:right-[10.5rem]">
                    balance:{" "}
                    {isMounted && userAssetBalance && decimals
                        ? userAssetBalance / 10 ** decimals
                        : "??"}
                    &nbsp;{symbol ?? ""}
                </span>
                <span className="flex flex-row justify-around items-center h-1/8 w-[200px] text-center text-[#c9f2f2] absolute top-6 right-[1rem] break-words">
                    {isMounted && lock === 1
                        ? "dare result determination in progress..."
                        : ""}
                </span>

                <span className="flex flex-row justify-around items-center w-full ">
                    <InputNumber
                        disabled={!isConnected || lock === 1}
                        className="border-2 border-black p-2 h-1/2 w-1/2 md:w-[344px] bg-[#2B2A33] text-[#c9f2f2] h-[50px]"
                        placeholder="wager amount."
                        onChange={setAmount}
                    />
                    <Button
                        disabled={
                            debouncedAmount === 0 ||
                            !isConnected ||
                            lock === 1 ||
                            poolBalance.eq(0)
                        }
                        pending={depositResult.type === "pending"}
                        className={`text-base md:text-2xl font-semibold text-slate-800 h-1/2 flex flex-col justify-center items-center text-center w-1/4 md:w-[172px] bg-[#67a0fc] text-[#091f3f] disabled:bg-slate-400 disabled:bg-slate-400 hover:bg-[#c9f2f2]`}
                        onClick={(event) => {
                            event.preventDefault();
                            const toastId = toast.loading("Starting…");

                            deposit(true, debouncedAmount, (message: any) => {
                                toast.update(toastId, { render: message });
                            }).then(
                                () => {
                                    // TODO: show etherscan link?
                                    toast.update(toastId, {
                                        isLoading: false,
                                        type: "success",
                                        render: `Dare attempted!`,
                                        autoClose: 5000,
                                        closeButton: true,
                                    });
                                },
                                (error: any) => {
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
                        {"Submit"}
                    </Button>
                </span>
                <span className=" font-semibold flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] relative md:left-[12.25rem] bottom-4">
                    &#127942; win chance:{" "}
                    {isMounted && decimals && poolBalance !== null
                        ? poolBalance.eq(0)
                            ? 0
                            : BigNumber.from(debouncedAmount)
                                  .mul(0.75)
                                  .mul(10)
                                  .pow(decimals)
                                  .div(poolBalance)
                                  .mul(100).toNumber()
                        : "??"}
                    %
                </span>
                <span className=" font-semibold flex flex-row justify-around items-center h-1/8 text-[#c9f2f2] absolute left-6 bottom-7">
                    {displayResult ? (
                        dareSuccess ? (
                            <span>&#9989; dare success!</span>
                        ) : (
                            <span>&#10060; better luck next time!</span>
                        )
                    ) : (
                        <span />
                    )}
                </span>
            </div>
        </>
    );
};

export default Dare;
