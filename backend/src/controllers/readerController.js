import { Comic, ReadHistory, Episode, User } from '../models/index.js';
import hederaService from '../services/hederaService.js';
import ipfsService from '../services/ipfsService.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get comic content for reading
 * @route   GET /api/v1/reader/comic/:comicId
 * @access  Private (Must own NFT)
 */
export const getComicContent = asyncHandler(async (req, res) => {
  const { comicId } = req.params;
  const userId = req.user.id;

  const comic = await Comic.findById(comicId).populate('collection');

  if (!comic) {
    return res.status(404).json({
      success: false,
      message: 'Comic not found'
    });
  }

  // Verify ownership
  const ownsNFT = comic.nfts.some(nft => nft.owner.toString() === userId);

  if (!ownsNFT) {
    return res.status(403).json({
      success: false,
      message: 'You must own this comic NFT to read it'
    });
  }

  // Get or create reading progress
  let progress = await ReadHistory.findOne({
    user: userId,
    comic: comicId
  });

  if (!progress) {
    const user = await User.findById(userId);
    progress = await ReadHistory.create({
      user: userId,
      userAccountId: user.wallet?.accountId || '',
      comic: comicId,
      episode: null, // This is for the whole comic
      accessType: 'nft-owner',
      progress: {
        currentPage: 1,
        totalPages: comic.pageCount
      }
    });
  }

  res.json({
    success: true,
    data: {
      comic: {
        id: comic._id,
        title: comic.title,
        pageCount: comic.pageCount,
        pages: comic.content.pages,
        downloads: comic.content.downloads
      },
      progress: {
        currentPage: progress.progress.currentPage,
        bookmarks: [],
        lastReadAt: progress.lastAccessedAt
      }
    }
  });
});

/**
 * @desc    Save reading progress
 * @route   POST /api/v1/reader/progress
 * @access  Private
 */
export const saveProgress = asyncHandler(async (req, res) => {
  const { comicId, currentPage } = req.body;
  const userId = req.user.id;

  const comic = await Comic.findById(comicId);

  if (!comic) {
    return res.status(404).json({
      success: false,
      message: 'Comic not found'
    });
  }

  const user = await User.findById(userId);

  let progress = await ReadHistory.findOne({ user: userId, comic: comicId });

  if (!progress) {
    progress = await ReadHistory.create({
      user: userId,
      userAccountId: user.wallet?.accountId || '',
      comic: comicId,
      episode: null,
      accessType: 'nft-owner',
      progress: {
        currentPage: parseInt(currentPage),
        totalPages: comic.pageCount,
        percentage: Math.round((parseInt(currentPage) / comic.pageCount) * 100),
        completed: parseInt(currentPage) >= comic.pageCount
      }
    });
  } else {
    await progress.updateProgress(parseInt(currentPage), comic.pageCount);
  }

  res.json({
    success: true,
    message: 'Progress saved',
    data: { progress: progress.progress }
  });
});

/**
 * @desc    Toggle bookmark
 * @route   POST /api/v1/reader/bookmark
 * @access  Private
 */
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { comicId, pageNumber, note } = req.body;
  const userId = req.user.id;

  let progress = await ReadHistory.findOne({
    user: userId,
    comic: comicId
  });

  if (!progress) {
    const comic = await Comic.findById(comicId);
    const user = await User.findById(userId);
    progress = await ReadHistory.create({
      user: userId,
      userAccountId: user.wallet?.accountId || '',
      comic: comicId,
      episode: null,
      accessType: 'nft-owner',
      progress: {
        totalPages: comic.pageCount
      }
    });
  }

  // ReadHistory doesn't have bookmarks in the same way
  // Store in sessions or skip for now
  res.json({
    success: true,
    message: 'Bookmark feature will be available soon',
    data: { bookmarks: [] }
  });
});

/**
 * @desc    Get reading progress
 * @route   GET /api/v1/reader/progress/:comicId
 * @access  Private
 */
export const getProgress = asyncHandler(async (req, res) => {
  const { comicId } = req.params;
  const userId = req.user.id;

  const progress = await ReadHistory.findOne({
    user: userId,
    comic: comicId
  }).populate('comic', 'title');

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: 'No progress found for this comic'
    });
  }

  res.json({
    success: true,
    data: { progress: progress.progress }
  });
});

/**
 * @desc    Download comic (CBZ file)
 * @route   GET /api/v1/reader/download/:comicId
 * @access  Private (Must own NFT)
 */
export const downloadComic = asyncHandler(async (req, res) => {
  const { comicId } = req.params;
  const userId = req.user.id;

  const comic = await Comic.findById(comicId);

  if (!comic) {
    return res.status(404).json({
      success: false,
      message: 'Comic not found'
    });
  }

  // Verify ownership
  const ownsNFT = comic.nfts.some(nft => nft.owner.toString() === userId);

  if (!ownsNFT) {
    return res.status(403).json({
      success: false,
      message: 'You must own this comic NFT to download it'
    });
  }

  // Return download URL
  res.json({
    success: true,
    data: {
      cbzUrl: comic.content.downloads.cbz,
      pdfUrl: comic.content.downloads.pdf,
      title: comic.title
    }
  });
});

export default {
  getComicContent,
  saveProgress,
  toggleBookmark,
  getProgress,
  downloadComic
};