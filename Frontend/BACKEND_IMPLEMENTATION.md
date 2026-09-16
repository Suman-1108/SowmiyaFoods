# Backend Implementation for Banners

## Overview
This document contains the backend code changes needed to support the Diwali popup banner and Main banner features.

## Files to Modify

### 1. models/settingModel.js (or equivalent settings model)

Add the following fields to your settings schema:

```javascript
// Add these fields to your settings schema
diwaliPopupBanner: {
  type: String,
  default: ""
},
mainBanner: {
  type: String,
  default: ""
}
```

### 2. routes/settings.js (or equivalent settings routes)

Add the following routes:

```javascript
// Get Diwali Popup Banner
router.get("/diwali-popup-banner", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ bannerUrl: settings?.diwaliPopupBanner || "" });
  } catch (err) {
    console.error("Error fetching Diwali popup banner:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Update Diwali Popup Banner (Admin only)
router.put("/diwali-popup-banner", async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    
    // Optional: Add admin authentication middleware
    // This should be applied to all admin routes
    // const token = req.headers.authorization?.split(' ')[1];
    // Verify admin token here
    
    const settings = await Settings.findOneAndUpdate(
      {},
      { diwaliPopupBanner: bannerUrl },
      { new: true, upsert: true }
    );
    
    res.json({ bannerUrl: settings.diwaliPopupBanner });
  } catch (err) {
    console.error("Error updating Diwali popup banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// Get Main Banner (Public)
router.get("/main-banner", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ bannerUrl: settings?.mainBanner || "" });
  } catch (err) {
    console.error("Error fetching main banner:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Update Main Banner (Admin only)
router.put("/main-banner", verifyAdmin, async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      {},
      { mainBanner: bannerUrl },
      { new: true, upsert: true }
    );
    
    res.json({ bannerUrl: settings.mainBanner });
  } catch (err) {
    console.error("Error updating main banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});
```

### 3. Complete Example Implementation

If you're using a simple settings collection, here's a complete example:

```javascript
// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  metaPixelId: {
    type: String,
    default: ""
  },
  customMetaScript: {
    type: String,
    default: ""
  },
  diwaliPopupBanner: {
    type: String,
    default: ""
  },
  mainBanner: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
```

```javascript
// routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get Diwali Popup Banner (Public)
router.get("/diwali-popup-banner", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ bannerUrl: settings?.diwaliPopupBanner || "" });
  } catch (err) {
    console.error("Error fetching Diwali popup banner:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Update Diwali Popup Banner (Admin only)
router.put("/diwali-popup-banner", verifyAdmin, async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.diwaliPopupBanner = bannerUrl;
    await settings.save();
    
    res.json({ bannerUrl: settings.diwaliPopupBanner });
  } catch (err) {
    console.error("Error updating Diwali popup banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// Get Main Banner (Public)
router.get("/main-banner", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ bannerUrl: settings?.mainBanner || "" });
  } catch (err) {
    console.error("Error fetching main banner:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Update Main Banner (Admin only)
router.put("/main-banner", verifyAdmin, async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.mainBanner = bannerUrl;
    await settings.save();
    
    res.json({ bannerUrl: settings.mainBanner });
  } catch (err) {
    console.error("Error updating main banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

module.exports = router;
```

```javascript
// In your main server.js or app.js
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);
```

## Integration Steps

1. **Update Settings Model**: Add the `diwaliPopupBanner` and `mainBanner` fields to your settings schema
2. **Add Routes**: Add the new routes to your settings router
3. **Add Middleware**: Ensure admin authentication middleware is applied to the PUT routes
4. **Test**: Test the endpoints using Postman or similar tool

## Testing

### Test Diwali Popup GET endpoint (Public):
```bash
curl http://localhost:5000/api/settings/diwali-popup-banner
```

Expected response:
```json
{
  "bannerUrl": ""
}
```

### Test Diwali Popup PUT endpoint (Admin):
```bash
curl -X PUT http://localhost:5000/api/settings/diwali-popup-banner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"bannerUrl": "https://example.com/diwali-banner.jpg"}'
```

Expected response:
```json
{
  "bannerUrl": "https://example.com/diwali-banner.jpg"
}
```

### Test Main Banner GET endpoint (Public):
```bash
curl http://localhost:5000/api/settings/main-banner
```

Expected response:
```json
{
  "bannerUrl": ""
}
```

### Test Main Banner PUT endpoint (Admin):
```bash
curl -X PUT http://localhost:5000/api/settings/main-banner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"bannerUrl": "https://example.com/main-banner.jpg"}'
```

Expected response:
```json
{
  "bannerUrl": "https://example.com/main-banner.jpg"
}
```

## Notes

- The banner URL can be any valid image URL (Cloudinary, AWS S3, external URLs, etc.)
- The frontend will handle image upload and convert it to a URL before sending to backend
- If no main banner is set, the homepage will show a "No banner set" placeholder
- If no Diwali popup banner is set, the popup will show the default animated diyas design
- The GET endpoints are public (no auth required) since the banners need to display on the homepage
- The PUT endpoints require admin authentication

## Security Considerations

1. Always verify admin tokens before allowing updates
2. Consider adding rate limiting to prevent abuse
3. Validate that the URL is a valid image URL (optional)
4. Consider adding CORS headers if needed

## Deployment

After implementing the backend changes:

1. Deploy the backend changes to your server
2. The frontend is already configured to use these endpoints
3. Test the admin panel to upload/set the banners
4. Test the homepage to verify the banners display correctly