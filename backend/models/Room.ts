import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
    RoomName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'mixed'],
        default: 'mixed'
    },
    members: [
        {
            uniqueId: {
                type: String,
            },
            email: {
                type: String,
            }
        }
    ],
    Capacity: {
        type: Number,
        default: 0
    }
});

export const Room = model("Room", RoomSchema);
