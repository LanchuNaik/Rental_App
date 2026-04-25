const User = require("./user.model");

// GET /api/profile — logged in user fetches their own profile
const getProfile = async (req, res) => {
  try {
    // req.user.userId comes from the JWT token (set by authMiddleware)
    const user = await User.findById(req.user.userId).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/profile — logged in user updates their own profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio } = req.body;

    // Build update object — only include fields that were actually sent
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;  // allow empty string to clear bio

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }   // return the updated document, not the old one
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated", data: user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/profile/avatar — logged in user uploads a profile photo
const updateAvatar = async (req, res) => {
  try {
    // multer puts the uploaded file info on req.file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // req.file.path = "uploads/avatars/filename.jpg" (relative path on server)
    const avatarPath = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: avatarPath },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Avatar updated", data: user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/users/:id — anyone can view a public profile
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name bio avatar createdAt");
    // only return safe public fields — no email, phone, password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/profile/avatar — remove the user's profile photo
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $unset: { avatar: "" } },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Avatar removed", data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/profile/role — logged in user sets their role
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['renter', 'owner', 'both'];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be one of: renter, owner, both" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { role },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Role updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, deleteAvatar, getPublicProfile, updateRole };
