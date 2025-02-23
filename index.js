const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const route = require("./routes/index.route");

// console.log(require('crypto').randomBytes(64).toString('hex'));

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// parse application/json
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Kết nối database thành công."))
    .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.use(
    cors({
        origin: "*"
    })
)

route(app);

app.listen(port, () => {
    console.log("Đang chạy trên cổng: " + port);
})