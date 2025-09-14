const express = require("express");
const router = express.Router();
const Article = require("../schema/articles.schema");
const Doctor = require("../schema/doctor.schema");

// POST /api/articles - Create new article
router.post("/", async (req, res) => {
    try {
        const {
            authorId, // Doctor's ObjectId
            title,
            subtitle = "",
            content,
            category,
            isPinned = false,
        } = req.body;

        // Validation - Check required fields
        if (!authorId || !title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: authorId, title, content, category"
            });
        }

        // Verify doctor exists
        const doctor = await Doctor.findById(authorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Check for duplicate slug (auto-generated from title)
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim("-");

        let slug = baseSlug;
        let counter = 1;
        while (await Article.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Create article using the create method
        const article = await Article.create({
            authorId,
            authorAvatar: doctor.avatar || "",
            title,
            subtitle,
            content,
            category,
            slug,
            status: "draft", // Always start as draft
            isPinned,
        });

        return res.status(201).json({
            success: true,
            message: "Article created successfully",
            data: article
        });

    } catch (error) {
        console.error("Create article error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create article",
            error: error.message
        });
    }
});

// GET /api/articles/doctor/:clerkUserId - Get all articles by doctor using clerk user ID
router.get("/:clerkUserId", async (req, res) => {
    try {
        const { clerkUserId } = req.params;

        // Find doctor by clerkUserId
        const doctor = await Doctor.findOne({ clerkUserId });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Get articles with pagination
        const articles = await Article.find({authorId: doctor.id})
            .populate("authorId", "fullName qualification specialty avatar")
            .sort({ createdAt: -1 }) // Latest first

        return res.status(200).json({
            success: true,
            data: {
                articles,
                doctor: {
                    _id: doctor._id,
                    fullName: doctor.fullName,
                    qualification: doctor.qualification,
                    specialty: doctor.specialty
                }
            }
        });

    } catch (error) {
        console.error("Get doctor articles error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctor articles",
            error: error.message
        });
    }
});

// GET /api/articles/:id - Get single article by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id)
            .populate("authorId", "fullName qualification specialty avatar")
            .populate("relatedArticles", "title slug publishedAt");

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        // Increment view count if article is published
        if (article.status === "published") {
            article.views += 1;
            await article.save();
        }

        return res.status(200).json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error("Get article error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch article",
            error: error.message
        });
    }
});

// PUT /api/articles/:id - Update article
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.authorId;
        delete updateData.views;
        delete updateData.likes;
        delete updateData.comments;
        delete updateData.bookmarks;
        delete updateData.publishedAt;

        const article = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Article updated successfully",
            data: article
        });

    } catch (error) {
        console.error("Update article error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update article",
            error: error.message
        });
    }
});

// PUT /api/articles/:id/status - Update article status
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason = "" } = req.body;

        const validStatuses = ["draft", "review", "published", "rejected"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: draft, review, published, rejected"
            });
        }

        const updateData = { status };
        
        // Set publishedAt when status changes to published
        if (status === "published") {
            updateData.publishedAt = new Date();
        }
        
        // Add rejection reason if status is rejected
        if (status === "rejected") {
            updateData.rejectionReason = rejectionReason;
        }

        const article = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Article ${status} successfully`,
            data: article
        });

    } catch (error) {
        console.error("Update article status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update article status",
            error: error.message
        });
    }
});

// DELETE /api/articles/:id - Delete article
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByIdAndDelete(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Article deleted successfully"
        });

    } catch (error) {
        console.error("Delete article error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete article",
            error: error.message
        });
    }
});

module.exports = router;
