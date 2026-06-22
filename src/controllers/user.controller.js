import User from "../models/user.model.js";
import Agent from "../models/agent.model.js";
import Count from "../models/count.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userSignup = async (req, res) => {
  try {
    const { name, email, phone, dob, password } = req.body;
    if (!name) return res.status(300).json({ msg: "Name is Required" });
    if (!email) return res.status(300).json({ msg: "Email is Required" });
    if (!phone)
      return res.status(300).json({ msg: "Phone Number is Required" });
    if (!dob) return res.status(300).json({ msg: "Date of Birth is Required" });

    // Check if user is at least 18 years old
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      return res
        .status(300)
        .json({ msg: "You must be at least 18 years old to register" });
    }

    if (!password) return res.status(300).json({ msg: "Password is Required" });

    const emailEX = await User.findOne({ email });
    if (emailEX)
      return res.status(300).json({ msg: "The email is already have." });

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    console.log(name, email, password, dob, hashPass);
    const newUser = await User.create({
      name,
      email,
      phone,
      dob,
      password: hashPass,
    });
    if (!newUser)
      return res.status(300).json({ msg: "The User is not Created" });
    res.status(200).json({ data: newUser });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in userSignup controller :", error);
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(300).json({ msg: "Email is Required" });
    if (!password) return res.status(300).json({ msg: "Password is Required" });

    const emailEX = await User.findOne({ email });
    if (!emailEX)
      return res.status(300).json({ msg: "The email is not exiests." });

    const passMatch = await bcrypt.compare(password, emailEX.password);

    if (!passMatch) {
      return res.status(300).json({ msg: "Invalied credintials" });
    }
    const token = jwt.sign({ id: emailEX._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });
    res.cookie("user", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ data: emailEX });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in userLogin controller :", error);
  }
};

export const userLogout = (req, res) => {
  try {
    res.clearCookie("user");
    res.status(200).json({ msg: "Logout Successfull" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in userLogout controller :", error);
  }
};

export const getAgentsForVoting = async (req, res) => {
  try {
    const agents = await Agent.find({});
    res.status(200).json({ data: agents });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getAgentsForVoting controller :", error);
  }
};

export const castVote = async (req, res) => {
  try {
    const { agentId } = req.body;
    const userId = req.user._id;

    if (!agentId) return res.status(400).json({ msg: "Agent ID is required" });

    // Check if user already voted
    const existingVote = await Count.findOne({ vote_id: userId });
    if (existingVote) {
      return res.status(400).json({ msg: "You have already voted" });
    }

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ msg: "Candidate not found" });
    }

    // Create vote record
    const vote = await Count.create({
      vote_id: userId,
      agent_id: agentId,
      vote_status: true,
    });

    res.status(200).json({ msg: "Vote cast successfully", data: vote });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in castVote controller :", error);
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getUserProfile controller :", error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");

    res
      .status(200)
      .json({ msg: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in updateUserProfile controller :", error);
  }
};

// Get vote status
export const getVoteStatus = async (req, res) => {
  try {
    const vote = await Count.findOne({ vote_id: req.user._id }).populate(
      "agent_id",
      "name party_name",
    );

    if (!vote) {
      return res.status(200).json({ hasVoted: false });
    }

    res.status(200).json({
      hasVoted: true,
      votedFor: vote.agent_id,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getVoteStatus controller :", error);
  }
};

// Get voting results
export const getResults = async (req, res) => {
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
          image: "$candidateInfo.image",
        },
      },
      {
        $sort: { voteCount: -1 },
      },
    ]);

    const totalVotes = await Count.countDocuments();

    res.status(200).json({
      data: results,
      totalVotes,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in getResults controller :", error);
  }
};
