require("dotenv").config();
const bcrypt = require("bcrypt");
const color = require("colors");
const {
  sequelize,
  User,
  Role,
  Permissions,
  Category,
  Product,
  Productvariant,
  ProductImage,
} = require("../models");
const ROLES = require("../config/roles");
const { PERMISSIONS, ROLE_PERMISSIONS } = require("../config/permissions");
const generateSKU = require("../helper/skuGenerator");

const seedUsers = [
  {
    name: "Store Admin",
    email: "admin@store.com",
    password: "Admin@123",
    role: ROLES.ADMIN,
  },
  {
    name: "Product Lister",
    email: "lister@store.com",
    password: "Lister@123",
    role: ROLES.PRODUCT_LISTER,
  },
  {
    name: "John Customer",
    email: "customer@store.com",
    password: "Customer@123",
    role: ROLES.CUSTOMER,
  },
];

const catalog = [
  {
    category: {
      name: "Fashion",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    },
    products: [
      {
        title: "Classic Cotton Tee",
        brand: "UrbanWear",
        description:
          "Soft everyday cotton t-shirt with a clean fit. Breathable fabric for all-day comfort.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "White / M",
            attributes: { color: "White", size: "M" },
            price: 699,
            discount: 50,
            stock: 40,
          },
          {
            name: "Black / L",
            attributes: { color: "Black", size: "L" },
            price: 699,
            discount: 0,
            stock: 35,
          },
        ],
      },
      {
        title: "Slim Fit Denim Jeans",
        brand: "DenimCo",
        description:
          "Stretch denim jeans with a modern slim silhouette. Durable wash for daily wear.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "Blue / 32",
            attributes: { color: "Blue", size: "32" },
            price: 1899,
            discount: 200,
            stock: 25,
          },
          {
            name: "Blue / 34",
            attributes: { color: "Blue", size: "34" },
            price: 1899,
            discount: 200,
            stock: 20,
          },
        ],
      },
    ],
  },
  {
    category: {
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
    },
    products: [
      {
        title: "Wireless Bluetooth Headphones",
        brand: "SoundMax",
        description:
          "Over-ear headphones with deep bass, 30-hour battery, and noise isolation for travel and work.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "Matte Black",
            attributes: { color: "Black" },
            price: 3499,
            discount: 400,
            stock: 18,
          },
          {
            name: "Silver",
            attributes: { color: "Silver" },
            price: 3499,
            discount: 0,
            stock: 12,
          },
        ],
      },
      {
        title: "Smartwatch Pro",
        brand: "PulseTech",
        description:
          "Track fitness, heart rate, and notifications. Water resistant with bright AMOLED display.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "42mm Black",
            attributes: { size: "42mm", color: "Black" },
            price: 7999,
            discount: 500,
            stock: 15,
          },
          {
            name: "46mm Blue",
            attributes: { size: "46mm", color: "Blue" },
            price: 8499,
            discount: 0,
            stock: 10,
          },
        ],
      },
    ],
  },
  {
    category: {
      name: "Grocery",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    },
    products: [
      {
        title: "Organic Basmati Rice",
        brand: "FarmFresh",
        description:
          "Premium aged basmati rice with long grains and rich aroma. Perfect for biryani and daily meals.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "1kg Pack",
            attributes: { weight: "1kg", pack_type: "pouch" },
            price: 180,
            discount: 10,
            stock: 100,
          },
          {
            name: "5kg Pack",
            attributes: { weight: "5kg", pack_type: "bag" },
            price: 820,
            discount: 50,
            stock: 40,
          },
        ],
      },
      {
        title: "Cold Pressed Olive Oil",
        brand: "GreenGrove",
        description:
          "Extra virgin olive oil for cooking and salads. Pure, unrefined, and rich in natural flavor.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "500ml Bottle",
            attributes: { volume: "500ml" },
            price: 449,
            discount: 0,
            stock: 60,
          },
          {
            name: "1L Bottle",
            attributes: { volume: "1L" },
            price: 799,
            discount: 40,
            stock: 35,
          },
        ],
      },
    ],
  },
  {
    category: {
      name: "Home & Living",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    },
    products: [
      {
        title: "Ceramic Coffee Mug Set",
        brand: "HomeNest",
        description:
          "Set of handcrafted ceramic mugs. Microwave safe with a matte finish.",
        status: "active",
        images: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
        ],
        variants: [
          {
            name: "Set of 2",
            attributes: { pack: "2" },
            price: 599,
            discount: 50,
            stock: 30,
          },
          {
            name: "Set of 4",
            attributes: { pack: "4" },
            price: 999,
            discount: 100,
            stock: 22,
          },
        ],
      },
    ],
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log(color.bgBlue("Database connected"));

    await sequelize.sync({ force: true });
    console.log(color.yellow("Tables synced (force)"));

    const roleMap = {};
    for (const roleName of Object.values(ROLES)) {
      roleMap[roleName] = await Role.create({ name: roleName });
    }
    console.log(color.green(`Roles seeded: ${Object.keys(roleMap).length}`));

    const permissionMap = {};
    for (const permissionName of Object.values(PERMISSIONS)) {
      permissionMap[permissionName] = await Permissions.create({
        name: permissionName,
      });
    }
    console.log(
      color.green(`Permissions seeded: ${Object.keys(permissionMap).length}`),
    );

    for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
      await roleMap[roleName].setPermission(
        permissionNames.map((name) => permissionMap[name]),
      );
    }
    console.log(color.green("Role-permission links seeded"));

    let adminUser = null;
    for (const user of seedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const created = await User.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role_id: roleMap[user.role].id,
      });

      if (user.role === ROLES.ADMIN) adminUser = created;

      if (user.role === ROLES.PRODUCT_LISTER) {
        await created.setPermission(
          ROLE_PERMISSIONS[ROLES.PRODUCT_LISTER].map(
            (name) => permissionMap[name],
          ),
        );
      }
    }
    console.log(color.green(`Users seeded: ${seedUsers.length}`));

    let productCount = 0;
    let categoryCount = 0;

    for (const block of catalog) {
      const category = await Category.create({
        name: block.category.name,
        image: block.category.image,
        created_by: adminUser.id,
      });
      categoryCount += 1;

      for (const item of block.products) {
        const product = await Product.create({
          category_id: category.id,
          created_by: adminUser.id,
          title: item.title,
          brand: item.brand,
          description: item.description,
          status: item.status,
        });

        await Productvariant.bulkCreate(
          item.variants.map((v) => ({
            product_id: product.id,
            sku: generateSKU(item.brand, item.title, v.attributes),
            name: v.name,
            attributes: v.attributes,
            price: v.price,
            discount: v.discount,
            stock: v.stock,
          })),
        );

        await ProductImage.bulkCreate(
          item.images.map((url, index) => ({
            product_id: product.id,
            image_url: url,
            is_primary: index === 0,
          })),
        );

        productCount += 1;
      }
    }

    console.log(color.green(`Categories seeded: ${categoryCount}`));
    console.log(color.green(`Products seeded: ${productCount}`));

    console.log(color.bgGreen("\nSeed completed successfully\n"));
    console.log(color.cyan("Login credentials:"));
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(16)} ${u.email} / ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(color.red("Seed failed:"), error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();
