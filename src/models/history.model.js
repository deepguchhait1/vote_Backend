import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    titel: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    winer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    other_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);
export default History;
