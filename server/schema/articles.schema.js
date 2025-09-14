const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        // Author Information
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor", // Assuming doctors write articles
            required: [true, "Author ID is required"],
        },
        authorAvatar: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            required: [true, "Article title is required"],
            trim: true,
            maxlength: [200, "Article title cannot exceed 200 characters"],
            minlength: [10, "Article title must be at least 10 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
            maxlength: [300, "Subtitle cannot exceed 300 characters"],
            default: "",
        },
        content: {
            type: String,
            required: [true, "Article content is required"],
            minlength: [100, "Article content must be at least 100 characters"],
        },
        // Categorization
        category: {
            type: String,
            required: [true, "Article category is required"],
            enum: {
                values: [
                    "General Health",
                    "Mental Health",
                    "Women's Health",
                    "Men's Health",
                    "Child Health",
                    "Nutrition",
                    "Fitness",
                    "Diseases & Conditions",
                    "Preventive Care",
                    "Medical Research",
                    "Healthcare Technology",
                    "Lifestyle",
                    "Other",
                ],
                message: "Invalid category selected",
            },
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["draft", "review", "published", "rejected"],
                message:
                    "Status must be one of: draft, review, published, archived, rejected",
            },
            default: "draft",
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
            default: null,
        },

        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
        bookmarks: {
            type: Number,
            default: 0,
        },

        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Patient",
            },
        ],
        bookmarkedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Patient",
            },
        ],

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: [500, "Rejection reason cannot exceed 500 characters"],
            default: "",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// articleSchema.index({ slug: 1 });
// articleSchema.index({ authorId: 1, status: 1 });
// articleSchema.index({ category: 1, status: 1 });
// articleSchema.index({ tags: 1 });
// articleSchema.index({ publishedAt: -1 });
// articleSchema.index({ views: -1 });
// articleSchema.index({ likes: -1 });
// articleSchema.index({ status: 1, publishedAt: -1 });
// articleSchema.index({ title: "text", content: "text", tags: "text" }); // Text search


// Pre-save middleware to generate slug
articleSchema.pre("save", function (next) {
    // Generate slug from title if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim("-");
    }

    this.lastModifiedAt = new Date();
    next();
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
