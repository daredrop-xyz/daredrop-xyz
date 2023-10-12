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

//arbitrum mainnet network ID
export const targetChainId = 42161;

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
