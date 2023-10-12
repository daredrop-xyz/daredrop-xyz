# Daredrop

## A decentralized, modular, non-custodial gambling game offering 20% real yield to liquidity providers provided by the appetite for risk.

### How it works:

Users can either deposit tokens into the drop pool and earn rewards for unsuccessful dare attempts, or attempt dares to try to win the pot.

Dares include a wager amount chosen by the user. Winning chances are directly proportional to wager amount in relation to pool size
Ex. pool size is 100K USDC. A user attempts a dare with a wager amount of 1K USDC. The likelihood they win the pot is 1%, (wager amount/pool size = 1/100).

If the outcome is unsuccessful, wager tokens are distributed as rewards to stakers in the pool.
Rewards are directly proportional to each user's pool share. For example, the 100K USDC is sourced equally from 10 wallets of 10K USDC deposits each. Each wallet in the pool will earn 10% of rewards.

But there's a catch! In the live contract, there's a 25% cut taken out of each dare attempt.

20% in gratuity favored towards the pool, 5% in fees.
What this means is in order for someone to have a 100% chance of winning the pot, they would have to bet at least ~130% of the pot.
Ex. pool size is 100K. The minimum bet to guarantee a win is ~134K USDC (134 * 0.75 ~= 100).
In turn, the 134K tokens are distributed as rewards to pool stakers.

Stakers earn 20% ROI on their deposit!
Effectively this means the expected ROI for deposits are 20%. Sometimes less, sometimes more. But, over time, the returns for deposits will trend towards 20% ROI.
Liquidity providers earn 20% ROI. And that's real yield, not DeFi yield farm imaginary number APRs. Real, tangible, 20% ROI expected value, fueled by the love of gambling.

Important things to note:

- Rewards are not claimable until games are completed. Games are not completed until a dare attempt is successful.
- Reward pool size for each game goes up with each unsuccessful dare attempt.
- IF you withdraw before a game is completed, you are no longer eligible for rewards!
- In turn, rewards for users still in the pool after each withdrawal goes up as their total pool share increases.

When someone wins a dare, the entire pool is sent directly to their wallet. No need to claim!
Dare results are determined by @RandomizerAi VRF. VRF fees are paid for, in ETH, by the user submitting the dare. Fees are cheap, though!
VRF Requests are made with each dare attempt, and in turn, deposits/withdrawals are locked until the VRF request is fulfilled.

@RandomizerAi beacons are decentralized, so response time may vary, but usually takes around ten seconds.

USDC Pools are live currently. In the future, with enough popular demand, other asset pools (WETH, etc., any ERC20) can be deployed!

The contract is not audited. Invest at your own risk.

Play here: [daredrop.xyz](https://www.daredrop.xyz/)

Contract: [Arbiscan Contract Link](https://arbiscan.io/address/0xee7155c76f9dfa1c1a18525b33cfb93a04bfb220#code)





### running locally:
please see `scaffold.md` for local environment outline/setup.
