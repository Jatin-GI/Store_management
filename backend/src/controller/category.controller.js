const { cloudinary } = require("../config/cloudinaryConfig");
const fs = require("fs");
const { Category } = require("../models");

const createCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "category name Required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Category image Required" });
    }

    const localFilePath = req.file.path;
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      folder: "store_management/category",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    const category = await Category.create({
      name,
      image: cloudinaryResponse.secure_url,
      created_by: user_id,
    });

    return res.status(200).json({
      data: category,
      message: "category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      data: categories,
      message: "categories fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name } = req.body;
    const updates = {};
    if (name) updates.name = name;

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "store_management/category",
      });
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      updates.image = uploaded.secure_url;
    }

    await category.update(updates);

    return res.status(200).json({
      data: category,
      message: "category updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();

    return res.status(200).json({
      message: "category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
