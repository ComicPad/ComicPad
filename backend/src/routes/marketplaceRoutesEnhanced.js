// backend/src/routes/marketplaceRoutesEnhanced.js
import express from 'express';
import {
  createListing,
  createAuction,
  placeBid,
  buyNFT,
  completeAuction,
  cancelListing,
  getListings,
  getListing,
  getMyListings,
  getMarketplaceStats
} from '../controllers/marketplaceControllerEnhanced.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/listings', getListings);
router.get('/listings/:listingId', getListing);
router.get('/stats', getMarketplaceStats);

// Protected routes
router.post('/listings', protect, createListing);
router.post('/auctions', protect, createAuction);
router.post('/auctions/:listingId/bid', protect, placeBid);
router.post('/listings/:listingId/buy', protect, buyNFT);
router.post('/auctions/:listingId/complete', protect, completeAuction);
router.delete('/listings/:listingId', protect, cancelListing);
router.get('/users/me/listings', protect, getMyListings);

export default router;
