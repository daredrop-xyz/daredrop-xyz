import { useState } from "react";
import { useDebounce } from "use-debounce";
import { BigNumber as type } from "ethers";
import Modal from "./Modal";
import Dare from "./Dare";
import Drop from "./Drop";
import { Button } from "./Button";
import { useDeposit, useWithdraw, useClaimRewards } from "./hooks";

type Props = {
    dareFee: BigNumber;
    poolBalance: BigNumber;
    lock: number;
    rewards: BigNumber;
    decimals: number;
    gameId: BigNumber;
    userBalance: BigNumber;
    userAssetBalance: BigNumber;
    isMounted: boolean;
    chain: any; //@TODO strict typing
    connector: any; //@TODO strict typing
    address: string; 
    symbol: string;
};
export const Interact = ({dareFee, poolBalance, lock, rewards, decimals, gameId, userBalance, userAssetBalance, chain, connector, address, isMounted, symbol}: Props) => {
    const [isApproved, setIsApproved] = useState(false);
    const [amount, setAmount] = useState<amount>(0);
    const [debouncedAmount] = useDebounce(amount, 500);
    const [isDare, setIsDare] = useState<"dare" | "drop" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const { depositResult, deposit } = useDeposit({
        connector: connector,
        address: address,
        chain: chain,
        fee: dareFee,
        symbol: symbol
    });
    const { withdrawResult, withdraw } = useWithdraw({
        connector: connector,
        address: address,
        chain: chain,
        symbol: symbol
    });
    const { claimRewardsResult, claimRewards } = useClaimRewards({
        connector: connector,
        address: address,
        symbol: symbol
    });
    const triggerModal = (action: "dare" | "drop" | null) => {
        setAmount(0);
        if (action === "dare") {
            setIsDare("dare");
        }
        if (action === "drop") {
            setIsDare("drop");
        }
        if(action === null) {
            setIsDare(null);

        }

        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-around absolute bottom-40 md:bottom-20  w-full">
                <Button
                    className={` m-4 md:m-0 bg-gradient-to-tl text-[#091f3f] relative md:right-40 hover:bg-gradient-to-tl hover:from-[#c9f2f2] hover:to-[#c9f2f2] ${ isDare === "dare" ? "from-[#c9f2f2] to-[#67a0fc] z-40 hover:from-[#c9f2f2] hover:to-[#67a0fc] hover:cursor-default" : " from-[#67a0fc] to-[#67a0fc]"} `}
                    onClick={() => triggerModal("dare")}
                >
                    Dare
                </Button>
                <Button
                    className={` m-4 md:m-0 bg-gradient-to-tl ${ isDare === "drop" ? "from-[#c9f2f2] to-[#67a0fc] z-40 hover:from-[#c9f2f2] hover:to-[#67a0fc] hover:cursor-default" : "from-[#67a0fc] to-[#67a0fc] "} text-[#091f3f] relative md:left-40  hover:from-[#c9f2f2] hover:to-[#c9f2f2]`}
                    onClick={() => triggerModal("drop")}
                >
                    Drop
                </Button>
            </div>

            {isModalOpen ? (
                <Modal
                    close={() => triggerModal(null)}
                    position="flex justify-center items-center"
                    className="!w-[300px] md:!w-[600px] !h-[200px] -top-40 md:!top-20 "

                >
                    {isDare === "dare" ? (
                        <Dare
                            setAmount={setAmount}
                            debouncedAmount={debouncedAmount}
                            isConnected={!!connector}
                            depositResult={depositResult}
                            deposit={deposit}
                            address={address}
                            poolBalance={poolBalance}
                            userAssetBalance={userAssetBalance}
                            decimals={decimals}
                            isMounted={isMounted}
                            symbol={symbol}
                            lock={lock}
                            gameId={gameId}
                        />
                    ) : (
                        <Drop
                            address={address}
                            setAmount={setAmount}
                            debouncedAmount={debouncedAmount}
                            isConnected={!!connector}
                            depositResult={depositResult}
                            poolBalance={poolBalance}
                            deposit={deposit}
                            withdrawResult={withdrawResult}
                            withdraw={withdraw}
                            claimRewardsResult={claimRewardsResult}
                            claimRewards={claimRewards}
                            userAssetBalance={userAssetBalance}
                            userBalance={userBalance}
                            isMounted={isMounted}
                            rewards={rewards}
                            decimals={decimals}
                            symbol={symbol}
                            lock={lock}
                        />
                    )}
                </Modal>
            ) : null}
            
        </>
    );
};
