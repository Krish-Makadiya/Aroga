const Article = require("../schema/articles.schema");
const Doctor = require("../schema/doctor.schema");

// ----------------------------------------------------------------------
// Create Article
// ----------------------------------------------------------------------
exports.createArticle = async (req, res) => {
  try {
    const {
      authorClerkId,
      type,
      title,
      content,
      tags = [],
      images = []
    } = req.body;

    if (!authorClerkId || !title || !content || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: authorClerkId, type, title, content"
      });
    }

    const doctor = await Doctor.findOne({ clerkUserId: authorClerkId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Create article
    const article = await Article.create({
      authorId: doctor._id,
      type,
      title,
      content,
      tags,
      images
    });

    return res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article
    });

  } catch (error) {
    console.error("Create Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create article",
      error: error.message
    });
  }
};

exports.removeLike = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Article.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    content.likes = Math.max(0, (content.likes || 0) - 1);
    await content.save();

    return res.json({
      message: "Like removed",
      likes: content.likes,
    });

  } catch (error) {
    console.error("Unlike error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------------------------------------------------
// Get Articles by Doctor (via clerk user id)
// ----------------------------------------------------------------------
exports.getArticlesByDoctor = async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const doctor = await Doctor.findOne({ clerkUserId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const articles = await Article.find({ authorId: doctor._id })
      .populate("authorId", "fullName qualification specialty avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        doctor,
        articles
      }
    });

  } catch (error) {
    console.error("Get Articles by Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Get All Articles
// ----------------------------------------------------------------------
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({})
      .populate("authorId", "fullName qualification specialty avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: articles
    });

  } catch (error) {
    console.error("Get All Articles Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Get Articles Excluding One Doctor
// ----------------------------------------------------------------------
exports.getArticlesExcludingDoctor = async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const doctor = await Doctor.findOne({ clerkUserId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const articles = await Article.find({
      authorId: { $ne: doctor._id }
    })
      .populate("authorId", "fullName qualification specialty avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        excludedDoctor: doctor,
        articles
      }
    });

  } catch (error) {
    console.error("Get Articles Excluding Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Get Single Article by ID
// ----------------------------------------------------------------------
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("authorId", "fullName qualification specialty avatar");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Increment views on each detail view
    article.views += 1;
    await article.save();

    return res.status(200).json({
      success: true,
      data: article
    });

  } catch (error) {
    console.error("Get Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Update Article
// ----------------------------------------------------------------------
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that cannot be updated
    delete updateData.authorId;
    delete updateData.views;
    delete updateData.slug;
    delete updateData.publishedAt;

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

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
    console.error("Update Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update article",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Publish Article (set publishedAt)
// ----------------------------------------------------------------------
exports.publishArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndUpdate(
      id,
      { publishedAt: new Date() },
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
      message: "Article published successfully",
      data: article
    });

  } catch (error) {
    console.error("Publish Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish article",
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------
// Delete Article
// ----------------------------------------------------------------------
exports.deleteArticle = async (req, res) => {
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
    console.error("Delete Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete article",
      error: error.message
    });
  }
};

exports.addLike = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Article.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Increase like count by 1
    content.likes += 1;
    await content.save();

    return res.json({
      message: "Thanks for liking!",
      likes: content.likes,
    });

  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


