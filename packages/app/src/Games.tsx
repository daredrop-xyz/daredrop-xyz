import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "./Button";
import { useClaimRewards } from "./hooks";
import Modal from "./Modal";
import { PendingIcon } from "./PendingIcon";
type Props = {
    connector: any;
    address: string;
    symbol: string;
    gameId: number;
    decimals: number;
};
export const Games = ({
    connector,
    address,
    symbol,
    gameId,
    decimals,
}: Props) => {
    const [initialQuery, setInitialQuery] = useState(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userRewards, setUserRewards] = useState<any>([]);
    const {
        claimRewardsResult,
        claimRewards,
        findGameIdsWithRewards,
    } = useClaimRewards({
        connector: connector,
        address: address,
        symbol: symbol,
    });
    const [start, setStart] = useState(gameId !== 0 ? gameId - 1 : null);
    const [end, setEnd] = useState(gameId - 20 > 0 ? gameId - 20 : 0);

    useEffect(() => {
        const fetchUserRewards = async () => {
            const _userRewards = start === null ? [] : await findGameIdsWithRewards(start, end);
            setUserRewards(_userRewards);
            setStart(end - 1);
            setEnd(end - 20 > 0 ? end - 20 : 0);
        setInitialQuery(true);
        };
        fetchUserRewards();
    }, []);
    useEffect(() => {
        if (isLoading) {
            const fetchUserRewards = async () => {
                if (isOpen) {
                    const _userRewards = start === null ? [] : await findGameIdsWithRewards(
                        start,
                        end
                    );
                    setUserRewards(userRewards.concat(_userRewards));
                    setStart(end - 1);
                    setEnd(end - 20 > 0 ? end - 20 : 0);
                }
            };
            setIsLoading(false);
            fetchUserRewards();
        }
    }, [isLoading]);

    return (
        <div className="absolute right-[1rem] top-[4rem] z-10 text-[#c9f2f2] ">
            {isOpen ? (
                <Modal
                    close={() => setIsOpen(false)}
                    className="-top-0 p-10 !overflow-auto w-[299px] md:!w-[600px] !h-[600px] md:!h-[800px]"
                    title="Unclaimed Rewards"
                    tstyle="relative  md:!text-5xl top-20 md:top-12 "
                    position="absolute -top-4"
                    //bg="opacity-0"
                >
                    <InfiniteScroll
                        height={700}
                        dataLength={userRewards.length}
                        scrollThreshold={1}
                        next={() => setIsLoading(true)}
                        hasMore={userRewards[userRewards.length - 1] === 0 ? false : true}
                        loader={
                            userRewards.length === 0 && initialQuery ? <span>No rewards found :(</span> :
                            <span className="flex justify-around items-center text-2xl p-3">
                                Loading...
                                <PendingIcon className="w-[2em] h-[2em]" />
                            </span>
                        }
                        endMessage={<span></span>}
                    >
                        <div className="relative -top-4 ">
                            {userRewards.map((gameId:any, index:any) => (
                                <span
                                    key={index}
                                    className="flex flex-row justify-around md:justify-between items-center text-2xl py-2"
                                >
                                    <span className="underline underline-offset-4">
                                        Game Id: {gameId}
                                    </span>
                                    <Button
                                        className="text-base bg-[#67a0fc] hover:bg-[#c9f2f2] text-[#091f3f] px-3 py-1 text-sm"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            const toastId =
                                                toast.loading("Starting...");
                                            claimRewards(gameId, (message) => {
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
                                                        autoClose: 3000,
                                                        closeButton: true,
                                                    });
                                                },
                                                (error) => {
                                                    toast.update(toastId, {
                                                        isLoading: false,
                                                        type: "error",
                                                        render: String(
                                                            error.message
                                                        ),
                                                        autoClose: 3000,
                                                        closeButton: true,
                                                    });
                                                }
                                            );
                                        }}
                                    >
                                        Claim
                                    </Button>
                                </span>
                            ))}
                        </div>
                    </InfiniteScroll>
                </Modal>
            ) : (
                <Button
                    className="relative md:static text-sm md:text-base bg-gradient-to-tl text-[#091f3f] hover:bg-gradient-to-tl hover:from-[#c9f2f2] hover:to-[#c9f2f2] from-[#67a0fc] to-[#67a0fc]  px-3 py-2"
                    onClick={() => setIsOpen(true)}
                >
                    Claim Rewards
                </Button>
            )}
        </div>
    );
};
