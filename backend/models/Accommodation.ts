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
    breakfast1: {
        type: Boolean,
        default: false,
    },
    breakfast2: {
        type: Boolean,
        default: false,
    },
    dinner1: {
        type: Boolean,
        default: false,
    },
    dinner2: {
        type: Boolean,
        default: false,
    },
    amenities: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    payment: {
        type: Boolean,
        default: false,
    },
    vacated: {
        type: Boolean,
        default: false,
    },
    optin: {
        type: Boolean,
        default: false,
    }
});

export const Accommodation = model("Accommodation", AccommodationSchema);
