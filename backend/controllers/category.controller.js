import Category from "../models/category.model.js";

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private (Seller/Admin)
export async function createCategory(req, res, next) {
    try {
        const { name, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category with this name already exists",
            });
        }

        const category = await Category.create({
            name,
            image: image || "",
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export async function getAllCategories(req, res, next) {
    try {
        const categories = await Category.find().sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin only)
export async function deleteCategory(req, res, next) {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await category.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}
