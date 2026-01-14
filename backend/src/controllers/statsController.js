import { asyncHandler } from '../middleware/errorHandler.js';
import { Comic, Listing, Episode } from '../models/index.js';
import MarketplaceTransaction from '../models/MarketplaceTransaction.js';

/**
 * @desc    Get marketplace statistics
 * @route   GET /api/v1/stats/marketplace
 * @access  Public
 */
export const getMarketplaceStats = asyncHandler(async (req, res) => {
  // Get active auctions count
  const activeAuctions = await Listing.countDocuments({
    status: 'active',
    listingType: 'auction'
  });

  // Get all active listings to calculate volume and floor price
  const activeListings = await Listing.find({
    status: 'active'
  }).select('price listingType');

  // Calculate total volume (sum of all listing prices)
  const totalVolume = activeListings.reduce((sum, listing) => {
    return sum + (parseFloat(listing.price) || 0);
  }, 0);

  // Calculate floor price (lowest price among active listings)
  const prices = activeListings
    .map(l => parseFloat(l.price))
    .filter(p => p > 0);

  const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Total active listings
  const totalListings = activeListings.length;

  res.json({
    success: true,
    data: {
      activeAuctions,
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      floorPrice: parseFloat(floorPrice.toFixed(2)),
      totalListings
    }
  });
});

/**
 * @desc    Get platform statistics
 * @route   GET /api/v1/stats/platform
 * @access  Public
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const totalComics = await Comic.countDocuments({ status: { $ne: 'draft' } });
  const totalPublished = await Comic.countDocuments({ status: 'published' });

  // Calculate total volume from completed marketplace transactions
  const volumeStats = await MarketplaceTransaction.aggregate([
    {
      $match: {
        status: 'completed',
        type: 'purchase'
      }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$price.amount' }
      }
    }
  ]);

  const totalVolume = volumeStats.length > 0 ? parseFloat(volumeStats[0].totalVolume.toFixed(2)) : 0;
  const totalCreators = await Comic.distinct('creator').length;

  // Count unique NFT collectors from all episodes
  const episodes = await Episode.find({}).select('mintedNFTs');
  const uniqueCollectors = new Set();

  episodes.forEach(episode => {
    if (episode.mintedNFTs && episode.mintedNFTs.length > 0) {
      episode.mintedNFTs.forEach(nft => {
        if (nft.owner) {
          uniqueCollectors.add(nft.owner);
        }
      });
    }
  });

  res.json({
    success: true,
    data: {
      totalComics,
      totalPublished,
      totalVolume,
      totalCreators,
      totalCollectors: uniqueCollectors.size
    }
  });
});

export default {
  getMarketplaceStats,
  getPlatformStats
};
