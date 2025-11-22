# 🚨 Quick Fix for 403 Forbidden Error

## Progress Update ✅
- ✅ Headers are being sent correctly
- ✅ Backend is receiving the request
- ⚠️ Backend is rejecting due to permissions

## What 403 Means
Your backend is saying: "I see your request, but you don't have permission to access this."

---

## 🎯 Most Likely Causes

### 1. **Sandbox Token Not Accepted** (99% This)

Your backend expects a **real Adobe IMS token**, not `sandbox-token`.

**Quick Test - Bypass Auth Temporarily:**

Update your backend action to allow sandbox mode:

```javascript
async function main(params) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-gw-ims-org-id, x-api-key',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS
  if (params.__ow_method === 'options') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // ✅ ADD THIS FOR TESTING - Skip auth check
    const token = params.__ow_headers?.authorization?.replace('Bearer ', '');
    const orgId = params.__ow_headers?.['x-gw-ims-org-id'];
    
    // Allow sandbox token for local testing
    if (token === 'sandbox-token' || orgId === 'sandbox-org-id') {
      console.log('⚠️ Using sandbox credentials - development mode');
      // Skip validation, continue with request
    } else {
      // Your real authentication logic here
      // validateToken(token);
      // validateOrgId(orgId);
    }

    // Your business logic
    const result = {
      success: true,
      message: 'Action executed successfully',
      timestamp: new Date().toISOString(),
      receivedToken: token ? 'Yes (hidden)' : 'No',
      receivedOrgId: orgId ? 'Yes' : 'No'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: { message: error.message }
      })
    };
  }
}

exports.main = main;
```

---

### 2. **Wrong Org ID**

The Org ID you're using doesn't have access to this namespace.

**Check your backend logs:**
1. Go to Adobe I/O Runtime Console
2. Check activation logs for your action
3. See what Org ID it's expecting

**Fix:**
Use the correct Org ID in `configure.html`

---

### 3. **Additional Permission Checks**

Your backend might be checking:
- Specific user roles
- API key permissions
- Resource ownership
- Custom authorization logic

**Check your backend code** for lines like:
```javascript
if (!hasPermission(user, resource)) {
  return { statusCode: 403, ... };
}
```

---

## 🛠️ Debugging Steps

### Step 1: Check What Backend Received

Add logging to your backend action:

```javascript
async function main(params) {
  // Log everything received
  console.log('Headers received:', params.__ow_headers);
  console.log('Authorization:', params.__ow_headers?.authorization);
  console.log('Org ID:', params.__ow_headers?.['x-gw-ims-org-id']);
  console.log('Body:', params);
  
  // ... rest of your code
}
```

Then check the Adobe I/O Runtime activation logs.

---

### Step 2: Test with CURL

```bash
# Test if backend accepts requests at all
curl -X POST \
  https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sandbox-token" \
  -H "x-gw-ims-org-id: sandbox-org-id" \
  -d '{"test": true}'
```

If CURL returns 403 too → Backend issue
If CURL works → Frontend/CORS issue

---

### Step 3: Simplify Backend (Minimal Test)

Create a super simple action that accepts anything:

```javascript
async function main(params) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: 'Hello from backend!',
      receivedParams: {
        hasAuth: !!params.__ow_headers?.authorization,
        hasOrgId: !!params.__ow_headers?.['x-gw-ims-org-id'],
        method: params.__ow_method,
        headers: params.__ow_headers
      }
    })
  };
}

exports.main = main;
```

If this works → Your permission logic is rejecting the request
If this fails → Infrastructure/deployment issue

---

## 🎯 Quick Fixes to Try (In Order)

### Fix 1: Allow Sandbox Mode ⭐ **TRY THIS FIRST**

In your backend, add this at the top of the `main` function:

```javascript
// Development mode - skip auth
const isDevelopment = params.__ow_headers?.authorization?.includes('sandbox');
if (isDevelopment) {
  // Skip all auth checks, return success immediately
  return {
    statusCode: 200,
    headers: { /* CORS headers */ },
    body: JSON.stringify({
      success: true,
      message: 'Development mode - auth bypassed',
      data: 'Your actual response here'
    })
  };
}
```

---

### Fix 2: Check Backend Namespace

Your endpoints are on: `14257-vortex-stage.adobeio-static.net`

**Verify:**
1. You deployed to the right namespace
2. The actions are actually there
3. They're not private/require special permissions

```bash
# List your actions
aio runtime action list

# Test invoke directly
aio runtime action invoke vortex/sample --result
```

---

### Fix 3: Use Real Adobe IMS Token

If you're testing in an Adobe environment:

```javascript
// In browser console on an Adobe page:
window.adobeIMS.getAccessToken()

// Copy the token, then:
localStorage.setItem('vortex:token', 'YOUR_REAL_TOKEN_HERE');
```

Then update vortexApi.js to use it:

```javascript
this.getToken = () => {
  // Check for saved token first
  const savedToken = localStorage.getItem('vortex:token');
  if (savedToken) return savedToken;
  
  return window.adobeIMS?.getAccessToken()?.token || 'sandbox-token';
};
```

---

## 📊 What to Check Right Now

1. **Backend Logs** - Most important! Check Adobe I/O Runtime logs
2. **Backend Code** - Look for permission checks that return 403
3. **CURL Test** - Does it work with CURL? Then it's a browser/CORS issue
4. **Simplified Action** - Deploy the minimal action above to test

---

## 🆘 If Still Stuck

Share these details:
1. Backend activation logs from Adobe I/O Runtime
2. Your backend action code (especially auth/validation parts)
3. Result of CURL test
4. Browser console output with full error

**Most likely:** Backend is rejecting sandbox token. Add development mode bypass! 🎯

