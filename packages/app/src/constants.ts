
export default function getConfig(
    chainName?:string 
): { randomizer: string; asset: string } {
    let randomizer = "";
    let asset = "";

    switch (chainName) {
        case "Arbitrum Goerli":
            randomizer = "0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc";
            //arb goerli USDC 
            asset = "0x8fb1e3fc51f3b789ded7557e680551d93ea9d892";
            break;

        case "Arbitrum":
            randomizer = "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF";
        //arb one USDC 
            asset = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
            break;
        default:
            //default to arbitrum one 
            randomizer = "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF";
        //arb one USDC 
            asset = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
    }
    return {
        randomizer: randomizer,
        asset: asset,
    };
}
