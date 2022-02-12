# A demo about web3.0

# Overall process

## Smart Contract

### Hardhat

#### Install
```
npm install --save-dev hardhat 
```

#### Create a Hardhat Project
```
npx hardhat
```

hardhat.config.js

```
require("@nomiclabs/hardhat-waffle");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0"
};
```

#### Develop a Smart Contract

**smart_contract/contracts/Transactions.sol**

```
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract Transactions {
    uint256 transactionCount;

    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    function addToBlockChain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount += 1;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}

```

#### Compile the Smart Contract

```
npx hardhat compile
```

#### Test the Smart Contract
todo

```
npx hardhat test
```

#### Network debugging with Hardhat
todo

#### Deploy the Smart Contract
smart_contract/scripts/deploy.js

```
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const transactions = await Transactions.deploy();

  await transactions.deployed();

  console.log("Transactions deployed to:", transactions.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch(error) {
    console.error(error);
    process.exit(1);
  }
}

runMain()
```

##### Add the test network
smart_contract/hardhat.config.js

```
module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: { // test network and we can get ethereum from it.
      url: 'https://eth-ropsten.alchemyapi.io/v2/Mrfp_Z7sj1d8oSrlFoQUNxzZ-fkCHiiS', // from Alchemy, helping us deploy our smart contract
      accounts: ['xxx'] // from metamask private key
    }
  }
};
```

Run the script
```
npx hardhat run scripts/deploy.js --network ropsten
```

And finally, we get the result in `smart_contract/artifacts/contracts/Transactions.sol/Transactions.json` .

## Client

```
const { ethereum } = window; // get `ethereum` from MetaMask browser plugin.
```

### Check If the Wallet Is Connect

```
const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };
```

### Get all transactions

```
  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions(); // provided by transaction
        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };
```

### Create Ethereum Contract

```
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants"; // contractABI is created by `npx hardhat run scripts/deploy.js --network ropsten`
// contractAddress which is got when deploying from deploy.js

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};
```

### Connect wallet
```
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
```

### Send a Transaction

```
  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 21000 GWEI
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await transactionsContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
```



