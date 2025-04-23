import apiService from './api.service';

export const authService = {
    login: async (endpoint,credentials) => {
        try {
            const response = await apiService.postlogin(endpoint, credentials);
            const { token} = response.data;
            sessionStorage.setItem('token', token);
            return { token};
        } catch (error) {
            throw new Error('Failed to login');
        }
    },
    logout: () => {
        sessionStorage.removeItem('token');
        window.location.href = '/';
    },
    getCurrentRole: () => {
        const token = sessionStorage.getItem('token');
        return token ? token.toUpperCase() : null;
    },
    
    getToken: () => {
       return sessionStorage.getItem('token');
    },
    
    isAuthenticated: () => {
        const token = sessionStorage.getItem('token');
        if (!token) return false;
      
        try {
          // JWT tokens have three parts separated by dots
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error('Invalid token format');
            return false;
          }
          
          // Parse the payload
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is expired
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            console.log('Token expired');
            return false;
          }
          return true;
        } catch (error) {
          console.error('Error parsing token:', error);
          return false;
        }
    }
};