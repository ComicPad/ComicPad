# Comic Pad - Complete Setup Guide

This guide will help you set up and run the Comic Pad platform - a decentralized comic NFT marketplace built on Hedera Hashgraph.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing the Workflow](#testing-the-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** v18+ and npm
- **MongoDB** v6+ (local or MongoDB Atlas)
- **Redis** (optional, for caching)
- **Git**

### Required Accounts
1. **Hedera Testnet Account**
   - Create account at: https://portal.hedera.com
   - Get your Account ID and Private Key
   - Fund with test HBAR from: https://portal.hedera.com/faucet

2. **Pinata Account** (for IPFS)
   - Sign up at: https://pinata.cloud
   - Create API JWT token from dashboard

3. **MongoDB Database**
   - Option A: Local MongoDB installation
   - Option B: MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas

---

## Environment Setup

### Backend Environment Variables

Create `backend/.env` file with the following:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/comicpad
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/comicpad

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
BCRYPT_ROUNDS=10

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420YOUR_PRIVATE_KEY

# IPFS/Pinata Configuration
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_PINATA_JWT

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@comicpad.io
FROM_NAME=Comic Pad
```

### Frontend Environment Variables

Create `frontend/.env` file:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api/v1

# Hedera Configuration
VITE_HEDERA_NETWORK=testnet

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# App Configuration
VITE_APP_NAME=Comic Pad
VITE_APP_URL=http://localhost:5173
```

---

## Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd pADcomikkk
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Create Required Directories
```bash
# From project root
mkdir -p backend/uploads
mkdir -p backend/logs
```

---

## Configuration

### 1. Hedera Setup

#### Get Hedera Testnet Account:
1. Go to https://portal.hedera.com
2. Register and create a testnet account
3. Save your Account ID (format: 0.0.XXXXX)
4. Save your Private Key (starts with 302e...)
5. Get test HBAR from faucet

#### Update Backend .env:
```bash
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
```

### 2. IPFS/Pinata Setup

#### Get Pinata JWT:
1. Sign up at https://pinata.cloud
2. Go to API Keys section
3. Create new JWT token
4. Copy the JWT (starts with eyJhbGci...)

#### Update Backend .env:
```bash
PINATA_JWT=YOUR_PINATA_JWT
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Ubuntu/Debian:
sudo apt install mongodb

# macOS:
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod
# OR
brew services start mongodb-community

# Use connection string:
MONGODB_URI=mongodb://localhost:27017/comicpad
```

#### Option B: MongoDB Atlas
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Replace username, password, cluster URL

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/comicpad
```

### 4. Generate JWT Secret
```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output to .env
JWT_SECRET=<generated-secret>
```

---

## Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## Testing the Workflow

### Complete Creator Workflow

#### 1. Create Account & Connect Wallet
- Register on the platform
- Connect Hedera wallet (HashPack or Blade)
- Ensure account has test HBAR

#### 2. Create Comic Collection
```bash
POST /api/v1/comics
{
  "title": "My Amazing Comic",
  "description": "An epic adventure series",
  "series": "Amazing Comics",
  "genres": ["action", "adventure"],
  "royaltyPercentage": 10,
  "maxSupply": 1000
}
```

**This will:**
- Create HTS NFT collection on Hedera
- Upload cover to IPFS
- Store comic metadata in MongoDB
- Return collection token ID

#### 3. Create Episode
```bash
POST /api/v1/comics/{comicId}/episodes
Content-Type: multipart/form-data

Fields:
- title: "Episode 1 - The Beginning"
- description: "The adventure starts"
- episodeNumber: 1
- mintPrice: 10 (HBAR)
- maxSupply: 100
- cover: <cover image file>
- pages: <array of page image files>
```

**This will:**
- Upload all pages to IPFS
- Create CBZ archive
- Generate NFT metadata
- Store episode in database
- Status: "ready"

#### 4. Publish Episode
```bash
POST /api/v1/comics/episodes/{episodeId}/publish
{
  "startTime": "2024-01-01T00:00:00Z",
  "maxPerWallet": 5,
  "whitelistOnly": false
}
```

**This will:**
- Set episode status to "published"
- Enable minting
- Make episode live

#### 5. Mint NFT (as collector)
```bash
POST /api/v1/comics/episodes/{episodeId}/mint
{
  "quantity": 1
}
```

**This will:**
- Mint NFT on Hedera
- Record ownership in database
- Return serial numbers and transaction ID

#### 6. List on Marketplace
```bash
POST /api/v1/marketplace/listings
{
  "tokenId": "0.0.XXXXX",
  "serialNumber": 1,
  "episodeId": "episode-id",
  "price": 15,
  "currency": "HBAR",
  "expiresIn": 30
}
```

#### 7. Buy NFT (as another user)
```bash
POST /api/v1/marketplace/listings/{listingId}/buy
```

**This will:**
- Transfer NFT ownership
- Distribute payments (seller, royalty, platform fee)
- Update all records

#### 8. Read Comic (as NFT owner)
```bash
GET /api/v1/comics/episodes/{episodeId}/read
```

**This will:**
- Verify NFT ownership
- Grant access to content
- Create read history
- Track reading stats

---

## API Endpoints

### Comics & Episodes
```
POST   /api/v1/comics                    - Create comic
GET    /api/v1/comics                    - Get all comics
GET    /api/v1/comics/:id                - Get comic by ID
POST   /api/v1/comics/:id/episodes       - Create episode
POST   /api/v1/comics/episodes/:id/publish - Publish episode
POST   /api/v1/comics/episodes/:id/mint    - Mint NFT
GET    /api/v1/comics/episodes/:id         - Get episode
GET    /api/v1/comics/episodes/:id/read    - Read episode
PUT    /api/v1/comics/episodes/:id/progress - Update progress
```

### Marketplace
```
GET    /api/v1/marketplace/listings           - Get all listings
POST   /api/v1/marketplace/listings           - Create listing
GET    /api/v1/marketplace/listings/:id       - Get listing
DELETE /api/v1/marketplace/listings/:id       - Cancel listing
POST   /api/v1/marketplace/listings/:id/buy   - Buy NFT
POST   /api/v1/marketplace/auctions           - Create auction
POST   /api/v1/marketplace/auctions/:id/bid   - Place bid
POST   /api/v1/marketplace/auctions/:id/complete - Complete auction
GET    /api/v1/marketplace/stats              - Get stats
```

### User
```
GET    /api/v1/comics/my-comics      - Get creator's comics
GET    /api/v1/comics/my-collection  - Get owned NFTs
GET    /api/v1/marketplace/users/me/listings - Get user's listings
```

---

## Architecture Overview

### Technology Stack
- **Blockchain**: Hedera Hashgraph (HTS for NFTs)
- **Storage**: IPFS/Pinata (decentralized content storage)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Frontend**: React + Vite
- **Wallet**: HashConnect / WalletConnect

### Data Flow

```
Creator Uploads → IPFS Storage → NFT Metadata → HTS Mint → Database Record
                                                              ↓
Reader Verifies Ownership ← Database Check ← Hedera Query ← Wallet Signature
                     ↓
               Access Granted → Content Served → Reading Tracked
```

### Smart Features

1. **Automatic Royalties**: 10% default royalty on secondary sales
2. **Platform Fees**: 2.5% on all marketplace transactions
3. **Access Control**: NFT-based content access verification
4. **Reading Analytics**: Track views, reads, progress
5. **Marketplace**: Fixed-price and auction listings

---

## Troubleshooting

### Common Issues

#### 1. "Hedera service not initialized"
**Solution**: Check `.env` has correct `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY`

#### 2. "IPFS service not initialized"
**Solution**: Verify `PINATA_JWT` is valid and account is active

#### 3. "MongoDB connection failed"
**Solution**:
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`

#### 4. "File upload failed"
**Solution**:
- Ensure `uploads/` directory exists
- Check disk space
- Verify file size limits

#### 5. "Insufficient balance"
**Solution**:
- Get test HBAR from faucet
- Ensure operator account has balance

### Debug Mode

Enable detailed logging:
```bash
# backend/.env
NODE_ENV=development
LOG_LEVEL=debug
```

View logs:
```bash
# Backend console output
tail -f backend/logs/combined.log
```

---

## Next Steps

1. **Deploy to Production**
   - See `VERCEL_DEPLOYMENT_GUIDE.md`
   - Configure mainnet credentials
   - Set up production MongoDB

2. **Customize**
   - Adjust royalty percentages
   - Modify platform fees
   - Add custom genres/categories

3. **Enhance**
   - Add social features
   - Implement notifications
   - Add advanced analytics

---

## Support

For issues and questions:
- GitHub Issues: <your-repo-issues-url>
- Documentation: See `/docs` folder
- Hedera Docs: https://docs.hedera.com
- IPFS Docs: https://docs.ipfs.tech

---

## License

[Your License Here]
