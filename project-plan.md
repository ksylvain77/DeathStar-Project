# DeathStar NAS Project - Implementation Plan

## Current Status
- Docker-based NAS management system with qBittorrent and custom web portal is set up
- Web portal is running at http://192.168.50.92:3000
- qBittorrent is running at http://192.168.50.92:8080
- Authentication issues between web portal and qBittorrent API need to be resolved

## Phase 1: Fix Authentication Issues

### 1.1 Review qBittorrent WebUI Settings
- Verify WebUI authentication settings
- Check if API access is properly enabled
- Confirm the correct port (8080) is being used

### 1.2 Modify Web Portal Authentication
- Implement proper session management
- Add retry logic with exponential backoff
- Add proper error handling for authentication failures

## Phase 2: Enhance Error Handling

### 2.1 Add Comprehensive Logging
- Log all API requests and responses
- Track authentication state
- Monitor connection status

### 2.2 Implement Graceful Degradation
- Handle temporary connection issues
- Provide meaningful error messages to users
- Add automatic recovery mechanisms

## Phase 3: Improve User Interface

### 3.1 Add Real-time Status Indicators
- Connection status to qBittorrent
- Authentication status
- Current operation status

### 3.2 Enhance Torrent Display
- Add more torrent details
- Implement sorting and filtering
- Add progress indicators

## Phase 4: Add Additional Features

### 4.1 Implement Torrent Management
- Add new torrents
- Pause/Resume torrents
- Remove torrents

### 4.2 Add System Monitoring
- Disk space usage
- Download/Upload speeds
- System resource usage

## Technical Implementation Details

### Authentication Fixes
```javascript
// Example of improved authentication handling
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function authenticateWithRetry() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await qbtClient.post('/api/v2/auth/login', null, {
        params: { username: 'kevin', password: 'kevin' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.status === 200) {
        // Store session cookie
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          qbtClient.defaults.headers.common['Cookie'] = cookies.join('; ');
        }
        return true;
      }
    } catch (error) {
      console.error(`Authentication attempt ${i + 1} failed:`, error.message);
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
      }
    }
  }
  return false;
}
```

### Error Handling
```javascript
// Example of improved error handling
async function handleApiRequest(endpoint, options = {}) {
  try {
    const isAuthenticated = await authenticateWithRetry();
    if (!isAuthenticated) {
      throw new Error('Authentication failed');
    }

    const response = await qbtClient.get(endpoint, options);
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}
```

### UI Improvements
```javascript
// Example of enhanced status display
function updateConnectionStatus(status) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = `status ${status.type}`;
  statusDiv.innerHTML = `
    <div class="status-header">
      <span class="status-icon">${status.icon}</span>
      <span class="status-text">${status.message}</span>
    </div>
    ${status.details ? `<div class="status-details">${status.details}</div>` : ''}
  `;
}
```

## Testing Plan

### 1. Test Authentication
- Verify successful login
- Test session persistence
- Check retry mechanism

### 2. Test Error Handling
- Simulate network issues
- Test authentication failures
- Verify error messages

### 3. Test UI
- Check status updates
- Verify torrent display
- Test user interactions

## Deployment Steps

1. Update code with new changes
2. Test locally
3. Deploy to NAS
4. Monitor logs
5. Verify functionality

## Current Issues to Address

1. Authentication session not being maintained between requests
2. IP getting banned after multiple failed attempts
3. Need better error handling and user feedback
4. Need to implement proper retry logic

## Next Immediate Steps

1. Implement the improved authentication handling with retry logic
2. Add proper session management
3. Implement comprehensive error logging
4. Update the UI to show more detailed status information

## Notes

- Keep track of qBittorrent's API documentation for any changes
- Monitor Docker container logs for both web portal and qBittorrent
- Consider implementing a health check endpoint
- Plan for future scalability and additional features 