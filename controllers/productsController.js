const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
const factory = require("./handlersFactory");
const Products = require("../models/productsModel");
const { uploadMixOfImages } = require("../middleware/uploadImage");

/**
 * @desc upload img cover and images of the product
 */
exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

/**
 * @desc resize product images
 */
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuid()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1300)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuid()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );

    next();
  }
});

/**
 * @desc    create new product
 * @route   api/v1/products
 * @method  POST
 * @access  private/admin
 */
exports.createProduct = factory.createOne(Products);

/**
 * @desc    get specific product
 * @route   api/v1/products/:id
 * @method  GET
 * @access  public
 */
exports.getProduct = factory.getOne(Products);

/**
 * @desc    get All products
 * @route   api/v1/products
 * @method  GET
 * @access  public
 */
exports.getAllProducts = factory.getAll(Products, "Products");

/**
 * @desc    update product
 * @route   api/v1/products/:id
 * @method  PUT
 * @access  private/admin
 */
exports.updateProduct = factory.updateOne(Products);

/**
 * @desc    delete product
 * @route   api/v1/products/:id
 * @method  DELETE
 * @access  private/admin
 */
exports.deleteProduct = factory.deleteOne(Products);
