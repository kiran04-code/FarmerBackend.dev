import express from "express"
import  {config} from "dotenv"
import cors  from "cors"
import { dbConnection } from "./config/db.connnection.js";
import { farmerRoutes } from "./routes/farmer.js";
config();
const app = express()
const PORT = process.env.LOCAL_PORT || 8081;
app.use(cors({
    origin:"http://localhost:8081",
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
// server check  Routes
app.get("/",(req,res)=>{
    res.send("server is Runing!")
})
// 
app.get("/testApi",(req,res)=>{
    console.log("done")
    res.json({
        name:"Kiran",
        sirname:"rathod",
    })
})
// mongodbConnection 
dbConnection(process.env.MONGOBD_ULI).then(()=>{
    console.log("MONGODB IS CONNECTED")
}).catch((err)=>{
    console.log("Error",err)
})
// Routes
app.use("/api",farmerRoutes)
app.listen(PORT,(req,res)=>{
    console.log(`Local Server is Runing on Port:http://localhost:${PORT}`)
    console.log(`Live Server run :${ process.env.DEPLOYED_URL}`)
})