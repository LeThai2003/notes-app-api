const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Kết nối database thành công.");

    app.listen(port, () => {
      console.log("Đang chạy trên cổng: " + port);
    });
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));