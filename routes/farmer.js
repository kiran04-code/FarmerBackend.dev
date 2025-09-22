import express from "express";
import { createAccount } from "../controller/farmer.js";


  export const farmerRoutes = express.Router()
farmerRoutes.post("/createAccount",createAccount)