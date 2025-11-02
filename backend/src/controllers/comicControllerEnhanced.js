// backend/src/controllers/comicControllerEnhanced.js
import comicService from '../services/comicService.js';
import { Comic, Episode } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Enhanced Comic Controller
 * Handles all comic and episode operations
 */

/**
 * Create new comic collection
 * POST /api/comics
 */
export const createComic = async (req, res) => {
  try {
    const {
      title,
      description,
      series,
      genres,
      tags,
      royaltyPercentage,
      maxSupply
    } = req.body;

    const userId = req.user.id;
    const accountId = req.user.wallet?.accountId;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Hedera wallet not connected'
      });
    }

    const result = await comicService.createComic({
      userId,
      accountId,
      title,
      description,
      series,
      genres,
      tags,
      coverImage: req.file?.path,
      royaltyPercentage,
      maxSupply
    });

    res.status(201).json({
      success: true,
      message: 'Comic collection created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in createComic controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create new episode
 * POST /api/comics/:comicId/episodes
 */
export const createEpisode = async (req, res) => {
  try {
    const { comicId } = req.params;
    const {
      title,
      description,
      episodeNumber,
      mintPrice,
      readPrice,
      maxSupply
    } = req.body;

    const userId = req.user.id;

    // Get uploaded files
    const files = req.files;
    const coverImage = files.cover?.[0]?.path;
    const pages = files.pages?.map(f => ({ path: f.path })) || [];

    if (!coverImage || pages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cover image and pages are required'
      });
    }

    const result = await comicService.createEpisode({
      comicId,
      userId,
      title,
      description,
      episodeNumber,
      coverImage,
      pages,
      mintPrice,
      readPrice,
      maxSupply
    });

    res.status(201).json({
      success: true,
      message: 'Episode created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in createEpisode controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Publish episode (make it live for minting)
 * POST /api/episodes/:episodeId/publish
 */
export const publishEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const {
      startTime,
      endTime,
      maxPerWallet,
      whitelistOnly,
      whitelist
    } = req.body;

    const episode = await comicService.publishEpisode(episodeId, {
      startTime,
      endTime,
      maxPerWallet,
      whitelistOnly,
      whitelist
    });

    res.json({
      success: true,
      message: 'Episode published successfully',
      data: episode
    });
  } catch (error) {
    logger.error('Error in publishEpisode controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mint NFT for episode
 * POST /api/episodes/:episodeId/mint
 */
export const mintEpisodeNFT = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { quantity = 1 } = req.body;

    const buyerAccountId = req.user.wallet?.accountId;

    if (!buyerAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Hedera wallet not connected'
      });
    }

    const result = await comicService.mintEpisodeNFT({
      episodeId,
      buyerAccountId,
      quantity
    });

    res.json({
      success: true,
      message: `Minted ${quantity} NFT(s) successfully`,
      data: result
    });
  } catch (error) {
    logger.error('Error in mintEpisodeNFT controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get comic by ID
 * GET /api/comics/:comicId
 */
export const getComic = async (req, res) => {
  try {
    const { comicId } = req.params;

    const comic = await Comic.findById(comicId)
      .populate('creator', 'username profile wallet')
      .populate({
        path: 'episodes',
        options: { sort: { episodeNumber: 1 } }
      });

    if (!comic) {
      return res.status(404).json({
        success: false,
        message: 'Comic not found'
      });
    }

    res.json({
      success: true,
      data: comic
    });
  } catch (error) {
    logger.error('Error in getComic controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all comics (with filters)
 * GET /api/comics
 */
export const getComics = async (req, res) => {
  try {
    const {
      status,
      genre,
      creator,
      limit = 20,
      skip = 0,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (genre) query.genres = { $in: [genre] };
    if (creator) query.creator = creator;

    const comics = await Comic.find(query)
      .populate('creator', 'username profile')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Comic.countDocuments(query);

    res.json({
      success: true,
      data: {
        comics,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error in getComics controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get episode by ID
 * GET /api/episodes/:episodeId
 */
export const getEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId)
      .populate('comic', 'title description coverImage')
      .populate('creator', 'username profile');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    res.json({
      success: true,
      data: episode
    });
  } catch (error) {
    logger.error('Error in getEpisode controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify episode access and get reading content
 * GET /api/episodes/:episodeId/read
 */
export const readEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user.id;
    const userAccountId = req.user.wallet?.accountId;

    if (!userAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Hedera wallet not connected'
      });
    }

    const accessData = await comicService.verifyEpisodeAccess(
      episodeId,
      userAccountId,
      userId
    );

    if (!accessData.hasAccess) {
      return res.status(403).json({
        success: false,
        message: accessData.message
      });
    }

    res.json({
      success: true,
      data: accessData
    });
  } catch (error) {
    logger.error('Error in readEpisode controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update reading progress
 * PUT /api/episodes/:episodeId/progress
 */
export const updateReadingProgress = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { currentPage, totalPages } = req.body;
    const userId = req.user.id;

    const { ReadHistory } = await import('../models/index.js');

    const readHistory = await ReadHistory.findOne({
      user: userId,
      episode: episodeId
    });

    if (!readHistory) {
      return res.status(404).json({
        success: false,
        message: 'Read history not found'
      });
    }

    await readHistory.updateProgress(currentPage, totalPages);

    res.json({
      success: true,
      message: 'Progress updated',
      data: readHistory
    });
  } catch (error) {
    logger.error('Error in updateReadingProgress controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's comics (creator)
 * GET /api/users/me/comics
 */
export const getMyComics = async (req, res) => {
  try {
    const userId = req.user.id;

    const comics = await Comic.find({ creator: userId })
      .populate('episodes')
      .sort('-createdAt');

    res.json({
      success: true,
      data: comics
    });
  } catch (error) {
    logger.error('Error in getMyComics controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's owned NFTs
 * GET /api/users/me/collection
 */
export const getMyCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const userAccountId = req.user.wallet?.accountId;

    if (!userAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Hedera wallet not connected'
      });
    }

    // Find all episodes where user owns NFTs
    const episodes = await Episode.find({
      'mintedNFTs.owner': userAccountId
    }).populate('comic', 'title coverImage');

    const collection = episodes.map(episode => {
      const ownedNFTs = episode.mintedNFTs.filter(
        nft => nft.owner === userAccountId
      );

      return {
        episode: {
          _id: episode._id,
          title: episode.title,
          episodeNumber: episode.episodeNumber,
          coverImage: episode.content.coverImage
        },
        comic: episode.comic,
        nfts: ownedNFTs
      };
    });

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    logger.error('Error in getMyCollection controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createComic,
  createEpisode,
  publishEpisode,
  mintEpisodeNFT,
  getComic,
  getComics,
  getEpisode,
  readEpisode,
  updateReadingProgress,
  getMyComics,
  getMyCollection
};
