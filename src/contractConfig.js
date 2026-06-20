// ⚠️ After deploying your contract with Hardhat, paste the deployed address here
export const CONTRACT_ADDRESS  = process.env.REACT_APP_CONTRACT_ADDRESS ;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "carId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "carModel", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "rentalFee", "type": "uint256" }
    ],
    "name": "CarRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "carId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "renter", "type": "address" }
    ],
    "name": "CarRented",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "carId", "type": "uint256" }
    ],
    "name": "CarReturned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "EarningsWithdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "carCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "cars",
    "outputs": [
      { "internalType": "uint256", "name": "carId", "type": "uint256" },
      { "internalType": "address payable", "name": "owner", "type": "address" },
      { "internalType": "string", "name": "carModel", "type": "string" },
      { "internalType": "uint256", "name": "rentalFee", "type": "uint256" },
      { "internalType": "bool", "name": "isAvailable", "type": "bool" },
      { "internalType": "address", "name": "renter", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableCars",
    "outputs": [
      { "internalType": "uint256[]", "name": "carIds", "type": "uint256[]" },
      { "internalType": "string[]", "name": "models", "type": "string[]" },
      { "internalType": "uint256[]", "name": "fees", "type": "uint256[]" },
      { "internalType": "address[]", "name": "owners", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "ownerEarnings",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformOwner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_carModel", "type": "string" },
      { "internalType": "uint256", "name": "_rentalFee", "type": "uint256" }
    ],
    "name": "registerCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_carId", "type": "uint256" }],
    "name": "rentCar",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_carId", "type": "uint256" }],
    "name": "returnCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawEarnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];