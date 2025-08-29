import dotevn from "dotenv"
import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";



const PORT = process.env.PORT 


const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: ["http://localhost:3000", process.env.DOMAIN_URL!, process.env.APP_URL!] }));

app.use(errorHandler);


app.listen(PORT, () => {
    console.log( " server is listening on port", PORT)
})