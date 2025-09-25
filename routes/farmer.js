import express from "express";
import { allproductes, createAccount, DatafromvedantAPI, fetchProducts, Login, UserAuth } from "../controller/farmer.js";
export const farmerRoutes = express.Router()
farmerRoutes.post("/createAccount", createAccount)
farmerRoutes.post("/UserAuth", UserAuth)
farmerRoutes.post("/Login", Login)
farmerRoutes.get("/products/:farmerId", fetchProducts)
farmerRoutes.get("/allproductes", allproductes)
farmerRoutes.get("/DatafromvedantAPI", DatafromvedantAPI)
