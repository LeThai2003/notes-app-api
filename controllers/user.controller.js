const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// [POST] users/create-account
module.exports.createAccountPost = async (req, res) => {
    
    const {name, email, password} = req.body;

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
        password: password
    });

    await user.save();

    delete user.password;

    const accessToken = jwt.sign({user}, process.env.SECRET_TOKEN, {expiresIn: "36000m"});

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Tạo tài khoản thành công"
    })
}

// [POST] /users/login
module.exports.loginPost = async (req, res) => {

    const {email, password} = req.body;

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

    if(userInfo.email == email && userInfo.password == password)
    {
        delete userInfo.password;
        const user = {user: userInfo};
        const accessToken = jwt.sign(user, process.env.SECRET_TOKEN, {expiresIn: "36000m"});

        return res.json({
            error: false,
            email,
            accessToken,
            message: "Đăng nhập thành công"
        })
    }
    else
    {
        return res.status(400).json({
            error: true,
            message: "Mật khẩu sai"
        })
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
        return res.status(500).json({error: true, message: "Lỗi hệ thống"});
    }
}