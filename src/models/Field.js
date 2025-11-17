import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    placeholder: {
        type: String
    },
    // department this field belongs to (vmd, cad, commercial, mmc or global)
    department: {
        type: String,
        default: 'global'
    },
    // whether the field is required when creating/updating an SRD
    isRequired: {
        type: Boolean,
        default: false
    },
    // a slug/key used by SRD records (optional)
    slug: {
        type: String
    },
    // soft-delete / active flag so removing a field does not delete existing SRD data
    active: {
        type: Boolean,
        default: true
    }
})

export default mongoose.models.Field || mongoose.model("Field", FieldSchema);