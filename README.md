# 🚗 Car Rental DApp

A decentralized car rental platform built on the Ethereum blockchain. This DApp eliminates intermediaries by allowing car owners to list their vehicles and renters to pay directly in ETH — all governed by a transparent Solidity smart contract.

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.25.0-yellow?logo=hardhat)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![Web3.js](https://img.shields.io/badge/Web3.js-4.16.0-F16822?logo=web3dotjs)

---

## 📖 Overview

The **Car Rental DApp** is a fully decentralized application where:
- **Car owners** can register their cars with a model name and rental fee in ETH
- **Renters** can browse available cars and rent them by paying ETH directly on-chain
- **Earnings** are accumulated on-chain and owners can withdraw at any time
- **No central authority** — all logic lives in the smart contract

---

## ✨ Features

- 🔐 Connect MetaMask wallet
- 🚘 Register your car with model name and rental fee (in Wei)
- 📋 View all available cars in real time
- 💸 Rent a car by paying exact ETH to the owner
- 🔄 Return a rented car when done
- 💰 Withdraw accumulated rental earnings
- 📡 All transactions recorded on the Ethereum blockchain

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity `^0.8.28` |
| Blockchain Dev | Hardhat `^2.25.0` |
| Frontend | React.js `^19.1.0` |
| Blockchain Interaction | Web3.js `^4.16.0` |
| Wallet | MetaMask |
| Local Network | Hardhat Node (`localhost:8545`) |

---

## 🔗 Smart Contract — `CarRentalPlatform.sol`

### Contract Functions

| Function | Type | Description |
|---|---|---|
| `registerCar(model, fee)` | `nonpayable` | List your car for rent with a model name and rental fee |
| `getAvailableCars()` | `view` | Returns all currently available cars (IDs, models, fees, owners) |
| `rentCar(carId)` | `payable` | Rent a car by sending exact ETH equal to the rental fee |
| `returnCar(carId)` | `nonpayable` | Return a rented car (only the renter can call this) |
| `withdrawEarnings()` | `nonpayable` | Withdraw all accumulated rental income as a car owner |

### Events

| Event | Emitted When |
|---|---|
| `CarRegistered` | A new car is listed |
| `CarRented` | A car is successfully rented |
| `CarReturned` | A rented car is returned |
| `EarningsWithdrawn` | An owner withdraws their earnings |

### Car Struct

```solidity
struct Car {
    uint carId;
    address payable owner;
    string carModel;
    uint rentalFee;      // in Wei
    bool isAvailable;
    address renter;
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/car-rental-dapp.git
cd car-rental-dapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Edit `.env` and fill in your values:

```env
REACT_APP_RPC_URL=http://127.0.0.1:8545
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_hardhat_test_private_key
```

### 4. Start Local Blockchain

```bash
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` and gives you 20 test accounts with 10000 ETH each.

### 5. Deploy the Smart Contract

Open a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address from the output and update `REACT_APP_CONTRACT_ADDRESS` in your `.env` file.

### 6. Start the React App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Connect MetaMask

- Open MetaMask → Add Network → Add a custom network
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Import one of the Hardhat test accounts using its private key

---

## 📁 Project Structure

```
car-rental-dapp/
├── contracts/
│   └── CarRentalPlatform.sol     # Main smart contract
├── scripts/
│   └── deploy.js                 # Hardhat deployment script
├── src/
│   ├── App.js                    # Main React component
│   ├── App.css                   # Styles
│   ├── contractConfig.js         # Contract ABI + address
│   ├── index.js                  # React entry point
│   └── index.css                 # Global styles
├── artifacts/                    # Compiled contracts (auto-generated, git-ignored)
├── cache/                        # Hardhat cache (git-ignored)
├── .env                          # Environment variables (git-ignored)
├── .gitignore
├── hardhat.config.js             # Hardhat configuration
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file inside the project root (never commit this):

```env
# Local RPC endpoint
REACT_APP_RPC_URL=http://127.0.0.1:8545

# Deployed contract address (update after each deploy)
REACT_APP_CONTRACT_ADDRESS=

# Hardhat test private key (DO NOT use real wallet key)
PRIVATE_KEY=

# For future testnet/mainnet deployment
# ALCHEMY_API_KEY=
# ETHERSCAN_API_KEY=
```

> ⚠️ **Never commit your `.env` file.** It is already excluded by `.gitignore`.

---

## 📜 Available Scripts

### `npm start`
Runs the React app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm run build`
Builds the app for production into the `/build` folder.

### `npx hardhat node`
Starts a local Hardhat Ethereum node.

### `npx hardhat run scripts/deploy.js --network localhost`
Deploys the smart contract to the local Hardhat network.

### `npx hardhat compile`
Compiles the Solidity contracts and generates artifacts.

---

## ⚠️ Disclaimer

This project is built for **educational and learning purposes**. Do not use Hardhat test private keys on any real network. Always use a dedicated wallet with no real funds for development.

---

## 👨‍💻 Author

Built for learning Blockchain & Web3 Development.

---

