const User = require("./auth.model");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const login = async (req, res)=>{
  try{
      const {email,password} =req.body;
  
    // 1. check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // 3. success
    res.json({
      message: "Login successful",
      user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = { signup, login };