const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();


const app = express();
connectDB();
const PORT =  process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get('/', (req, res) => {
    res.send("CareerGPS AI app running")
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
app.post("/api/test", (req, res) => {
    console.log(req.body);
    res.json({
        message: "Data received successfully",
        data: req.body
    });
});
const analysisRoutes = require("./routes/analysisRoutes");
app.use("/api/analysis", analysisRoutes);