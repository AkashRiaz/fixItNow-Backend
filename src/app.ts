import express, { Application, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app:Application = express();



app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());


app.get("/test", (req:Request, res:Response)=>{
    res.json({
        success: true,
        message: "This is test route"
    })
})


export default app;