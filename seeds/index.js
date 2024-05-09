const mongoose = require("mongoose");
const Campground = require("../models/campground");
const Review = require("../models/review");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");


mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
//Or just simply .then() és .catch()
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 1000; i++) {
        const loc = sample(cities);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID (admin)
            author: "662a3c399fd9534657da332e",
            location: loc.city + ", " + loc.state,
            geometry: { 
                type: 'Point', 
                coordinates: [ loc.longitude, loc.latitude ] 
            },
            title: sample(descriptors) + " " + sample(places),
            price: price,
            //image: "https://source.unsplash.com/collection/483251",
            images: [
                {
                    url: 'https://res.cloudinary.com/dp2xr7jgj/image/upload/v1714323046/YelpCamp/tgk0asmyexz5xan69kgd.jpg',
                    filename: 'YelpCamp/tgk0asmyexz5xan69kgd',
                  },
                  {
                    url: 'https://res.cloudinary.com/dp2xr7jgj/image/upload/v1714323047/YelpCamp/g3hakos86oc5e3vy7pgo.jpg',
                    filename: 'YelpCamp/g3hakos86oc5e3vy7pgo',
                  },
                  {
                    url: 'https://res.cloudinary.com/dp2xr7jgj/image/upload/v1714323049/YelpCamp/vkhfqlhezra8araacixg.jpg',
                    filename: 'YelpCamp/vkhfqlhezra8araacixg',
                  }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus unde labore iure minima dolore in inventore aliquid maxime vitae autem fuga itaque, modi id sed. Recusandae cum expedita maxime doloremque."
        });
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })