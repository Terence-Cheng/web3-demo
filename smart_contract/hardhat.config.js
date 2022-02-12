require("@nomiclabs/hardhat-waffle");

// https://eth-ropsten.alchemyapi.io/v2/Mrfp_Z7sj1d8oSrlFoQUNxzZ-fkCHiiS

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: { // test network and we can get ethereum from it.
      url: 'https://eth-ropsten.alchemyapi.io/v2/Mrfp_Z7sj1d8oSrlFoQUNxzZ-fkCHiiS', // from Alchemy, helping us deploy our smart contract
      accounts: ['xxxx'] // from metamask private key
    }
  }
};
