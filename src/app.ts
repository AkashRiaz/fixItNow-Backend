import express, { Application, Request, Response } from "express"

const app:Application = express();

app.get("/test", (req:Request, res:Response)=>{
    res.json({
        success: true,
        message: "This is test route"
    })
})


export default app;