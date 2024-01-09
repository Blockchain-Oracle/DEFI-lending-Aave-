const { ethers, getNamedAccounts } = require("hardhat");
const AMOUNT = ethers.parseEther("1");

async function getWeth() {
  // const deployer = (await getNamedAccounts()).deployer;

  const signer = await ethers.provider.getSigner();

  const iweth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    signer
  );
  const txResponse = await iweth.deposit({ value: AMOUNT });
  const getBalance = await iweth.balanceOf(signer.address);
  console.log(`got weth ${getBalance.toString()}`);
  await txResponse.wait(1);
}

module.exports = { getWeth, AMOUNT };
