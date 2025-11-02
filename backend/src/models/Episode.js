// backend/src/models/Episode.js
import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Episode title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  episodeNumber: {
    type: Number,
    required: true,
    min: 1
  },

  // Relationships
  comic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comic',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // NFT Details
  collectionTokenId: {
    type: String,
    required: true
  },

  // Content Storage (IPFS)
  content: {
    metadataUri: {
      type: String,
      required: true
    },
    metadataHash: {
      type: String,
      required: true
    },
    coverImage: {
      ipfsHash: String,
      url: String
    },
    pages: [{
      pageNumber: Number,
      ipfsHash: String,
      url: String,
      thumbnail: String
    }],
    cbz: {
      ipfsHash: String,
      url: String
    },
    totalPages: {
      type: Number,
      default: 0
    }
  },

  // Pricing & Supply
  pricing: {
    mintPrice: {
      type: Number,
      default: 0 // in HBAR
    },
    readPrice: {
      type: Number,
      default: 0 // in HBAR for pay-per-read
    },
    currency: {
      type: String,
      enum: ['HBAR', 'USDT'],
      default: 'HBAR'
    }
  },

  supply: {
    maxSupply: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    currentSupply: {
      type: Number,
      default: 0
    },
    burned: {
      type: Number,
      default: 0
    }
  },

  // Minting Configuration
  mintingRules: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: Date,
    endTime: Date,
    maxPerWallet: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    whitelistOnly: {
      type: Boolean,
      default: false
    },
    whitelist: [String] // Hedera account IDs
  },

  // Minted NFTs
  mintedNFTs: [{
    serialNumber: Number,
    owner: String, // Hedera account ID
    mintedAt: Date,
    transactionId: String
  }],

  // Statistics
  stats: {
    totalMinted: {
      type: Number,
      default: 0
    },
    totalReads: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    uniqueReaders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'processing', 'ready', 'published', 'paused', 'archived'],
    default: 'draft'
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },

  // Access Control
  accessType: {
    type: String,
    enum: ['public', 'nft-holders', 'paid', 'free'],
    default: 'nft-holders'
  },

  // Timestamps
  publishedAt: Date,
  lastMintedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
episodeSchema.index({ comic: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ collectionTokenId: 1 });
episodeSchema.index({ creator: 1, status: 1 });
episodeSchema.index({ status: 1, isLive: 1 });
episodeSchema.index({ publishedAt: -1 });

// Method to check if user can access
episodeSchema.methods.canAccess = async function(userAccountId) {
  // Free episodes
  if (this.isFree || this.accessType === 'free') {
    return true;
  }

  // Public episodes (preview only)
  if (this.accessType === 'public') {
    return 'preview';
  }

  // Check NFT ownership
  if (this.accessType === 'nft-holders') {
    const hasNFT = this.mintedNFTs.some(nft => nft.owner === userAccountId);
    return hasNFT;
  }

  // Paid access - check payment records (would need separate model)
  if (this.accessType === 'paid') {
    // Check payment history
    return false; // Implement payment verification
  }

  return false;
};

// Method to add minted NFT
episodeSchema.methods.addMintedNFT = async function(serialNumber, owner, transactionId) {
  this.mintedNFTs.push({
    serialNumber,
    owner,
    mintedAt: new Date(),
    transactionId
  });

  this.supply.currentSupply += 1;
  this.stats.totalMinted += 1;
  this.lastMintedAt = new Date();

  await this.save();
};

// Method to increment stats
episodeSchema.methods.incrementStats = async function(field, value = 1) {
  this.stats[field] = (this.stats[field] || 0) + value;
  await this.save();
};

const Episode = mongoose.model('Episode', episodeSchema);

export default Episode;
