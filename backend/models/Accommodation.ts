import { Schema, model } from "mongoose";

const AccommodationSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    uniqueId: {
        type: String,
        required: true,
    },
    college: {
        type: String,
        required: true,
    },
    residentialAddress: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    day: {
        type: String,
        enum: ["12", "13", "14", "12 & 13", "13 & 14", "12, 13 & 14"],
    },
    remarks: {
        type: String,
        default: "",
    },
    vacated: {
        type: Boolean,
        default: false,
    },
    optin: {
        type: Boolean,
        default: true,
    },
    allocated: {
        type: Boolean,
        default: false,
    }
});

export const Accommodation = model("Accommodation", AccommodationSchema);
