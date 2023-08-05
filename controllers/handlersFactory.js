const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
const ApiFeatures = require("../utils/ApiFeatures");
const ApiError = require("../utils/ApiError");

// Image processing
exports.resizeImage = (name, sizeX, sizeY) =>
  asyncHandler(async (req, res, next) => {
    // if directory doesn't exist then make it
    if (!fs.existsSync(path.join(__dirname, "..", "uploads", name)))
      await fsPromises.mkdir(path.join(__dirname, "..", "uploads", name));

    if (req.file) {
      const filename = `${name}-${uuid()}-${Date.now()}.jpeg`;
      await sharp(req.file.buffer)
        .resize(sizeX, sizeY)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`uploads/${name}/${filename}`);

      // Save image into our db
      if (name === "user") req.body.profileImg = filename;
      else req.body.image = filename;
    }

    next();
  });

/**
 * @desc    create new document
 * @method  POST
 */
exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(200).json({ data: document });
  });

/**
 * @desc    get specific document by id
 * @method  GET
 */
exports.getOne = (Model, populateOpt, selectOpt = "") =>
  asyncHandler(async (req, res, next) => {
    const query = Model.findById(req.params.id).select(selectOpt);
    if (populateOpt) {
      query.populate(populateOpt);
    }

    const document = await query;

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ data: document });
  });

/**
 * @desc    gat all documents
 * @method  GET
 */
exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(), req.query)
      .paginate(documentsCounts)
      .filter()
      // in case of product search in title or description
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

/**
 * @desc    update specific document by id
 * @method  PUT
 */
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

/**
 * @desc    delete specific document by id
 * @method  DELETE
 */
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ status: true });
  });
