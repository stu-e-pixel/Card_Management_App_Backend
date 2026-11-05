const statuscode = require("../../utils/statuscode");
const Card = require("../../model/card.model");
const cloudinary = require("../../config/cloudinary.config");
const mongoose = require('mongoose');

const {
  getCardCache,
  setCardCache,
  delCardCache,
} = require("../../services/cardCache");

class CardController {
  async createCard(req, res) {
    let uploadFiles = [];
    try {
      const {
        title,
        card_holder_name,
        description,
        category,
        phone,
        email,
        website,
        address,
        social_links,
      } = req.body;

      const imageFile = req.files?.image?.[0];
      const coverImageFile = req.files?.cover_image?.[0];

      uploadFiles = [imageFile, coverImageFile].filter(Boolean);
      

      const existingCard = await Card.findOne({ title });

      if (existingCard) {
        await Promise.all(
          uploadFiles.map((file) => {
            cloudinary.uploader.destroy(file.filename);
          }),
        );

        return res.status(statuscode.NOT_FOUND).json({
          status: false,
          message: "Card already exist",
        });
      }

      const newCard = new Card({
        title,
        card_holder_name,
        description,
        category,
        phone,
        email,
        website,
        address,
        social_links,
        ...(imageFile && {
          image: {
            url: imageFile.path,
            public_id: imageFile.filename,
          },
        }),
        ...(coverImageFile && {
          cover_image: {
            url: coverImageFile.path,
            public_id: coverImageFile.filename,
          },
        }),
        status: "active",
      });

      const cardData = await newCard.save();
      await delCardCache();

      return res.status(statuscode.OK).json({
        status: true,
        message: "Card created succesfully",
        data: cardData,
      });
    } catch (error) {
      return res.status(statuscode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  
async getCard(req, res) {
  try {
    const {
      title,
      card_holder_name,
      email,
      category,
      status,
    } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 5));

    const skip = (page - 1) * limit;

    
    const matchQuery = {
      $or: [
        { is_Deleted: false },
        { is_Deleted: { $exists: false } },
      ],
    };

    if (title) {
      matchQuery.title = {
        $regex: title,
        $options: "i",
      };
    }

    if (card_holder_name) {
      matchQuery.card_holder_name = {
        $regex: card_holder_name,
        $options: "i",
      };
    }

    if (email) {
      matchQuery.email = {
        $regex: email,
        $options: "i",
      };
    }

    if (category) {
      matchQuery.category = category;
    }

    if (status) {
      matchQuery.status = status;
    }

   
    const cacheKey = `cards:list:${JSON.stringify({
      title,
      card_holder_name,
      email,
      category,
      status,
      page,
      limit,
    })}`;

    const cachedData = await getCardCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        status: true,
        source: "redis",
        ...cachedData,
      });
    }

   
    const pipeline = [
      {
        $match: matchQuery,
      },
      {
        $facet: {
          data: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          total: [
            {
              $count: "totalCards",
            },
          ],
        },
      },
    ];

    
    const result = await Card.aggregate(pipeline);

    const cardData = result[0].data;
    const totalCards = result[0].total[0]?.totalCards || 0;

    
    const responseData = {
      count: cardData.length,
      totalCards,
      currentPage: page,
      totalPages: Math.ceil(totalCards / limit),
      data: cardData,
    };

    
    await setCardCache(cacheKey, responseData, 300);

    return res.status(200).json({
      status: true,
      source: "mongodb",
      ...responseData,
    });

  } catch (error) {
    console.error("GET CARD ERROR:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}


  
async getCardById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statuscode.BAD_REQUEST).json({
        status: false,
        message: "Invalid card ID",
      });
    }
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          $or: [
            { is_Deleted: false },
            { is_Deleted: { $exists: false } },
          ],
        },
      },
      {
        $limit: 1,
      },
    ];

    
    const cardById = await Card.aggregate(pipeline);

    
    if (!cardById.length) {
      return res.status(statuscode.NOT_FOUND).json({
        status: false,
        message: "Card not found",
      });
    }

    
    return res.status(statuscode.OK).json({
      status: true,
      data: cardById[0],
    });

  } catch (error) {
    console.error("GET CARD BY ID ERROR:", error);

    return res.status(statuscode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}


  async updateCard(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        card_holder_name,
        description,
        category,
        phone,
        email,
        website,
        address,
        social_links,
      } = req.body;

      const cardById = await Card.findById(id);

      if (!cardById) {
        return res.status(statuscode.NOT_FOUND).json({
          status: false,
          message: "Card not found",
        });
      }

      if (title !== undefined && title.trim() !== cardById.title) {
        const existingCard = await Card.findOne({
          title: title.trim(),
          _id: { $ne: cardById._id },
        });

        if (existingCard) {
          return res.status(statuscode.NOT_FOUND).json({
            status: false,
            message: "this card title already exists",
          });
        }
      }

      let image = cardById.image;
      let cover_image = cardById.cover_image;

      const imageFile = req.files?.image?.[0];
      const coverimageFile = req.files?.cover_image?.[0];

      if (imageFile) {
        image = {
          url: imageFile.path,
          public_id: imageFile.filename,
        };

        if (cardById?.image?.public_id) {
          await cloudinary.uploader.destroy(cardById?.image?.public_id);
        }
      }
      if (coverimageFile) {
        cover_image = {
          url: coverimageFile.path,
          public_id: coverimageFile.filename,
        };
        if (cardById?.cover_image?.public_id) {
          await cloudinary.uploader.destroy(cardById?.cover_image?.public_id);
        }
      }

      const updateCardById = await Card.findByIdAndUpdate(
        {
          _id: id,
          is_Deleted: false,
        },
        {
          title,
          card_holder_name,
          description,
          category,
          phone,
          email,
          website,
          address,
          social_links,
          status: "active",
          image,
          cover_image,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updateCardById) {
        return res.status(statuscode.NOT_FOUND).json({
          status: false,
          message: "Card is not updated",
        });
      }

      await delCardCache();

      return res.status(statuscode.OK).json({
        status: true,
        message: "Card is updated succesfully",
        data: updateCardById,
      });
    } catch (error) {
      return res.status(statuscode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  async softDeleteCard(req, res) {
    try {
      const { id } = req.params;

      const deletecard = await Card.findByIdAndUpdate(
        id,
        {
          $set: {
            is_Deleted: true,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      await delCardCache();

      return res.status(statuscode.OK).json({
        status: true,
        message: "Delete Card succesfully",
        data: deletecard,
      });
    } catch (error) {
      return res.status(statuscode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  async retriveDeletedCard(req, res) {
    try {
      const { id } = req.params;
      const retriveCard = await Card.findByIdAndUpdate(
        id,
        {
          $set: {
            is_Deleted: false,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );
      await delCardCache();

      return res.status(statuscode.OK).json({
        status: true,
        message: "Delete Card retrive succesfully",
        data: retriveCard,
      });
    } catch (error) {
      return res.status(statuscode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  async forceDeleteCard(req, res) {
    try {
      const { id } = req.params;

      let uploadFiles = [];
      const imageFile = req.files?.image?.[0];
      const coverImageFile = req.files?.cover_image?.[0];

      uploadFiles = [imageFile, coverImageFile].filter(Boolean);

      const forcedeteted = await Card.findByIdAndDelete(id);

      await delCardCache();

      if (forcedeteted) {
        await Promise.all(
          uploadFiles.map((file) => {
            cloudinary.uploader.destroy(file.filename);
          }),
        );

        return res.status(statuscode.OK).json({
          status: true,
          message: "Delete Card succesfully",
          data: forcedeteted,
        });
      }
    } catch (error) {
      return res.status(statuscode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CardController();
