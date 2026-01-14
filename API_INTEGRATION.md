# API Integration Guide

## Overview

This document details the integration between the Comic Pad frontend and backend APIs.

## Configuration

### Backend API URL

**Development**: `http://localhost:3001/api/v1`
**Production**: Set via `VITE_API_URL` environment variable

Configuration is managed in:
- `frontend/src/config/api.js`
- `frontend/src/services/api.js`

### Environment Variables

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_HEDERA_NETWORK=testnet
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## API Service Architecture

### Base API Client (`frontend/src/services/api.js`)

Axios instance with:
- ✅ Automatic JWT token injection
- ✅ Token refresh on 401 errors
- ✅ Error toast notifications
- ✅ Request/Response interceptors

### API Modules

All API endpoints are organized into modules:

#### 1. **Authentication API** (`authAPI`)
- `register(userData)` - Register new user
- `login(credentials)` - Login user
- `logout()` - Logout user
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `connectWallet(walletData)` - Connect Hedera wallet
- `disconnectWallet()` - Disconnect wallet
- `requestCreatorStatus(data)` - Request creator privileges
- `changePassword(data)` - Change password
- `refreshToken(refreshToken)` - Refresh JWT token

#### 2. **Comics API** (`comicsAPI`)
- `getComics(params)` - Get all comics with filters
- `getComicById(id)` - Get comic by ID
- `createComic(formData)` - Create new comic (multipart)
- `updateComic(id, data)` - Update comic
- `deleteComic(id)` - Delete comic
- `mintComic(id, quantity)` - Mint comic NFTs
- `getCreatorComics()` - Get current user's comics
- `getUserComics()` - Get user's NFT collection
- `favoriteComic(id)` - Add comic to favorites
- `unfavoriteComic(id)` - Remove from favorites

#### 3. **Collections API** (`collectionsAPI`)
- `getCollections(params)` - Get all collections
- `getCollectionById(id)` - Get collection by ID
- `createCollection(formData)` - Create collection (multipart)
- `updateCollection(id, data)` - Update collection
- `deleteCollection(id)` - Delete collection

#### 4. **Marketplace API** (`marketplaceAPI`)
- `getListings(params)` - Get marketplace listings
- `getListingById(id)` - Get listing by ID
- `createListing(data)` - Create new listing
- `buyNFT(id, data)` - Purchase NFT
- `placeBid(id, data)` - Place auction bid
- `completeAuction(id)` - Complete auction
- `cancelListing(id)` - Cancel listing
- `makeOffer(data)` - Make offer on NFT
- `respondToOffer(id, data)` - Accept/reject offer

#### 5. **Stats API** (`statsAPI`)
- `getPlatformStats()` - Get platform statistics
- `getTrendingComics(limit)` - Get trending comics

#### 6. **Search API** (`searchAPI`)
- `searchComics(query, params)` - Search comics

#### 7. **User API** (`userAPI`)
- `getUserById(id)` - Get user by ID
- `getUserProfile(username)` - Get user profile by username
- `followUser(id)` - Follow user
- `unfollowUser(id)` - Unfollow user

## Usage Examples

### Basic API Call

```jsx
import { comicsAPI } from '@/services/api';

// Get all comics
const comics = await comicsAPI.getComics({ limit: 10, offset: 0 });

// Get specific comic
const comic = await comicsAPI.getComicById('comic-id');
```

### With Loading State

```jsx
import { useState } from 'react';
import { comicsAPI } from '@/services/api';
import { SectionLoader } from '@/components/common/LoadingStates';

function ComicsList() {
  const [comics, setComics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchComics() {
      try {
        setIsLoading(true);
        const data = await comicsAPI.getComics();
        setComics(data.comics);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComics();
  }, []);

  if (isLoading) return <SectionLoader message="Loading comics..." />;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render comics */}</div>;
}
```

### Using Custom Hook

```jsx
import { useAsyncAction } from '@/hooks/useLoading';
import { comicsAPI } from '@/services/api';

function CreateComicForm() {
  const { execute, isLoading, error } = useAsyncAction(comicsAPI.createComic);

  const handleSubmit = async (formData) => {
    try {
      const result = await execute(formData);
      toast.success('Comic created!');
    } catch (err) {
      // Error already handled by useAsyncAction
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Comic'}
      </button>
    </form>
  );
}
```

### File Upload

```jsx
import { comicsAPI } from '@/services/api';

async function uploadComic(files) {
  const formData = new FormData();
  formData.append('title', 'My Comic');
  formData.append('description', 'An awesome comic');
  formData.append('cover', files.cover);

  files.pages.forEach((page, index) => {
    formData.append('pages', page);
  });

  const result = await comicsAPI.createComic(formData);
  return result;
}
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Authentication Flow

### 1. Login

```jsx
import { authAPI } from '@/services/api';

const result = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored in localStorage
// All subsequent requests include the token
```

### 2. Automatic Token Refresh

When a 401 error occurs:
1. API client attempts to refresh the token
2. If successful, retries the original request
3. If refresh fails, redirects to login page

### 3. Protected Routes

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';

function ProtectedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        await authAPI.getProfile();
      } catch (error) {
        navigate('/login');
      }
    }

    checkAuth();
  }, []);

  // Render protected content
}
```

## Error Handling

### Global Error Handling

Errors are automatically shown via toast notifications (configured in interceptor).

### Custom Error Handling

```jsx
try {
  await comicsAPI.createComic(formData);
} catch (error) {
  if (error.response?.status === 400) {
    // Handle validation error
    console.error('Validation failed:', error.response.data);
  } else if (error.response?.status === 403) {
    // Handle permission error
    toast.error('You do not have permission');
  } else {
    // Handle other errors
    toast.error('An unexpected error occurred');
  }
}
```

## CORS Configuration

The backend is configured to accept requests from the frontend origin.

**Backend CORS settings** (`backend/src/server.js`):
```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Testing API Integration

### Using the API Testing Checklist

1. **Start Backend**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

3. **Test Endpoints**

Use the browser console or create a test page:

```jsx
import { comicsAPI, authAPI, marketplaceAPI } from '@/services/api';

// Test comics API
const testComics = async () => {
  const comics = await comicsAPI.getComics();
  console.log('Comics:', comics);
};

// Test auth API
const testAuth = async () => {
  const result = await authAPI.login({
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('Auth result:', result);
};

// Test marketplace API
const testMarketplace = async () => {
  const listings = await marketplaceAPI.getListings();
  console.log('Listings:', listings);
};
```

## Backend API Routes

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - Register
- `POST /login` - Login
- `POST /logout` - Logout
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `POST /connect-wallet` - Connect wallet

### Comics Routes (`/api/v1/comics`)
- `GET /` - List comics
- `GET /:id` - Get comic
- `POST /` - Create comic
- `PUT /:id` - Update comic
- `DELETE /:id` - Delete comic
- `POST /:id/mint` - Mint NFT
- `POST /collections` - Create collection
- `GET /collections/:id` - Get collection

### Marketplace Routes (`/api/v1/marketplace`)
- `GET /listings` - List marketplace items
- `GET /listings/:id` - Get listing
- `POST /listings` - Create listing
- `POST /listings/:id/buy` - Buy NFT
- `POST /listings/:id/bid` - Place bid
- `POST /listings/:id/complete` - Complete auction
- `DELETE /listings/:id` - Cancel listing

### Stats Routes (`/api/v1/stats`)
- `GET /platform` - Platform statistics
- `GET /marketplace` - Marketplace statistics

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Solutions:**
1. Ensure backend is running: `cd backend && npm run dev`
2. Check `VITE_API_URL` in `.env.local`
3. Verify CORS settings in backend
4. Check browser console for specific error

### Issue: "401 Unauthorized"

**Solutions:**
1. Check if token is in localStorage: `localStorage.getItem('token')`
2. Try logging in again
3. Check token expiry
4. Verify JWT_SECRET matches between frontend/backend

### Issue: "404 Not Found"

**Solutions:**
1. Verify API route exists in backend
2. Check API_URL configuration
3. Ensure `/api/v1` prefix is correct
4. Check backend route definitions

### Issue: File upload fails

**Solutions:**
1. Ensure `Content-Type: multipart/form-data` header is set
2. Check file size limits (backend: 50MB default)
3. Verify multer configuration in backend
4. Check network tab for request payload

## Production Deployment

### Environment Variables

**Vercel/Netlify:**
```
VITE_API_URL=https://api.yourproductiondomain.com/api/v1
VITE_HEDERA_NETWORK=mainnet
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### CORS Configuration

Update backend `.env`:
```
FRONTEND_URL=https://yourfrontenddomain.com
```

### API Monitoring

Consider adding:
- Request logging
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- Rate limiting alerts

## Summary

✅ **API Client**: Configured with interceptors
✅ **Authentication**: JWT with automatic refresh
✅ **Error Handling**: Global toast notifications
✅ **File Uploads**: Multipart form data support
✅ **Type Safety**: Well-documented API methods
✅ **Development**: Hot reload support
✅ **Production**: Environment-based configuration

The frontend is fully integrated with the backend API and ready for development!
