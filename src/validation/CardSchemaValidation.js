
const Joi = require("joi");

const cardSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),

  card_holder_name: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 1000 characters",
    "any.required": "Description is required",
  }),

  category: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Category is required",
    "any.required": "Category is required",
  }),

  phone: Joi.alternatives()
    .try(
      Joi.string().pattern(/^\+?[0-9]{7,15}$/),
      Joi.number().integer().min(1000000).max(999999999999999)
    )
    .required()
    .messages({
      "alternatives.match": "Enter a valid phone number",
      "any.required": "Phone is required",
    }),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),

  website: Joi.string().trim().uri({ scheme: ["http", "https"] }).required().messages({
    "string.empty": "Website is required",
    "string.uri": "Enter a valid website URL, including https://",
    "any.required": "Website is required",
  }),

  address: Joi.string().trim().min(5).max(300).required().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),

  social_links: Joi.alternatives()
    .try(
      Joi.string().trim().allow(""),
      Joi.array().items(
        Joi.string().trim().uri({ scheme: ["http", "https"] })
      )
    )
    .optional(),

  status: Joi.string().valid("active", "inactive").default("active"),
});

const updateCardSchema = cardSchema.fork(
  [
    "title",
    "card_holder_name",
    "description",
    "category",
    "phone",
    "email",
    "website",
    "address",
    "social_links",
    "status",
  ],
  (schema) => schema.optional()
).min(1).messages({
  "object.min": "Provide at least one field to update",
});

module.exports = { cardSchema,updateCardSchema };
