const axios = require('axios').default;
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const { URLSearchParams } = require('url');

class QBittorrentClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://qbittorrent:8080';
    this.username = config.username || 'kevin';
    this.password = config.password || 'kevinkevin';
    this.cookieJar = new tough.CookieJar();
    this.isAuthenticated = false;
    
    this.client = wrapper(axios.create({
      baseURL: this.baseURL,
      jar: this.cookieJar,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': this.baseURL,
        'Origin': this.baseURL
      }
    }));
  }

  async login() {
    try {
      console.log('Attempting login with username:', this.username);
      
      const loginData = new URLSearchParams();
      loginData.append('username', this.username);
      loginData.append('password', this.password);
      
      const formData = loginData.toString();
      
      const response = await this.client.post('/api/v2/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formData)
        }
      });

      if (response.status === 200) {
        this.isAuthenticated = true;
        console.log('Login successful, session cookie stored');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response data'
      });
      this.isAuthenticated = false;
      return false;
    }
  }

  async request(endpoint, options = {}) {
    try {
      // If not authenticated, try to login first
      if (!this.isAuthenticated) {
        const isLoggedIn = await this.login();
        if (!isLoggedIn) {
          throw new Error('Authentication failed');
        }
      }

      // Make the request
      const response = await this.client.get(endpoint, options);
      
      // If we get a 403, try to re-authenticate once
      if (response.status === 403) {
        console.log('Session expired, attempting to re-login...');
        this.isAuthenticated = false;
        const isLoggedIn = await this.login();
        if (!isLoggedIn) {
          throw new Error('Re-authentication failed');
        }
        // Retry the original request
        const retryResponse = await this.client.get(endpoint, options);
        return retryResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Convenience methods for common API calls
  async getVersion() {
    return this.request('/api/v2/app/version');
  }

  async getTorrents() {
    return this.request('/api/v2/torrents/info');
  }
}

module.exports = QBittorrentClient; 