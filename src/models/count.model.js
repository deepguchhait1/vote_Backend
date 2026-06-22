import mongoose from "mongoose";

const countSchema = new mongoose.Schema(
  {
    vote_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    vote_status: {
      type: Boolean,
      default: false,
    },
    result_status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Count = mongoose.model("Count", countSchema);
export default Count;
