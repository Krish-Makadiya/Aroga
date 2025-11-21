const express = require("express");
const {
  createArticle,
  getArticlesByDoctor,
  getAllArticles,
  getArticlesExcludingDoctor,
  getArticleById,
  updateArticle,
  publishArticle,
  deleteArticle,
  addLike,
  removeLike
} = require("../controllers/article.controller");

const router = express.Router();

// --------------------------------------------------
// Article Routes
// --------------------------------------------------

// Create new article
router.post("/", createArticle);

// Get all articles (all doctors)
router.get("/all", getAllArticles);

// Get all articles by a specific doctor (via clerkUserId)
router.get("/doctor/:clerkUserId", getArticlesByDoctor);

// Get all articles except from a specific doctor
router.get("/exclude/:clerkUserId", getArticlesExcludingDoctor);

// Get single article by ID
router.get("/:id", getArticleById);

// Update article
router.put("/:id", updateArticle);

// Publish article (set publishedAt)
router.put("/:id/publish", publishArticle);

// Delete article
router.delete("/:id", deleteArticle);

// Like article
router.put("/:id/like", addLike);

// Unlike article
router.put("/:id/unlike", removeLike);

module.exports = router;
