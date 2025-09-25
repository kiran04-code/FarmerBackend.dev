import express from "express";
import { createAccount, fetchProducts, Login, UserAuth } from "../controller/farmer.js";
export const farmerRoutes = express.Router()
farmerRoutes.post("/createAccount", createAccount)
farmerRoutes.post("/UserAuth", UserAuth)
farmerRoutes.post("/Login", Login)
farmerRoutes.get("/products/:farmerId", fetchProducts)
