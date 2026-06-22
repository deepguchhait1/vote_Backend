import mongoose from "mongoose";

const timeSchema = new mongoose.Schema(
  {
    titel: {
      type: String,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    
  },
  { timestamps: true }
);

const Time = mongoose.model("Time", timeSchema);
export default Time;
export default Time;
