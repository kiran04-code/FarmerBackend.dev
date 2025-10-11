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
    const products = [];
    let pageOffset = 0;
    const pageLimit = 100; // max items per request

    // Properly encode the filter
    const filter = encodeURIComponent(JSON.stringify({ value: "product", op: "eq" }));

    while (true) {
      // Fetch pinned products with filter, pagination
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=${pageLimit}&pageOffset=${pageOffset}&metadata[keyvalues][type]=${filter}`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3MDBkYmZkZi1jNTE0LTQxMTYtODAxMi1iY2Q1YTQ1MTZiNzYiLCJlbWFpbCI6ImtpcmFuLnJhdGhvZDI0QHZpdC5lZHUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNTdlYTBjNjQxOGJkNGNjMTRmZGYiLCJzY29wZWRLZXlTZWNyZXQiOiI2ZDMxM2NiYzYwOWYwNzNmZWEyZmFmNDNmZjNkNGQ5MjdkZDFhODJmNDRjZGZlN2EzODM4Y2M3OTAzNGUzY2UxIiwiZXhwIjoxNzkxNzIwMTQyfQ.CHkULefgJ6lq_-lCN3s7bEg95Z4lMePSoVSDFLq73ck`
          },
        }
      );

      const rows = response.data.rows;
      if (!rows || rows.length === 0) break; // no more products

      // Fetch IPFS data for each product in parallel
      const productDetails = await Promise.all(
        rows.map(async (p) => {
          try {
            const ipfsHash = p.ipfs_pin_hash;
            const { data: ipfsData } = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

            return {
              productId: ipfsData.productId || "",
              farmerId: ipfsData.farmerId || "",
              productName: ipfsData.productName || "",
              location: ipfsData.location || "",
              temperature: ipfsData.temperature || "",
              humidity: ipfsData.humidity || "",
              soilMoisture: ipfsData.soilMoisture || "",
              images: ipfsData.images || [],
              type: ipfsData.type || "product",
            };
          } catch (err) {
            console.error(`Failed IPFS fetch for ${p.ipfs_pin_hash}:`, err.message);
            return null; // skip failed items
          }
        })
      );

      products.push(...productDetails.filter((p) => p !== null));
      pageOffset += pageLimit; // next page
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
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











