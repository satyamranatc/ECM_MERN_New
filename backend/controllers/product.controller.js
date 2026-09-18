import Product from "../models/product.model.js";

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Seller/Admin)
export async function createProduct(req, res, next) {
    try {
        const { title, description, image, price, stock, category } = req.body;

        if (!title || !description || !price || stock === undefined || !category) {
            return res.status(400).json({
                success: false,
                message: "Title, description, price, stock, and category are required",
            });
        }

        const images = Array.isArray(image) ? image : [image].filter(Boolean);

        const product = await Product.create({
            title,
            description,
            image: images.length > 0 ? images : ["https://placehold.co/600x400?text=Product"],
            price,
            stock,
            category,
            seller: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get all products with search and category filtering
// @route   GET /api/v1/products
// @access  Public
export async function getAllProducts(req, res, next) {
    try {
        const { keyword, category, minPrice, maxPrice, sort } = req.query;

        const query = {};

        if (keyword) {
            query.title = { $regex: keyword, $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price-asc") sortOption = { price: 1 };
        if (sort === "price-desc") sortOption = { price: -1 };
        if (sort === "rating") sortOption = { rating: -1 };

        const products = await Product.find(query)
            .populate("category", "name slug")
            .populate("seller", "name email")
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
export async function getProductById(req, res, next) {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name slug")
            .populate("seller", "name email avatar");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller/Admin)
export async function updateProduct(req, res, next) {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Ensure current user is the owner or an admin
        if (
            product.seller.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to update this product",
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Seller/Admin)
export async function deleteProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (
            product.seller.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to delete this product",
            });
        }

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}
