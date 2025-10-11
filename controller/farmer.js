import { createToken, getvalidData } from "../auth/user.js";
import farmer from "../model/User.js";
import { farmerRoutes } from "../routes/farmer.js";
import { getrandomId } from "../utils/randomID.js";
import axios from "axios"
export const createAccount = async (req, res) => {
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
         console.error("CreateAccount Error:", error);  // <-- log in Render logs
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



export const fetchProducts = async (req, res) => {
  const { farmerId } = req.params; // or req.params if using URL param
  console.log(farmerId)
  try {
  const metadataFilter = farmerId
  ? {
      type: { value: "product", op: "eq" },
      farmerId: { value: farmerId, op: "eq" },
    }
  : {
      type: { value: "product", op: "eq" },
    };
    const response = await axios.get(
      `https://api.pinata.cloud/data/pinList?status=pinned&limit=100&metadata[keyvalues]=${encodeURIComponent(
        JSON.stringify(metadataFilter)
      )}`,
      {
        headers: {
          pinata_api_key: "9ee892bfc12b953147be",
          pinata_secret_api_key: "c85fc4ba88949c3302c358f04734f9b51b2c971f1de682e0f90304eb6a8a01d3",
        },
      }
    );

    const pinnedJSONs = response.data.rows;

    // Fetch actual JSON content from IPFS
    const products = await Promise.all(
      pinnedJSONs.map(async (item) => {
        try {
          const { data } = await axios.get(
            `https://emerald-lazy-moose-425.mypinata.cloud/ipfs/${item.ipfs_pin_hash}`
          );
          return { ...data, ipfsHash: item.ipfs_pin_hash };
        } catch (err) {
          console.log("Error fetching IPFS JSON:", err.message);
          return null;
        }
      })
    );

    // Send only valid products
    res.json(products.filter(Boolean));
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};




export const allproductes = async (req, res) => {
  try {
    // 1️⃣ Fetch pinned products from Pinata
    const response = await axios.get(
      "https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][type]={\"value\":\"product\",\"op\":\"eq\"}&pageLimit=1",
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3MDBkYmZkZi1jNTE0LTQxMTYtODAxMi1iY2Q1YTQ1MTZiNzYiLCJlbWFpbCI6ImtpcmFuLnJhdGhvZDI0QHZpdC5lZHUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNTdlYTBjNjQxOGJkNGNjMTRmZGYiLCJzY29wZWRLZXlTZWNyZXQiOiI2ZDMxM2NiYzYwOWYwNzNmZWEyZmFmNDNmZjNkNGQ5MjdkZDFhODJmNDRjZGZlN2EzODM4Y2M3OTAzNGUzY2UxIiwiZXhwIjoxNzkxNzIwMTQyfQ.CHkULefgJ6lq_-lCN3s7bEg95Z4lMePSoVSDFLq73ck`
        },
      }
    );

    const products = response.data.rows;

    if (products.length === 0) {
      return res.status(404).json({ message: "No product found" });
    }

    // 2️⃣ Get first product's IPFS hash
    const singleProduct = products[0];
    const ipfsHash = singleProduct.ipfs_pin_hash;

    // 3️⃣ Fetch full JSON from IPFS
    const { data } = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    // 4️⃣ Return full data including IPFS content
    res.json({
      success: true,
      data: data, // This includes productId, farmerId, images, temperature, etc.
      ipfsMetadata: singleProduct // Optional: includes Pinata metadata like size, date_pinned
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const DatafromvedantAPI = async(req,res)=>{
 try {
    const {data} = await axios.get("https://esp32-nodeserver.onrender.com/data")
  console.log(data)
  res.json({
    dataFromPolawar:data
  })
 } catch (error) {
    res.json({
      success:false,
      message:"wifi is off"
    })
 }

}







