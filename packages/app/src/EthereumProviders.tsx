import "@rainbow-me/rainbowkit/styles.css";

import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
} from "@rainbow-me/rainbowkit";
import {
    //  chain,
    configureChains,
    createClient,
    WagmiConfig,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { arbitrum, arbitrumGoerli } from "wagmi/chains";

// Will default to arb one if nothing set in the ENV
export const targetChainId = 42161;
//
// filter down to just arb mainnet + optional target testnet chain so that rainbowkit can tell
// the user to switch network if they're on an alternative one
//const targetChains = defaultChains;
//    .filter(
//  (chain) => chain.id === 42161 || chain.id === targetChainId
//);

export const { chains, provider, webSocketProvider } = configureChains(
    [arbitrum],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: "DareDrop",
    chains,
});

export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider,
});

export const EthereumProviders: React.FC = ({ children }) => (
    <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
            theme={midnightTheme()}
            chains={chains}
        >
            {children}
        </RainbowKitProvider>
    </WagmiConfig>
);
