// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract CarRentalPlatform {
    address public platformOwner;

    constructor() {
        platformOwner = msg.sender;
    }

    struct Car {
        uint carId;
        address payable owner;
        string carModel;
        uint rentalFee;
        bool isAvailable;
        address renter;
    }

    uint public carCount = 0;
    mapping(uint => Car) public cars;//maps car id and car struct
    mapping(address => uint) public ownerEarnings; // maps owner address and their earnings

    event CarRegistered(uint carId, address owner, string carModel, uint rentalFee);
    event CarRented(uint carId, address renter);
    event CarReturned(uint carId);
    event EarningsWithdrawn(address owner, uint amount);

    // 🔹 Car Owner Registers a Car
    function registerCar(string memory _carModel, uint _rentalFee) public {
        cars[carCount] = Car({
            carId: carCount,
            owner: payable(msg.sender),
            carModel: _carModel,
            rentalFee: _rentalFee,
            isAvailable: true,
            renter: address(0)
        });

        emit CarRegistered(carCount, msg.sender, _carModel, _rentalFee);
        carCount++;
    }

    // 🔍 View Available Cars (Split Output)
    function getAvailableCars()
        public
        view
        returns (
            uint[] memory carIds,
            string[] memory models,
            uint[] memory fees,
            address[] memory owners
        )
    {
        uint count = 0;

        // Count available cars
        for (uint i = 0; i < carCount; i++) {
            if (cars[i].isAvailable) {
                count++;
            }
        }

        // Allocate memory
        carIds = new uint[](count);
        models = new string[](count);
        fees = new uint[](count);
        owners = new address[](count);

        uint index = 0;
        for (uint i = 0; i < carCount; i++) {
            if (cars[i].isAvailable) {
                carIds[index] = cars[i].carId;
                models[index] = cars[i].carModel;
                fees[index] = cars[i].rentalFee;
                owners[index] = cars[i].owner;
                index++;
            }
        }
    }

    // 🚙 Rent a Car
    function rentCar(uint _carId) public payable {
        Car storage car = cars[_carId];

        require(car.isAvailable, "Car is not available");
        require(msg.sender != car.owner, "Owner cannot rent their own car");
        require(msg.value == car.rentalFee, "Incorrect rental fee");

        car.renter = msg.sender;
        car.isAvailable = false;

        // Add funds to owner's balance
        ownerEarnings[car.owner] += msg.value;

        emit CarRented(_carId, msg.sender);
    }

    // 🔄 Return a Car
    function returnCar(uint _carId) public {
        Car storage car = cars[_carId];

        require(msg.sender == car.renter, "Only renter can return the car");

        car.renter = address(0);
        car.isAvailable = true;

        emit CarReturned(_carId);
    }

    // 💸 Owner Withdraws Earnings
    function withdrawEarnings() public {
        uint amount = ownerEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        ownerEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit EarningsWithdrawn(msg.sender, amount);
    }
}
