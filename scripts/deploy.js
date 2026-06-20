const hre = require("hardhat");

async function main() {
  const CarRental = await hre.ethers.getContractFactory("CarRentalPlatform");
  const contract = await CarRental.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});