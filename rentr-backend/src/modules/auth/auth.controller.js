const User = require("./auth.model"); // import user model to create user in DB

const signup = async (req, res) => {
  try {
    // get data from request
    const { name, email, password } = req.body;

    console.log("API HIT ✅");
    console.log(req.body);

    // create user in DB
    const user = await User.create({
      name,
      email,
      password
    });

    // send response
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

module.exports = { signup };