import express from "express"
import  {config} from "dotenv"
config();
const app = express()
const PORT = process.env.LOCAL_PORT || 8081;
app.get("/",(req,res)=>{
    res.send("server is Runing!")
})
app.listen(PORT,(req,res)=>{
    console.log(`Local Server is Runing on Port:http://localhost:${PORT}`)
    // console.log(`Live Server run :${ process.env.DEPLOYED_URL}`)
})