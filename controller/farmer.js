import { createToken, getvalidData } from "../auth/user.js";
import farmer from "../model/User.js";
import { getrandomId } from "../utils/randomID.js";

export const createAccount = async (req, res) => {
    console.log(req.body)
    try {
        const { name, number, location } = req.body;
        const farmerExist = await farmer.findOne({ FarmerNumber: number })
        if (!farmerExist) {
            const idofCollector = getrandomId()
            const farmerMan = await farmer.create({
                CollectorId: idofCollector,
                farnameOfFarmer: name,
                FarmerNumber: number,
                FarmerLocation: {
                    village: location.village,
                    taluka: location.taluka,
                    district: location.district,
                    country: location.country,
                    postcode: location.state,
                    city: location.city,
                }
            })
            const token = await createToken(farmerMan)
            res.json({ success: true, msg: "Account created successfully", tokens: token });
        } else {
            res.json({ success: false, msg: "This Number is Alredy Exist" });
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, msg: "Server Error" });
    }
}


export const UserAuth = async (req, res) => {
    try {
        const { token } = req.body
        const id = getvalidData(token)
        const FarmerData = await farmer.findById(id._id)
        res.json({
            success: true,
            users: FarmerData
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Non-Autheriesed!"
        })
    }
}


export const Login = async (req, res) => {
    try {
        const  {Id} = req.body
        const data = await farmer.findOne({ CollectorId: Id })
        if (data) {
            const token = await createToken(data)
            res.json({
                success: true,
                tokens: token,
                datas:data,
                msg: "Login SucessFully"
            })
        } else {
            res.json({
                success: false,
                msg: "InCorrect FarmerId"
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "Server Error"
        })
    }
}