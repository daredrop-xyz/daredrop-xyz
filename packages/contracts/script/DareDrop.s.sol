// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/DareDrop.sol";

contract DareDropScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        address randomizer_arb_goerli = 0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc;
        address usdc_arb_goerli = 0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892;

        address randomizer_arb_one = 0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF;
        address usdc_arb_one = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

        DareDropContract DareDrop = new DareDropContract(randomizer_arb_one, usdc_arb_one);

        vm.stopBroadcast();


    }





}
