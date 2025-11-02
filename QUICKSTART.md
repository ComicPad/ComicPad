# Comic Pad - Quick Start Guide

Get your Comic Pad platform running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Hedera testnet account (get from https://portal.hedera.com)
- Pinata account (get from https://pinata.cloud)
- MongoDB running (local or Atlas)

---

## 1. Environment Setup (2 minutes)

### Backend Configuration

Create `backend/.env`:
```bash
# Copy this template
NODE_ENV=development
PORT=3001

# Your MongoDB
MONGODB_URI=mongodb://localhost:27017/comicpad

# Your Hedera Account
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY

# Your Pinata JWT
PINATA_JWT=YOUR_PINATA_JWT

# Generate this: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret

# Other
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_HEDERA_NETWORK=testnet
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
```

---

## 2. Install Dependencies (1 minute)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 3. Create Upload Directory

```bash
# From project root
mkdir -p backend/uploads
```

---

## 4. Start the Application (1 minute)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ Forced DNS to Google DNS: 8.8.8.8, 8.8.4.4
✅ MongoDB Connected
✅ IPFS Service (Pinata) initialized successfully
Server running in development mode on port 3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 5. Test the API (1 minute)

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Test Comic Creation (with authentication)

First, register a user:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcreator",
    "email": "creator@test.com",
    "password": "password123"
  }'
```

---

## Complete Workflow Test

### 1. Register & Login
Use frontend or API to create account and get JWT token.

### 2. Create Comic Collection
```bash
curl -X POST http://localhost:3001/api/v1/comics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Comic",
    "description": "An amazing adventure",
    "genres": ["action", "adventure"],
    "royaltyPercentage": 10
  }'
```

Response:
```json
{
  "success": true,
  "message": "Comic collection created successfully",
  "data": {
    "comic": { ... },
    "tokenId": "0.0.XXXXX",
    "explorerUrl": "https://hashscan.io/testnet/token/0.0.XXXXX"
  }
}
```

### 3. Create Episode (with files)
```bash
curl -X POST http://localhost:3001/api/v1/comics/COMIC_ID/episodes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Episode 1" \
  -F "description=The beginning" \
  -F "episodeNumber=1" \
  -F "mintPrice=10" \
  -F "maxSupply=100" \
  -F "cover=@/path/to/cover.jpg" \
  -F "pages=@/path/to/page1.jpg" \
  -F "pages=@/path/to/page2.jpg"
```

### 4. Publish Episode
```bash
curl -X POST http://localhost:3001/api/v1/comics/episodes/EPISODE_ID/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPerWallet": 5
  }'
```

### 5. Mint NFT
```bash
curl -X POST http://localhost:3001/api/v1/comics/episodes/EPISODE_ID/mint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }'
```

### 6. Read Episode
```bash
curl http://localhost:3001/api/v1/comics/episodes/EPISODE_ID/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. List on Marketplace
```bash
curl -X POST http://localhost:3001/api/v1/marketplace/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.XXXXX",
    "serialNumber": 1,
    "episodeId": "EPISODE_ID",
    "price": 15,
    "currency": "HBAR"
  }'
```

---

## Troubleshooting

### "Hedera service not initialized"
- Check `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` in `.env`
- Ensure account has test HBAR from faucet

### "IPFS service not initialized"
- Verify `PINATA_JWT` is correct
- Check Pinata dashboard for account status

### "MongoDB connection failed"
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check `MONGODB_URI` in `.env`

### "File upload failed"
- Create uploads directory: `mkdir -p backend/uploads`
- Check disk space

---

## What's Next?

### For Creators:
1. Create your comic series
2. Upload episodes with pages
3. Set pricing and minting rules
4. Publish and start earning!

### For Developers:
1. Check `IMPLEMENTATION_SUMMARY.md` for complete feature list
2. Review `SETUP_GUIDE.md` for detailed configuration
3. Explore API endpoints in controllers
4. Customize frontend components

### For Collectors:
1. Browse available comics
2. Mint NFTs
3. Read comics you own
4. Trade on marketplace

---

## Key Endpoints

### Comics
- `POST /api/v1/comics` - Create comic
- `GET /api/v1/comics` - Browse comics
- `POST /api/v1/comics/:id/episodes` - Create episode
- `GET /api/v1/comics/episodes/:id/read` - Read episode

### Marketplace
- `GET /api/v1/marketplace/listings` - Browse marketplace
- `POST /api/v1/marketplace/listings` - List NFT
- `POST /api/v1/marketplace/listings/:id/buy` - Buy NFT
- `POST /api/v1/marketplace/auctions` - Create auction

### User
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/comics/my-comics` - My comics
- `GET /api/v1/comics/my-collection` - My NFTs

---

## Resources

- **Full Setup**: `SETUP_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Hedera Docs**: https://docs.hedera.com
- **IPFS Docs**: https://docs.ipfs.tech

---

## Support

Having issues? Check:
1. All environment variables are set
2. MongoDB is running
3. Hedera account has HBAR
4. Pinata JWT is valid
5. Upload directory exists

Still stuck? Review the full `SETUP_GUIDE.md` for detailed troubleshooting.

---

**You're all set! Start building your comic empire on Hedera! 🚀**
