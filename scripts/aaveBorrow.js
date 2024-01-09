const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWeth");
const { abi } = require("../constants/lendPoolProviderAbi");
const { abi: ilendPoolAbi } = require("./../constants/IlendingPoolABI");

async function main() {
  const signer = await ethers.provider.getSigner();

  await getWeth(); // lending pool address 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
  const lendingPool = await getLendingPool(signer);
  console.log(`lending  pool address ${await lendingPool.getAddress()}`);

  //deposit
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // approve
  await approveErc20(
    wethTokenAddress,
    await lendingPool.getAddress(),
    AMOUNT,
    signer
  );
  console.log("depositing pls wait...");
  await lendingPool.supply(wethTokenAddress, AMOUNT, signer, 0);
  console.log("deposited");

  //Borrow Time

  //geting values of user borrow debt
  let { totalDebtBase, availableBorrowsBase } = await getBorrowUserData(
    lendingPool,
    signer
  );

  // get price of dai and amount to borrow config
  const daiETHPrice = await getPrice();

  const amountToBorrow =
    availableBorrowsBase.toString() * 0.95 * (1 / daiETHPrice.toString());
  console.log(`you can borrow ${amountToBorrow * 1e6} DAI`);
  const amountToBorrowWei = ethers.parseEther(
    (amountToBorrow * 1e6).toString()
  );

  //borowing
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(lendingPool, daiAddress, amountToBorrowWei, signer);

  // get price of dai and amount to borrow config
  await getBorrowUserData(lendingPool, signer);

  //repay
  await repayAave(signer, daiAddress, lendingPool, amountToBorrowWei);

  // get price of dai and amount to borrow config
  await getBorrowUserData(lendingPool, signer);
}

//repay

async function repayAave(signer, daiAddress, lendingPool, amount) {
  await approveErc20(
    daiAddress,
    await lendingPool.getAddress(),
    amount,
    signer
  );
  const repaytx = await lendingPool.repay(daiAddress, amount, 2, signer);
  await repaytx.wait(1);
  console.log(`debt of ${amount} repaid`);
}

//borrow dai

async function borrowDai(lendingPool, daiAddress, amountToBorrowWei, signer) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountToBorrowWei,
    2,
    0,
    signer
  );
  await borrowTx.wait(1);
  console.log(`youve borrowed this ${amountToBorrowWei} amount of dai`);
}

//gET PRICE
async function getPrice() {
  const priceFeedContract = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const { answer } = await priceFeedContract.latestRoundData();
  console.log(`current DAI/ETH price : ${ethers.formatEther(answer)}`);

  return answer;
}
//getting user data
async function getBorrowUserData(lendingPool, signer) {
  const { totalCollateralBase, totalDebtBase, availableBorrowsBase } =
    await lendingPool.getUserAccountData(signer);
  console.log(`you have total ${totalCollateralBase} worth of Eth deposited`);
  console.log(`you have total ${totalDebtBase} Eth debt`);
  console.log(`you have total ${availableBorrowsBase} you can borrow`);
  return { totalDebtBase, availableBorrowsBase };
}
//lending pool
async function getLendingPool(signer) {
  const lendpoolAddresProvider = await ethers.getContractAt(
    abi,
    "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
    signer
  );

  const lendPoolAddress = await lendpoolAddresProvider.getPool();
  const ILendingPool = await ethers.getContractAt(
    ilendPoolAbi,
    lendPoolAddress,
    signer
  );
  return ILendingPool;
}
//approving
async function approveErc20(
  IwethContractAddress,
  spenderAddress,
  amountToSpend,
  signer
) {
  const iweth = await ethers.getContractAt(
    "IWeth",
    IwethContractAddress,
    signer
  );
  const tx = await iweth.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
