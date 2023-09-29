// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.9;

import "forge-std/Test.sol";
//import "./forge-std/Cheats.sol";



import {ERC20} from "@solmate/src/tokens/ERC20.sol";
import { DareDropContract } from "../src/DareDrop.sol";


interface IRandomizer {
    function request(uint256 callbackGasLimit) external returns(uint256);

    function estimateFee(uint256 callbackGasLimit) external returns (uint256);

    function clientDeposit(address client) external payable;

    function clientWithdrawTo(address payable to, uint256 amount) external;

    function getFeeStats(uint256 request) external view returns(uint256[2] memory);

    function clientBalanceOf(address _client) external view returns (uint256 deposit, uint256 reserved);

    function getRequest(uint256 request) external view returns (bytes32 result, bytes32 dataHash, uint256 ethPaid, uint256 ethRefunded, bytes10[2] memory vrfHashes);

}


contract DummyRandomizerContract {
    // Struct to hold the details of a request
    struct SRequest {
        bytes32 result;
        uint256 callbackGasLimit;
        uint256 ethPaid;
        address client;
    }

    // Events to be emitted
    event Request(uint256 indexed id);
    event Result(uint256 indexed id, bytes32 result);
    event CallbackFailed(uint256 indexed id, bytes data);

    // Mapping to store request data
    mapping(uint256 => SRequest) public requests;

    mapping(address => uint256) public clientToDeposit;

    // Counter for request ids
    uint256 public requestCounter;


    function clientBalanceOf(address _client) external view returns (uint256 deposit, uint256 reserved) {
        return (0,0);

    }

    // Function to make a Randomizer VRF callback request with a callback gas limit
    function request(uint256 callbackGasLimit) external returns (uint256) {
        uint256 fee = estimateFee(callbackGasLimit);
        require(
            clientToDeposit[msg.sender] >= fee,
            "Randomizer: insufficient funds"
        );
        requestCounter++;
        requests[requestCounter] = SRequest(0, callbackGasLimit, 0, msg.sender);
        emit Request(requestCounter);
        return requestCounter;
    }

    function request(
        uint256 callbackGasLimit,
        uint256 confirmations
    ) external returns (uint256) {
        uint256 fee = estimateFee(callbackGasLimit);
        require(
            clientToDeposit[msg.sender] >= fee,
            "Randomizer: insufficient funds"
        );
        requestCounter++;
        requests[requestCounter] = SRequest(
            0,
            callbackGasLimit,
            fee,
            msg.sender
        );
        emit Request(requestCounter);
        return requestCounter;
    }

    // Function to estimate the VRF fee given a callback gas limit and confirmations
    function estimateFee(
        uint256 callbackGasLimit,
        uint256 confirmations
    ) public view returns (uint256) {
        // This is a dummy implementation, adjust as needed
        return callbackGasLimit * _maxGasPriceAfterConfirmations(confirmations);
    }

    // Function to estimate the VRF fee given a callback gas limit and 1 confirmation
    function estimateFee(
        uint256 callbackGasLimit
    ) public view returns (uint256) {
        // This is a dummy implementation, adjust as needed
        return callbackGasLimit/50; //* _maxGasPriceAfterConfirmations(1);
        //commenting the rest of that comment out bc I think it only works when you run test with --fork-url or w/e the arg flag is. 
        //was returning zero due to block.basefee being weird with anvil RPC I think.
    }

    // Function to deposit ETH to Randomizer for the client contract
    function clientDeposit(address client) external payable {
        clientToDeposit[client] += msg.value;
    }

    // Function to withdraw deposited ETH from the client contract to the destination address
    function clientWithdrawTo(address to, uint256 amount) external {
        require(
            clientToDeposit[msg.sender] >= amount,
            "Randomizer: insufficient funds"
        );
        clientToDeposit[msg.sender] -= amount;
        payable(to).transfer(amount);
    }

    // Function to return the fee paid by and refunded to the client
    function getFeeStats(uint256 id) external view returns (uint256[2] memory) {
        return [requests[id].ethPaid, 0];
    }

    function getRequest(
        uint256 _request
    )
    external
    view
    returns (
        bytes32 result,
        bytes32 dataHash,
        uint256 ethPaid,
        uint256 ethRefunded,
        bytes10[2] memory vrfHashes
    )
    {
        // This is a dummy implementation, adjust as needed
        SRequest memory req = requests[_request];
        return (
            req.result,
            bytes32(blockhash(block.number - 1)),
            req.ethPaid,
            0,
            [bytes10(0), bytes10(0)]
        );
    }

    // Function to submit a random result
    function submitRandom(uint256 id, bytes32 value) external {
        uint256 startGas = gasleft() + 25000;
        // Get the request details
        SRequest memory _request = requests[id];
        // Call the client contract's randomizerCallback function with the specified gas limit
        (bool success, bytes memory data) = _request.client.call{
            gas: _request.callbackGasLimit
        }(
            abi.encodeWithSignature(
                "randomizerCallback(uint256,bytes32)",
                id,
                value
        )
        );

        if (!success) emit CallbackFailed(id, data);

        // Calculate the fee paid
        uint256 gasUsed = startGas - gasleft();
        uint256 ethPaid = gasUsed * tx.gasprice;

        // Save the fee paid to the request
        requests[id].ethPaid = ethPaid;
        requests[id].result = value;

        // Emit the Result event
        emit Result(id, value);
    }

    function _maxGasPriceAfterConfirmations(
        uint256 _confirmations
    ) internal view returns (uint256 maxGasPrice) {
        uint256 maxFee = block.basefee + (block.basefee / 4) + 1;
        maxGasPrice = tx.gasprice < maxFee ? tx.gasprice : maxFee;
        // maxFee goes up by 12.5% per confirmation, calculate the max fee for the number of confirmations
        if (_confirmations > 1) {
            uint256 i = 0;
            do {
                maxGasPrice += (maxGasPrice / 8) + 1;
                unchecked {
                    ++i;
                }
            } while (i < _confirmations);
        }
    }
}

contract CustomCoin is ERC20 {
    constructor() ERC20("Dummy ", "DUMMY", 18) {}

    function mint(uint amount) public {
        _mint(msg.sender, amount);
    }
}

contract DareDropTest is Test {

    //events
    //
    event OwnershipTransferred(address indexed user, address indexed newOwner);
    event DareAttempted(address indexed user, uint wager);
    event DareResult(address indexed player, uint256 indexed id, uint256 wager, bool indexed result);
    event GameCompleted(uint indexed gameId);
    event Withdraw(address indexed user, uint amount);
    event RewardsClaimed(address indexed user, uint rewardAmount);
    event UpdatedGasLimit(uint gasLimit);
    event Drop(address indexed user, uint amount);
    event Refund(address indexed player, uint refundAmount, uint indexed id);
    event LockStatusUpdated(uint8 indexed lockStatus);

    //errors
    //
    error NoAvailableRefund();
    error InsufficientFunds();
    error OnlyRandomizer();
    error RequiresLock();
    error RequiresUnlock();
    error ReentrantCall();
    error AmountZero();
    error InsufficientVRFFee();
    error GameIncomplete();
    error OnlyOwner();


    //contracts
    CustomCoin private Token;
    DareDropContract private DareDrop;
    DummyRandomizerContract private Randomizer;

    //actors
    address private actor1 = vm.addr(uint256(keccak256(abi.encodePacked("actor1"))));
    address private actor2 = vm.addr(uint256(keccak256(abi.encodePacked("actor2"))));
    address private actor3 = vm.addr(uint256(keccak256(abi.encodePacked("actor3"))));
    address private actor4 = vm.addr(uint256(keccak256(abi.encodePacked("actor4"))));
    address private actor5 = vm.addr(uint256(keccak256(abi.encodePacked("actor5"))));



    function setUp() public {
        vm.deal(actor1, 100 ether);
        vm.deal(actor2, 100 ether);
        vm.deal(actor3, 100 ether);
        vm.deal(actor4, 100 ether);
        vm.deal(actor5, 100 ether);

        Token = new CustomCoin();
        Randomizer = new DummyRandomizerContract();
        DareDrop = new DareDropContract(address(Randomizer), address(Token));


        Token.mint(25e18);
        Token.transfer(actor1, 5e18);
        Token.transfer(actor2, 5e18);
        Token.transfer(actor3, 5e18);
        Token.transfer(actor4, 5e18);
        Token.transfer(actor5, 5e18);


    }



    function testDrop_ExpectedBehavior() public {
        uint depositAmount = 1e18;
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        vm.roll(100);
        vm.expectEmit(true, true, false, false);
        emit Drop(actor1, depositAmount);
        DareDrop.drop(depositAmount);
        uint gameId = DareDrop.gameId();

        assertEq(DareDrop.userBalance(actor1, gameId), depositAmount);
        (,uint poolBalance,) = DareDrop.games(gameId);
        assertEq(poolBalance, depositAmount);

    }
    function testDrop_RevertWhenDropAmountIsZero() public {
        uint depositAmount = 0;
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        vm.expectRevert(AmountZero.selector);
        DareDrop.drop(depositAmount);


    }

    function testDrop_RevertWhenDropAmountIsGreaterThanBalance() public {
        uint depositAmount = 10e18;
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        vm.expectRevert();
        DareDrop.drop(depositAmount);

    }
    function testDare_RevertInsufficientVRFFee() public {

        uint depositAmount = 100;
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        vm.expectRevert(InsufficientVRFFee.selector);
        DareDrop.dare{value: 1 }(depositAmount);


    }

    function test_Dare_RevertOnAmountZero() public {
        vm.startPrank(actor1);
        vm.expectRevert(AmountZero.selector);
        DareDrop.dare{value: 1 ether}(0);


    }
    function test_Dare_Attempt_State_And_EventLogs(uint depositAmount) public {

        uint ownerTokenAmountBeforeDare = Token.balanceOf(address(this));
        //cant deposit more than wallet balance
        vm.assume(depositAmount <= 1e17);
        //expected to revert on zero
        //large enough number to handle percentage calculations
        vm.assume(depositAmount > 1000);

        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        //expect dare attempt event to fire 
        vm.expectEmit(true, true, false, false);
        emit DareAttempted(actor1, depositAmount);
        DareDrop.dare{value: 1 ether}(depositAmount);

        vm.stopPrank();

        //expect deposits to be locked.
        assertEq(DareDrop.lock(), 1);

        //uint[] memory userDares = DareDrop.getUserDares(actor1);
        //uint id = userDares[userDares.length - 1];
        //id should be 1 for testing.
        uint id = 1;
        uint paymentValue = DareDrop.darePaymentValue(id);

        //expect randomizer payment to be logged accordingly
        assertEq(paymentValue, 1 ether);
        //expect wager = initial dare amount - fees - gratuity
        (uint wager ,,,) = DareDrop.dares(id);
        assertApproxEqAbs(depositAmount * 75/100, wager, 2);

        uint gameId = DareDrop.gameId();
        (uint gameRewards,,) = DareDrop.games(gameId);
        //expect rewards to have been distributed to drop pool 
        //should be equal to dare amount - fees 
        assertApproxEqAbs(gameRewards, depositAmount * 95/100, 2);
        //expect 5% deposit amount fees to be cut to house (owner aka msg.sender in this case).
        assertApproxEqAbs(Token.balanceOf(address(this)), ownerTokenAmountBeforeDare + (depositAmount * 5/100), 2);
    }

    //    function test_Full_GameplayLoop(uint depositAmount, bytes32 seed) public {
    //        vm.assume(depositAmount <= 5e18);
    //        //expected to revert on zero
    //        //large enough number to handle percentage calculations
    //        vm.assume(depositAmount > 1000);
    //
    //
    //        vm.pauseGasMetering();
    //        uint8 loop = 0;
    //        while (loop < 3) {
    //            console.log("loop:", loop);
    //            //attempt dare, make sure state and event logs are where they're supposed to be.
    //            test_Dare_Attempt_State_And_EventLogs(depositAmount);
    //            //determine dare result
    //            vm.roll(1);
    //            //            uint[] memory userDares = DareDrop.getUserDares(actor1);
    //            uint id = 1; //userDares[userDares.length - 1];
    //            vm.expectEmit(true, true, false, false);
    //            emit DareResult(actor1, id, depositAmount, false);
    //            Randomizer.submitRandom(id, seed);
    //            vm.roll(1);
    //            //expect deposits to now be unlocked.
    //            assertEq(DareDrop.lock(), 0);
    //            vm.startPrank(actor2);
    //            //reset rewards value for checks.
    //            DareDrop.claimRewards();
    //            uint userBalance = DareDrop.userBalance(actor2);
    //            if (userBalance > 0) {
    //
    //                DareDrop.withdraw(userBalance);
    //            }
    //            vm.stopPrank();
    //            ++loop;
    //
    //        }
    //
    //    }



    function testDare_ResultDetermination(uint depositAmount) public {
        //cant deposit more than wallet balance
        vm.assume(depositAmount <= 5e18);
        //expected to revert on zero
        vm.assume(depositAmount > 1000);

        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.dare{value: 1 ether}(depositAmount);




        vm.roll(1);
        //       uint[] memory userDares = DareDrop.getUserDares(actor1);
        uint id = 1; //userDares[userDares.length - 1];
        bytes32 seed = "asdf"; //value doesn't matter in this case
        vm.expectEmit(true, true, false, false);
        emit DareResult(actor1, id, depositAmount, false);
        Randomizer.submitRandom(id, seed);





    }

    function test_DareConsistentSuccessOnDepositEqualToDropPool(bytes32 seed) public {

        uint depositAmount = 100;

        //deposit x tokens into the drop pool.
        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        //dare  with amount of tokens equal to amount in drop pool, 
        //should be 100% success rate...
        //adding 35% to account for 25% cut in fees.
        //ex.
        //deposit = 100
        //dare = 135;
        //135 * 0.75 = 101.25
        uint dareAmount = depositAmount * 135/100;
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), dareAmount);
        DareDrop.dare{value: 1 ether}(dareAmount);

        //assure result is true.
        vm.roll(1);
        //       uint[] memory userDares = DareDrop.getUserDares(actor1);
        //id returned by randomizer should be 0 during testing 
        uint id = 1;//userDares[userDares.length - 1];

        //fuzz seed value to ensure dare is success no matter what. 
        Randomizer.submitRandom(id, seed);
        (,, bool result,) = DareDrop.dares(id);

        assertEq(result, true);




    }
    function testRevert_callbackNonRandomizer() public {

        //will revert for incorrect lock status without starting a dare.
        uint depositAmount = 1e18;
        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);
        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.dare{value: 1 ether}(depositAmount);

        vm.startPrank(actor1);
        vm.expectRevert(OnlyRandomizer.selector);
        DareDrop.randomizerCallback(0, 'test');

    }



    function testRewardDistribution(bytes32 seed) public {

        vm.pauseGasMetering();
        uint depositAmount = 1e18;

        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor3);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor4);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor5);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);




        vm.startPrank(actor1);
        Token.approve(address(DareDrop), 1e18);
        DareDrop.dare{value: 1 ether}(depositAmount);

        vm.roll(1);
        //uint[] memory userDares = DareDrop.getUserDares(actor1);
        //id returned by randomizer should be 0 during testing.
        uint id = 1;//userDares[userDares.length - 1];

        //necessary for dare result math check.
        uint gameId = DareDrop.gameId();
        (,uint poolBalanceBeforeResult,) = DareDrop.games(gameId);
        //        uint poolBalanceBeforeResult = DareDrop.totalDropBalance();
        //fuzz seed value to check both results. 
        Randomizer.submitRandom(id, seed);
        (,, bool result,) = DareDrop.dares(id);




        //dare success
        //should give all drop pool funds to darer,
        //and zero out all pool funds user balances
        if(result == true) {
            // should be: 
            //pool amount + initial balance (minted in setUp() fn) - wager (distributed to rewards before result determination)
            assertEq(Token.balanceOf(actor1), poolBalanceBeforeResult + 5e18 - depositAmount); 

        }
        //dare fail
        //should distribute dare's wager to drop pool depositors 
        //weighted linearly based on user's share of deposit pool
        if(result == false) {

            //should be:
            //original balance (distributed from setUp() fn)
            // - drop deposit (still in pool);
            // + dare wager funds distributed proportionately based on total pool share
            //in this case should be 25%, so 1/4 to drop user...
            //--> 1/4 * 1e18 = 0.25e18 = 25e16

            // vm.startPrank(actor2);
            // DareDrop.claimRewards();

            // vm.startPrank(actor3);
            // DareDrop.claimRewards();

            // vm.startPrank(actor4);
            // DareDrop.claimRewards();

            // vm.startPrank(actor5);
            // DareDrop.claimRewards();

            uint expectedReward = 1e18;
            //take 5% cut from fee to house on dare.
            expectedReward = expectedReward * 95/100;


            (uint rewards,,) = DareDrop.games(gameId);

            assertEq(rewards, expectedReward);

        }




    }

    function test_ClaimRewards(bytes32 seed) public {


        uint depositAmount = 1e18;

        //deposit to drop pool, in equal amounts from 4 different users.
        vm.startPrank(actor2);

        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor3);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor4);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor5);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);






        vm.startPrank(actor1);
        Token.approve(address(DareDrop), 1e18);
        DareDrop.dare{value: 10 ether}(depositAmount);

        vm.pauseGasMetering();
        vm.roll(1);
        //       uint[] memory userDares = DareDrop.getUserDares(actor1);
        //id returned by randomizer should be 0 during testing.
        uint id = 1;//userDares[userDares.length - 1];
        //fuzz seed value to force result to return false. 
        Randomizer.submitRandom(id, seed);
        (,, bool result,) = DareDrop.dares(id);




        vm.assume(result == true); 
        uint8 houseCut = DareDrop.houseCut();
        uint expectedRewards = (25e16);
        expectedRewards = expectedRewards - (expectedRewards * houseCut/100);
        vm.startPrank(actor2);
        uint gameId = DareDrop.gameId();
        DareDrop.claimRewards(gameId - 1);
        assertEq(Token.balanceOf(actor2), 4e18 + expectedRewards);
        vm.startPrank(actor3);
        DareDrop.claimRewards(gameId - 1);
        assertEq(Token.balanceOf(actor2), 4e18 + expectedRewards);
        vm.startPrank(actor4);
        DareDrop.claimRewards(gameId - 1);
        assertEq(Token.balanceOf(actor2), 4e18 + expectedRewards);
        vm.startPrank(actor5);
        DareDrop.claimRewards(gameId - 1);
        assertEq(Token.balanceOf(actor2), 4e18 + expectedRewards);

        vm.startPrank(actor2);

        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.expectRevert(GameIncomplete.selector);
        DareDrop.claimRewards(gameId);









    }
    function test_UserCanOnlyClaimRewardsOnce(bytes32 seed) public {
        uint depositAmount = 10000;

        vm.startPrank(actor2);

        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor1);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.dare{value: 10 ether}(depositAmount);

        vm.pauseGasMetering();
        vm.roll(1);
        //       uint[] memory userDares = DareDrop.getUserDares(actor1);
        //id returned by randomizer should be 0 during testing.
        uint id = 1;//userDares[userDares.length - 1];
        //fuzz seed value to force result to return false. 
        Randomizer.submitRandom(id, seed);
        (,, bool result,) = DareDrop.dares(id);




        vm.assume(result == true); 
        uint8 houseCut = DareDrop.houseCut();
        uint expectedRewards = (25e16);
        expectedRewards = expectedRewards - (expectedRewards * houseCut/100);
        vm.startPrank(actor2);
        uint gameId = DareDrop.gameId();
        DareDrop.claimRewards(gameId - 1);
        vm.expectRevert(AmountZero.selector);
        DareDrop.claimRewards(gameId-1);







    }

    function testWithdraw() public {
        uint depositAmount = 1e18;

        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor3);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor4);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor5);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);






        vm.startPrank(actor2);
        vm.expectRevert(AmountZero.selector);
        DareDrop.withdraw(0);

        DareDrop.withdraw(depositAmount);

        uint gameId = DareDrop.gameId();
        (,uint poolBalance,) = DareDrop.games(gameId);
        assertEq(poolBalance, 3*depositAmount);






    }
    function test_EmergencyChangeLockStatusFunctionLocks() public {
        uint8 lockStatus = DareDrop.lock();

        DareDrop.emergencyChangeLockStatus();
        uint8 newLockStatus = DareDrop.lock();

        assertTrue(lockStatus == 0);
        assertTrue(newLockStatus == 1);
    }
    function test_EmergencyChangeLockStatusFunctionUnlocks() public {
    uint depositAmount = 1e18;

        vm.startPrank(actor2);
        Token.approve(address(DareDrop), depositAmount);
        DareDrop.drop(depositAmount);

        vm.startPrank(actor1);
        Token.approve(address(DareDrop), 1e18);
        DareDrop.dare{value: 1 ether}(depositAmount);


        vm.stopPrank();
        uint8 lockStatus = DareDrop.lock();

        DareDrop.emergencyChangeLockStatus();
        uint8 newLockStatus = DareDrop.lock();

        assertTrue(lockStatus == 1);
        assertTrue(newLockStatus == 0);
    }

    function test_EmergencyChangeLockStatusFunctionOnlyCallableByOwner() public {
        vm.startPrank(actor1);
        vm.expectRevert(OnlyOwner.selector);
        DareDrop.emergencyChangeLockStatus();

    }







}

