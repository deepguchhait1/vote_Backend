import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    party_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    party_image: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;
