const express = require("express");
const app = express();
const authServer = require("./routes/authServer");
//db conncet
const dbConnect = require("./dbConnection");
require("dotenv/config");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user',authServer);
dbConnect();

//port
const PORT = process.env.PORT || 3000;

//How to we start listening to the server
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
