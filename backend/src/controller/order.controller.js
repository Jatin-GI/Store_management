const {
  Order,
  OrderItem,
  Product,
  Productvariant,
  ProductImage,
  User,
  sequelize,
} = require("../models");
const ROLES = require("../config/roles");

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, shipping_address, phone, notes } = req.body;

    if (!shipping_address) {
      await t.rollback();
      return res.status(400).json({ message: "shipping_address is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Order items are required" });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity) || 0;
      if (!item.variant_id || quantity < 1) {
        await t.rollback();
        return res.status(400).json({
          message: "Each item needs variant_id and quantity >= 1",
        });
      }

      const variant = await Productvariant.findByPk(item.variant_id, {
        include: [{ model: Product, as: "product" }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!variant || !variant.product) {
        await t.rollback();
        return res.status(400).json({ message: "Variant not found" });
      }

      if (variant.product.status !== "active") {
        await t.rollback();
        return res.status(400).json({
          message: `${variant.product.title} is not available`,
        });
      }

      if (variant.stock < quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${variant.product.title}`,
        });
      }

      const unitPrice = Number(variant.price) - Number(variant.discount || 0);
      const lineTotal = unitPrice * quantity;
      total += lineTotal;

      orderItems.push({
        product_id: variant.product_id,
        variant_id: variant.id,
        product_title: variant.product.title,
        variant_name: variant.name,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });

      await variant.update(
        { stock: variant.stock - quantity },
        { transaction: t },
      );
    }

    const order = await Order.create(
      {
        user_id: req.user.id,
        total_amount: total,
        status: "pending",
        shipping_address,
        phone: phone || null,
        notes: notes || null,
      },
      { transaction: t },
    );

    await OrderItem.bulkCreate(
      orderItems.map((row) => ({ ...row, order_id: order.id })),
      { transaction: t },
    );

    await t.commit();

    const created = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    return res.status(201).json({
      data: created,
      message: "Order placed successfully",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      data: orders,
      message: "Orders fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: "items" },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      data: orders,
      message: "Orders fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ status });

    return res.status(200).json({
      data: order,
      message: "Order status updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items" }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // Customer can cancel only own pending orders
    if (req.user.role === ROLES.CUSTOMER) {
      if (order.user_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({ message: "Access denied" });
      }
      if (order.status !== "pending") {
        await t.rollback();
        return res.status(400).json({
          message: "Only pending orders can be cancelled",
        });
      }
    }

    if (order.status === "cancelled") {
      await t.rollback();
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Restore stock
    for (const item of order.items || []) {
      const variant = await Productvariant.findByPk(item.variant_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (variant) {
        await variant.update(
          { stock: variant.stock + item.quantity },
          { transaction: t },
        );
      }
    }

    await order.update({ status: "cancelled" }, { transaction: t });
    await t.commit();

    return res.status(200).json({
      data: order,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
