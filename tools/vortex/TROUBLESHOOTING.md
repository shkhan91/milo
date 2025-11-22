# 🚨 Troubleshooting: All Requests Failing

## Quick Diagnosis

### Step 1: Open the Debug Tool
```bash
open tools/vortex/debug-backend.html
```

This will run comprehensive tests and show you exactly what's wrong.

---

## Most Common Issues

### 1. ❌ **CORS Not Configured** (Most Likely)

**Symptoms:**
- Browser console shows: `"Failed to fetch"` or `"CORS policy"` error
- All requests fail immediately
- Network tab shows request as "cancelled" or no response

**Fix:**
Your Adobe I/O Runtime actions **MUST return these headers**:

```javascript
// In your backend action code:
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    success: true,
    // ... your data
  })
};
```

**Test:**
1. Open `debug-backend.html`
2. Click "Test CORS"
3. If CORS headers are missing, update your backend actions

---

### 2. ❌ **Backend Not Deployed or Offline**

**Symptoms:**
- Request takes long time then fails
- Error: "Failed to fetch"
- Status code: (none) or 0

**Fix:**
Test if your backend is running:

```bash
# Test with curl
curl -X GET https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample

# Or in browser, visit directly:
# https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample
```

If you get 404 or connection error, redeploy your actions.

---

### 3. ❌ **Wrong Response Format**

**Symptoms:**
- Request succeeds but shows "Request failed"
- Backend returns HTML instead of JSON
- Console shows JSON parsing error

**Fix:**
Your backend MUST return:

```json
{
  "success": true,
  "results": [...],
  "cost": 0.05,
  "tokensUsed": { "total": 450 }
}
```

NOT:
```html
<html><body>Error: 500</body></html>
```

**Check in browser console:**
Look for the actual response body in Network tab.

---

### 4. ❌ **Authentication Issues**

**Symptoms:**
- Error: "401 Unauthorized"
- Error: "Invalid token"
- Backend rejects request

**Fix:**

```javascript
// Temporarily bypass auth to test:
// In your backend action:
async function main(params) {
  // Skip auth check for testing
  // const token = params.__ow_headers?.authorization;
  
  return {
    statusCode: 200,
    headers: { /* CORS headers */ },
    body: JSON.stringify({
      success: true,
      message: "Test successful - no auth check"
    })
  };
}
```

Once it works, add proper auth back.

---

## Debugging Steps

### 1. Check Browser Console (CRITICAL)

Open browser DevTools (F12) and check:

```
Console Tab:
- Look for red errors
- Check for CORS errors
- Note exact error messages

Network Tab:
- Find the failed request
- Check Status code
- Check Response tab
- Check Headers tab
```

### 2. Test with CURL

```bash
# Test sample endpoint
curl -X POST \
  https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"test": true}'
```

If CURL works but browser doesn't = **CORS issue**
If CURL fails = **Backend issue**

### 3. Check Backend Logs

In Adobe I/O Runtime console:
1. Go to your namespace
2. Find your action
3. Check "Activation Logs"
4. Look for errors

### 4. Enable Debug Mode

```javascript
// In browser console:
localStorage.setItem('debug', 'true');

// Then refresh and try again
// Check console for detailed logs
```

---

## Backend Action Template (Working Example)

```javascript
/**
 * Adobe I/O Runtime Action - Generate Titles
 */
async function main(params) {
  // CORS headers - REQUIRED
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (params.__ow_method === 'options') {
    return {
      statusCode: 204,
      headers: headers,
      body: ''
    };
  }

  try {
    // Your logic here
    const { videos, options } = params;
    
    // Example: Call AWS Bedrock or other AI service
    const results = await generateTitlesWithAI(videos, options);
    
    // MUST return this format
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        results: results,
        cost: 0.05,
        tokensUsed: { total: 450 },
        executionTime: 2340
      })
    };
    
  } catch (error) {
    // Error response format
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: error.code || 'INTERNAL_ERROR'
        }
      })
    };
  }
}

exports.main = main;
```

---

## Quick Fixes Checklist

```
[ ] Open debug-backend.html and run all tests
[ ] Check browser console for specific error
[ ] Verify CORS headers in backend response
[ ] Test with curl to isolate browser vs backend issue
[ ] Check backend is actually deployed (test URL in browser)
[ ] Verify response format is JSON, not HTML
[ ] Temporarily remove auth to test connectivity
[ ] Check Adobe I/O Runtime activation logs
[ ] Ensure response includes {success: true/false}
[ ] Try from different network (check firewall)
```

---

## Still Not Working?

### Get Debug Information

1. Open `debug-backend.html`
2. Click "Run All Tests"
3. Click "Copy Logs"
4. Share the logs

### Check These Specific Things:

1. **What does browser console say?**
   - F12 → Console tab → What's the exact error?

2. **What does Network tab show?**
   - F12 → Network tab → Click failed request
   - What's the Status?
   - What's in Response tab?
   - What's in Headers tab?

3. **Does this URL work in browser?**
   ```
   https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample
   ```
   - If you see JSON = Backend is working
   - If you see 404 = Backend not deployed
   - If you see "cannot be reached" = URL wrong

4. **Do you see the request in Network tab at all?**
   - No = CORS preflight failing
   - Yes but red = Backend returning error
   - Yes but cancelled = CORS issue

---

## Example Error Translations

| You See | It Means | Fix |
|---------|----------|-----|
| `Failed to fetch` | CORS or network | Add CORS headers to backend |
| `401 Unauthorized` | Auth token issue | Check token or remove auth temporarily |
| `404 Not Found` | Wrong URL or not deployed | Check endpoint URL |
| `500 Server Error` | Backend crashed | Check backend logs |
| `SyntaxError: JSON` | Backend returning HTML | Make backend return JSON |
| `Network error` | Can't reach server | Check URL, check internet |
| `CORS policy` | CORS headers missing | Add CORS headers to ALL responses |

---

## Contact Support With:

1. Screenshots of browser console
2. Screenshot of Network tab (showing failed request)
3. Output from debug-backend.html
4. Exact error message
5. Backend action code (if possible)

**The debug tool will identify the issue automatically!**

