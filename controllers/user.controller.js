const { generateRandomNumber } = require("../helpers/generate.helper");
const { sendMail } = require("../helpers/send-mail.helper");
const ForgotPassword = require("../models/forgot-password.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// [POST] users/create-account
module.exports.createAccountPost = async (req, res) => {
    
    const {name, email, password, profileImageUrl} = req.body;

    try {
        if(!name)
        {
            return res.status(400).json({error: true, message: "Tên không được để tróng"});
        }
    
        if(!email)
        {
            return res.status(400).json({error: true, message: "Email không được để tróng"});
        }
    
        if(!password)
        {
            return res.status(400).json({error: true, message: "Mật khẩu không được để tróng"});
        }
    
        const userExist = await User.findOne({email: email});
    
        if(userExist)
        {
            return res.json({error: true, message: "Người dùng đã tồn tại"});
        }
    
        const user = new User({
            fullName: name,
            email: email,
            password: password,
            profileImageUrl
        });
    
        await user.save();
    
        const record_user = user.toObject();

        delete record_user.password;
    
        const accessToken = jwt.sign({user: record_user}, process.env.SECRET_TOKEN, {expiresIn: "36000m"});
    
        return res.json({
            error: false,
            user: record_user,
            accessToken,
            message: "Tạo tài khoản thành công"
        })
        
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}

// [POST] /users/login
module.exports.loginPost = async (req, res) => {

    const {email, password} = req.body;

    try {
        if(!email)
        {
            return res.status(400).json({error: true, message: "Email không được để tróng"});
        }

        if(!password)
        {
            return res.status(400).json({error: true, message: "Mật khẩu không được để tróng"});
        }

        const userInfo = await User.findOne({email: email});

        if(!userInfo)
        {
            return res.status(400).json({error: true, message: "Không tìm thấy tài khoản"});
        }

        if(!(await userInfo.comparePassword(password)))
        {
            return res.status(400).json({
                error: true,
                message: "Mật khẩu sai"
            })
        }

        const user = userInfo.toObject();
        delete user.password; 

        const accessToken = jwt.sign({user}, process.env.SECRET_TOKEN, {expiresIn: "36000m"});

        return res.json({
            error: false,
            email,
            accessToken,
            message: "Đăng nhập thành công"
        })
        
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}

// [GET] /users/get-info
module.exports.getInfoUser = async (req, res) => {
    const {user} = req.user;

    try {
        const userExist = await User.findOne({_id: user._id}).select("-password");
        
        if(!userExist)
        {
            return res.status(401);
        }

        return res.json({error: false, userExist, message: "Lấy thông tin người dùng thành công"});
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}


// upload image
module.exports.uploadImage = (req, res) => {
    if(!req.file)
    {
        return res.status(400).json({message: "No file upload"});
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({imageUrl});
}


// [POST] /users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const userExist = await User.findOne({email: email});
        if(!userExist)
        {
            return res.json({error: true, message: "Email không tồn tại"});
        }

        await ForgotPassword.deleteMany({email: userExist.email});
        
        // sinh mã OTP
        const otp = generateRandomNumber(8);
        // lưu vào database
        const objectPassword = {
            email: email,
            otp: otp
        };

        const record = new ForgotPassword(objectPassword);
        await record.save();
        // gửi email
        const subject = `Mã OTP lấy lại lại mật khẩu`;
        const content = `Mã OTP của bạn là <b>${otp}</b>. <br> Vui lòng không chia sẻ với bất cứ ai. <br> <i>Mã có hiệu lực trong 5 phút</i>`;
        
        sendMail(email, subject, content);

        return res.json({error: false, message: "Đã gửi mã OTP vào email"});

    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}


// [POST] /users/password/otp
module.exports.otpPassword = async (req, res) => {
    const {otp} = req.body;
    try {
        const otpExist = await ForgotPassword.findOne({otp: otp});
        if(!otpExist)
        {
            return res.json({error: true, message: "Mã OTP không đúng."});
        }

        const user = await User.findOne({email: otpExist.email}).select("-password");

        const accessToken = jwt.sign({user}, process.env.SECRET_TOKEN, {expiresIn: "36000m"});

        await ForgotPassword.deleteOne({otp: otp});

        return res.json({error: false, message: "Nhập mã OTP thành công", accessToken});

    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}

// [POST] /users/password/reset
module.exports.resetPassword = async (req, res) => {
    const {accessToken, newPassword} = req.body;
    try {
        try {
            const decoded = jwt.verify(accessToken, process.env.SECRET_TOKEN);
            const {email} = decoded.user;
            const userExist = await User.findOne({email: email});
            if(!userExist)
            {
                return res.json({error: true, message: "Token không hợp lệ"});
            }
            const hashPassword = await bcrypt.hash(newPassword, 10)

            await User.updateOne({email: email}, {password: hashPassword});

            return res.json({error: false, message: "Tạo mới mật khẩu thành công."})
        } catch (error) {
            return res.status(401).json({error: true, message: "Token không hợp lệ hoặc hết hạn"});
        }
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error.message});
    }
}