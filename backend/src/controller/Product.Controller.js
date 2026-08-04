const generateSKU = require("../helper/skuGenerator");
const {
  Product,
  Productvariant,
  ProductImage,
  Category,
  sequelize,
} = require("../models");
const { cloudinary } = require("../config/cloudinaryConfig");
const fs = require("fs");

const parseVariants = (variants) => {
  if (!variants) return [];
  if (typeof variants === "string") return JSON.parse(variants);
  return variants;
};

const buildVariantName = (attributes = {}) => {
  const values = Object.values(attributes).filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== "",
  );
  return values.length ? values.join(" / ") : "Default";
};

const productInclude = [
  { model: Productvariant, as: "variants" },
  { model: ProductImage, as: "images" },
  { model: Category, as: "category", attributes: ["id", "name", "image"] },
];

const createProduct = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user_id = req.user.id;
    const { category_id, title, brand, description, status } = req.body;
    const variants = parseVariants(req.body.variants);

    if (!category_id || !title || !description) {
      await t.rollback();
      return res.status(400).json({
        message: "category_id, title and description are required",
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      await t.rollback();
      return res.status(400).json({
        message: "At least one variant is required",
      });
    }

    for (const v of variants) {
      if (v.price === undefined || v.price === null || v.price === "") {
        await t.rollback();
        return res.status(400).json({ message: "Each variant needs a price" });
      }
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      await t.rollback();
      return res.status(400).json({ message: "Category not found" });
    }

    const product = await Product.create(
      {
        category_id,
        created_by: user_id,
        title,
        brand: brand || null,
        description,
        status: status || "draft",
      },
      { transaction: t },
    );

    const variantRows = variants.map((v) => {
      const attributes = v.attributes || {};
      return {
        product_id: product.id,
        sku: generateSKU(brand, title, attributes),
        name: v.name || buildVariantName(attributes),
        attributes,
        price: v.price,
        discount: v.discount ?? 0,
        stock: v.stock ?? 0,
      };
    });

    await Productvariant.bulkCreate(variantRows, { transaction: t });

    if (req.files?.length) {
      const imageRows = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "store_management/products",
        });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        imageRows.push({
          product_id: product.id,
          image_url: uploaded.secure_url,
          is_primary: i === 0,
        });
      }
      await ProductImage.bulkCreate(imageRows, { transaction: t });
    }

    await t.commit();

    const created = await Product.findByPk(product.id, {
      include: productInclude,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: created,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.category_id) where.category_id = req.query.category_id;

    // Shop/customer browse: only active products
    if (req.query.shop === "true") where.status = "active";

    const products = await Product.findAll({
      where,
      include: productInclude,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      data: products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: productInclude,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      data: product,
      message: "Product fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { title, brand, description, status, category_id } = req.body;

    await product.update({
      title: title ?? product.title,
      brand: brand !== undefined ? brand : product.brand,
      description: description ?? product.description,
      status: status ?? product.status,
      category_id: category_id ?? product.category_id,
    });

    const updated = await Product.findByPk(product.id, {
      include: productInclude,
    });

    return res.status(200).json({
      data: updated,
      message: "Product updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
