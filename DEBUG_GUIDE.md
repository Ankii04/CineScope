# 🔍 Movie Discovery Hub - API Debugging Guide

## Current Issue
The TMDB API calls are failing in the Movie Discovery Hub application.

## Diagnostic Steps

### Step 1: Test the API Key
1. Open your browser and navigate to: `http://localhost:8000/test-api.html`
2. The page will automatically test your API key
3. Click each test button to verify:
   - ✅ Basic API Connection
   - ✅ Trending Movies
   - ✅ Search functionality
   - ✅ Genres list

### Step 2: Check Browser Console
1. Open `http://localhost:8000` in your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for errors (they will be in red)
5. Common errors to look for:
   - `401 Unauthorized` - Invalid API key
   - `CORS policy` - CORS issue (shouldn't happen with local server)
   - `Failed to fetch` - Network connectivity issue
   - `API request failed` - Generic API error

### Step 3: Check Network Tab
1. In Developer Tools, go to the **Network** tab
2. Refresh the page
3. Look for requests to `api.themoviedb.org`
4. Click on any failed requests (they'll be in red)
5. Check the:
   - **Status Code** (should be 200, if not, note the error code)
   - **Response** tab (shows the error message)
   - **Headers** tab (shows request details)

## Common Issues & Solutions

### Issue 1: Invalid API Key (401 Unauthorized)
**Symptoms:**
- Console shows: `401 Unauthorized`
- Network tab shows failed requests with status 401

**Solution:**
1. Go to https://www.themoviedb.org/settings/api
2. Sign in or create an account
3. Generate a new API key (v3 auth)
4. Replace the API key in `script.js` line 5:
   ```javascript
   API_KEY: 'YOUR_NEW_API_KEY_HERE',
   ```

### Issue 2: CORS Policy Error
**Symptoms:**
- Console shows: `Access to fetch at '...' has been blocked by CORS policy`

**Solution:**
- Make sure you're accessing the page through `http://localhost:8000` NOT `file:///`
- The Python server should be running: `python -m http.server 8000`

### Issue 3: Network Connectivity
**Symptoms:**
- Console shows: `Failed to fetch` or `Network error`
- No requests appear in Network tab

**Solution:**
- Check your internet connection
- Try accessing https://www.themoviedb.org/ directly
- Check if your firewall is blocking the requests
- Try disabling VPN if you're using one

### Issue 4: Rate Limiting (429 Too Many Requests)
**Symptoms:**
- Console shows: `429 Too Many Requests`
- API was working but suddenly stopped

**Solution:**
- TMDB free tier has rate limits (40 requests per 10 seconds)
- Wait a few minutes and try again
- Consider implementing request caching

## Quick Test Commands

### Test API Key with curl (PowerShell):
```powershell
$apiKey = "8265bd1679663a7ea12ac168da84d2e8"
Invoke-RestMethod -Uri "https://api.themoviedb.org/3/configuration?api_key=$apiKey"
```

### Test API Key with curl (Command Prompt):
```cmd
curl "https://api.themoviedb.org/3/configuration?api_key=8265bd1679663a7ea12ac168da84d2e8"
```

## Debugging Checklist

- [ ] Python server is running on port 8000
- [ ] Accessing via `http://localhost:8000` (not file://)
- [ ] API key is valid and not expired
- [ ] Internet connection is working
- [ ] No firewall blocking TMDB API
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls (status 200)

## Enhanced Error Logging

If you want more detailed error information, add this to `script.js` after line 117:

```javascript
console.error('API Error Details:', {
    endpoint: endpoint,
    params: params,
    url: url.toString(),
    error: error,
    errorMessage: error.message,
    errorStack: error.stack
});
```

## Testing the Fix

After making changes:
1. Save the file
2. Refresh the browser (Ctrl + F5 for hard refresh)
3. Check the console for errors
4. Try searching for a movie
5. Check if movie cards appear

## Need More Help?

If the issue persists:
1. Take a screenshot of the browser console errors
2. Take a screenshot of the Network tab showing failed requests
3. Copy the exact error message
4. Check the response from the test-api.html page

## API Key Information

Current API Key in script.js: `8265bd1679663a7ea12ac168da84d2e8`

To verify this key is valid:
1. Open `http://localhost:8000/test-api.html`
2. Click "Test Connection"
3. If it shows ✅ SUCCESS, the key is valid
4. If it shows ❌ ERROR, you need a new key
