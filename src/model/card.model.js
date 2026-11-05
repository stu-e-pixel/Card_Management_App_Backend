const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      default: "https://placehold.co/600x400?text=Default+Image",
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      default: "default_image",
      trim: true,
    },
  },
  { _id: false }
);

const CoverImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      default: "https://placehold.co/1200x400?text=Default+Cover",
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      default: "default_cover_image",
      trim: true,
    },
  },
  { _id: false }
);

const CardSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  card_holder_name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  phone: {
    type: Number,
    required: [true, "Phone is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
  },
  website: {
    type: String,
    required: [true, "website is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "address is required"],
    trim: true,
  },
  social_links: {
    type: String,
    trim: true,
  },
  
image: {
  type: ImageSchema,
  default: () => ({}),
},

cover_image: {
  type: CoverImageSchema,
  default: () => ({}),
},

  status:{
    type:String,
    enum:["active","inactive"],
    default:"active",
    trim:true
  },
  is_Deleted:{
    type:Boolean,
    default:false
  }

},{
    timestamps:true
});




const CardModel = mongoose.model("card", CardSchema);
module.exports = CardModel;
