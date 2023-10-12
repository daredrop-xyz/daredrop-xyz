# Expects jq to be installed

source .env

echo "deploying..."
forge script packages/contracts/script/$CONTRACT.s.sol --rpc-url $RPC --broadcast --verify --chain-id $NETWORK_ID --watch
CONTRACT_NAME=$(cat broadcast/$CONTRACT.s.sol/$NETWORK_ID/run-latest.json | jq -r ".transactions[0].contractName")
CONTRACT_ADDRESS=$(cat broadcast/$CONTRACT.s.sol/$NETWORK_ID/run-latest.json | jq -r ".transactions[0].contractAddress")
HASH=$(cat broadcast/$CONTRACT.s.sol/$NETWORK_ID/run-latest.json | jq -r ".transactions[0].hash")


DEPLOY_OUTPUT="packages/contracts/deploys/$NETWORK/$CONTRACT_NAME.json"
rm -rf $DEPLOY_OUTPUT
mkdir -p $(dirname $DEPLOY_OUTPUT)
jq -n --arg CONTRACT_ADDRESS "$CONTRACT_ADDRESS" --arg HASH "$HASH" --arg DEPLOYER "$DEPLOYER" '{deployedTo: $CONTRACT_ADDRESS, deployer: $DEPLOYER, transactionHash: $HASH}' > $DEPLOY_OUTPUT

