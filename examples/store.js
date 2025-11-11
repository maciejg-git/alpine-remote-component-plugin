document.addEventListener("alpine:init", () => {
  Alpine.store("table", {
    definition: [
      {
        key: "manufacturer",
        sortable: true,
      },
      {
        key: "model",
        sortable: true,
      },
      {
        key: "type",
        sortable: true,
      },
      {
        key: "fuel",
        sortable: true,
      },
      {
        key: "year",
        sortable: true,
      },
      {
        key: "price",
        sortable: true,
      },
    ],
    items: [
      {
        "id": 1,
        "manufacturer": "Hyundai",
        "model": "V90",
        "type": "Extended Cab Pickup",
        "fuel": "Gasoline",
        "year": 2010,
        "price": 130000
      },
      {
        "id": 2,
        "manufacturer": "NIO",
        "model": "Cruze",
        "type": "Convertible",
        "fuel": "Electric",
        "year": 2013,
        "price": 60000
      },
      {
        "id": 3,
        "manufacturer": "Renault",
        "model": "Model Y",
        "type": "Minivan",
        "fuel": "Diesel",
        "year": 2021,
        "price": 10000
      },
      {
        "id": 4,
        "manufacturer": "Volkswagen",
        "model": "XTS",
        "type": "Wagon",
        "fuel": "Hybrid",
        "year": 2012,
        "price": 90000
      },
      {
        "id": 5,
        "manufacturer": "Mitsubishi",
        "model": "Beetle",
        "type": "Cargo Van",
        "fuel": "Gasoline",
        "year": 2002,
        "price": 200000
      },
      {
        "id": 6,
        "manufacturer": "BMW",
        "model": "ATS",
        "type": "Cargo Van",
        "fuel": "Hybrid",
        "year": 2018,
        "price": 150000
      },
      {
        "id": 7,
        "manufacturer": "Chrysler",
        "model": "CTS",
        "type": "Cargo Van",
        "fuel": "Electric",
        "year": 2016,
        "price": 150000
      },
      {
        "id": 8,
        "manufacturer": "Maserati",
        "model": "XTS",
        "type": "Extended Cab Pickup",
        "fuel": "Diesel",
        "year": 2018,
        "price": 150000
      },
      {
        "id": 9,
        "manufacturer": "Hyundai",
        "model": "CX-9",
        "type": "Convertible",
        "fuel": "Gasoline",
        "year": 2008,
        "price": 80000
      },
      {
        "id": 10,
        "manufacturer": "Citroën",
        "model": "Silverado",
        "type": "Hatchback",
        "fuel": "Gasoline",
        "year": 2007,
        "price": 70000
      },
      {
        "id": 11,
        "manufacturer": "Volvo",
        "model": "Grand Caravan",
        "type": "Wagon",
        "fuel": "Electric",
        "year": 2003,
        "price": 100000
      },
      {
        "id": 12,
        "manufacturer": "Cadillac",
        "model": "Durango",
        "type": "Convertible",
        "fuel": "Gasoline",
        "year": 1993,
        "price": 180000
      },
      {
        "id": 13,
        "manufacturer": "Suzuki",
        "model": "CTS",
        "type": "Crew Cab Pickup",
        "fuel": "Hybrid",
        "year": 2012,
        "price": 100000
      },
      {
        "id": 14,
        "manufacturer": "Lamborghini",
        "model": "Silverado",
        "type": "Sedan",
        "fuel": "Electric",
        "year": 2002,
        "price": 140000
      },
      {
        "id": 15,
        "manufacturer": "Peugeot",
        "model": "Corvette",
        "type": "Crew Cab Pickup",
        "fuel": "Electric",
        "year": 1996,
        "price": 70000
      },
      {
        "id": 16,
        "manufacturer": "Mahindra & Mahindra",
        "model": "Durango",
        "type": "Crew Cab Pickup",
        "fuel": "Diesel",
        "year": 2019,
        "price": 50000
      },
      {
        "id": 17,
        "manufacturer": "BMW",
        "model": "CX-9",
        "type": "Passenger Van",
        "fuel": "Diesel",
        "year": 2001,
        "price": 60000
      },
      {
        "id": 18,
        "manufacturer": "Land Rover",
        "model": "Altima",
        "type": "SUV",
        "fuel": "Electric",
        "year": 2021,
        "price": 40000
      },
      {
        "id": 19,
        "manufacturer": "Audi",
        "model": "Land Cruiser",
        "type": "SUV",
        "fuel": "Gasoline",
        "year": 2014,
        "price": 100000
      },
      {
        "id": 20,
        "manufacturer": "NIO",
        "model": "Grand Caravan",
        "type": "SUV",
        "fuel": "Gasoline",
        "year": 1993,
        "price": 100000
      },
      {
        "id": 21,
        "manufacturer": "Ferrari",
        "model": "PT Cruiser",
        "type": "Hatchback",
        "fuel": "Electric",
        "year": 2015,
        "price": 30000
      },
      {
        "id": 22,
        "manufacturer": "Polestar",
        "model": "Ranchero",
        "type": "Coupe",
        "fuel": "Hybrid",
        "year": 1992,
        "price": 130000
      },
      {
        "id": 23,
        "manufacturer": "Renault",
        "model": "Beetle",
        "type": "Minivan",
        "fuel": "Gasoline",
        "year": 2000,
        "price": 140000
      },
      {
        "id": 24,
        "manufacturer": "Fiat",
        "model": "CTS",
        "type": "Crew Cab Pickup",
        "fuel": "Diesel",
        "year": 2005,
        "price": 170000
      },
      {
        "id": 25,
        "manufacturer": "Maserati",
        "model": "Expedition",
        "type": "Minivan",
        "fuel": "Electric",
        "year": 1994,
        "price": 100000
      },
      {
        "id": 26,
        "manufacturer": "Renault",
        "model": "Grand Caravan",
        "type": "SUV",
        "fuel": "Gasoline",
        "year": 1998,
        "price": 30000
      },
      {
        "id": 27,
        "manufacturer": "Land Rover",
        "model": "Explorer",
        "type": "Crew Cab Pickup",
        "fuel": "Hybrid",
        "year": 2019,
        "price": 160000
      },
      {
        "id": 28,
        "manufacturer": "BYD",
        "model": "Charger",
        "type": "Cargo Van",
        "fuel": "Gasoline",
        "year": 2022,
        "price": 30000
      },
      {
        "id": 29,
        "manufacturer": "Volvo",
        "model": "Jetta",
        "type": "Sedan",
        "fuel": "Electric",
        "year": 2000,
        "price": 40000
      },
      {
        "id": 30,
        "manufacturer": "Suzuki",
        "model": "XC90",
        "type": "Passenger Van",
        "fuel": "Hybrid",
        "year": 1997,
        "price": 200000
      },
      {
        "id": 31,
        "manufacturer": "Volvo",
        "model": "Prius",
        "type": "Sedan",
        "fuel": "Electric",
        "year": 2003,
        "price": 60000
      },
      {
        "id": 32,
        "manufacturer": "Tata",
        "model": "A8",
        "type": "Convertible",
        "fuel": "Gasoline",
        "year": 2002,
        "price": 40000
      },
      {
        "id": 33,
        "manufacturer": "Lamborghini",
        "model": "Corvette",
        "type": "Cargo Van",
        "fuel": "Hybrid",
        "year": 2016,
        "price": 150000
      },
      {
        "id": 34,
        "manufacturer": "Polestar",
        "model": "Volt",
        "type": "Cargo Van",
        "fuel": "Hybrid",
        "year": 2005,
        "price": 120000
      },
      {
        "id": 35,
        "manufacturer": "Rivian",
        "model": "Model 3",
        "type": "Wagon",
        "fuel": "Electric",
        "year": 2003,
        "price": 80000
      },
      {
        "id": 36,
        "manufacturer": "Volvo",
        "model": "1",
        "type": "Convertible",
        "fuel": "Diesel",
        "year": 2017,
        "price": 100000
      },
      {
        "id": 37,
        "manufacturer": "Peugeot",
        "model": "Camaro",
        "type": "Crew Cab Pickup",
        "fuel": "Diesel",
        "year": 2015,
        "price": 90000
      },
      {
        "id": 38,
        "manufacturer": "Jeep",
        "model": "Land Cruiser",
        "type": "Crew Cab Pickup",
        "fuel": "Hybrid",
        "year": 1991,
        "price": 160000
      },
      {
        "id": 39,
        "manufacturer": "Maserati",
        "model": "XTS",
        "type": "Hatchback",
        "fuel": "Electric",
        "year": 2006,
        "price": 180000
      },
      {
        "id": 40,
        "manufacturer": "Smart",
        "model": "Alpine",
        "type": "Sedan",
        "fuel": "Hybrid",
        "year": 1998,
        "price": 160000
      }
    ]
  })
})
