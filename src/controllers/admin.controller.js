import Admin from "../models/admin.model.js";
import Agent from "../models/agent.model.js";
import User from "../models/user.model.js";
import Count from "../models/count.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(300).json({ msg: "All fileds are Required" });

    const emailEX = await Admin.findOne({ email });
    if (!emailEX) return res.status(300).json({ msg: "No user Found" });

    const comPass = await bcrypt.compare(password, emailEX.password);
    if (!comPass) return res.status(300).json({ msg: "Invalied Credintial" });

    const token = jwt.sign({ admin: emailEX._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });
    res.cookie("admin", token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none' to work
      sameSite: "none", // Allows cross-site cookie transmission
      maxAge: 24 * 60 * 60 * 1000, // example: 1 day
    });
    res.status(200).json({ data: emailEX });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in adminLogin controller :", error);
  }
};

export const adminSign = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashPass,
    });
    console.log(admin);
    res.status(200).json({ msg: "Admin Created" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in adminLogin controller :", error);
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("admin", {
      httpOnly: true,
      secure: true, 
      sameSite: "none", 
    });
    res.status(200).json({ msg: "Logout Successfull !!" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in adminLogin controller :", error);
  }
};

export const addAgent = async (req, res) => {
  try {
    const { name, party_name, email, phone } = req.body;
    if (!name || !party_name || !email || !phone)
      return res.status(300).json({ msg: "All fileds are required" });
    const newAgent = await Agent.create({ name, party_name, email, phone });
    res.status(200).json({ msg: "Add agent Successfull !!", data: newAgent });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in admin AddAgent controller :", error);
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({});
    res.status(200).json({ data: agents });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in admin getAgents controller :", error);
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    res.status(200).json({ data: admin });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getAdminProfile controller :", error);
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      updateData,
      { new: true },
    ).select("-password");

    res
      .status(200)
      .json({ msg: "Profile updated successfully", data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in updateAdminProfile controller :", error);
  }
};

// Update agent/candidate
export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, party_name, email, phone, image, party_image } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (party_name) updateData.party_name = party_name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (image) updateData.image = image;
    if (party_image) updateData.party_image = party_image;

    const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAgent) {
      return res.status(404).json({ msg: "Candidate not found" });
    }

    res
      .status(200)
      .json({ msg: "Candidate updated successfully", data: updatedAgent });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in updateAgent controller :", error);
  }
};

// Delete agent/candidate
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAgent = await Agent.findByIdAndDelete(id);

    if (!deletedAgent) {
      return res.status(404).json({ msg: "Candidate not found" });
    }

    // Also delete associated votes
    await Count.deleteMany({ agent_id: id });

    res.status(200).json({ msg: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in deleteAgent controller :", error);
  }
};

// Get voting results with detailed statistics
export const getVotingResults = async (req, res) => {
  try {
    const results = await Count.aggregate([
      {
        $group: {
          _id: "$agent_id",
          voteCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "candidateInfo",
        },
      },
      {
        $unwind: "$candidateInfo",
      },
      {
        $project: {
          _id: 1,
          voteCount: 1,
          name: "$candidateInfo.name",
          party_name: "$candidateInfo.party_name",
          email: "$candidateInfo.email",
          image: "$candidateInfo.image",
          party_image: "$candidateInfo.party_image",
        },
      },
      {
        $sort: { voteCount: -1 },
      },
    ]);

    const totalVotes = await Count.countDocuments();
    const totalUsers = await User.countDocuments();

    // Calculate percentages
    const resultsWithPercentage = results.map((result) => ({
      ...result,
      percentage:
        totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      data: resultsWithPercentage,
      totalVotes,
      totalUsers,
      votingPercentage:
        totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getVotingResults controller :", error);
  }
};

// Publish results (mark as published)
export const publishResults = async (req, res) => {
  try {
    await Count.updateMany({}, { result_status: true });
    res.status(200).json({ msg: "Results published successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in publishResults controller :", error);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    const totalUsers = await User.countDocuments();
    const votedUsers = await Count.distinct("vote_id");

    res.status(200).json({
      data: users,
      totalUsers,
      votedCount: votedUsers.length,
      notVotedCount: totalUsers - votedUsers.length,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getAllUsers controller :", error);
  }
};
