import mongoose from "mongoose";

const FarmerSchema = new mongoose.Schema({
    CollectorId: {
        type: String,
        require: true,
    },
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
        city: {
            type: String
        }
    },

})


const farmer = mongoose.models.Farmersir || mongoose.model("Farmersir", FarmerSchema)

export default farmer