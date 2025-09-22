import mongoose from "mongoose";

const FarmerSchema = new mongoose.Schema({
    nameOfFarmer: {
        type: String,
        require: true,
    },
    FarmerNumber: {
        type: Number,
        require: true,
    },
    FarmerLocation: {
        village: {
            type: String,
        },
        taluka: {
            type: String,
        },
        district: {
            type: String,
        },
        country: {
            type: String,
        },
        postcode: {
            type: String,
        },
    },

})


const farmer = mongoose.models.Farmersir || mongoose.model("Farmersir", FarmerSchema)

export default farmer