import apiService from "./api.service";

export const fetchAllUsernames = async () => {
    try {
      const [headmasterRes, staffRes] = await Promise.all([
        apiService.getdata("school/"),apiService.getdata("staff/")
        
      ]);
  
      // Assuming each response contains an array of objects with a `username` field
      const headmasterUsernames = headmasterRes.data.map(user => user.headMasterUserName);
      const staffUsernames = staffRes.data.map(user => user.username);
      headmasterUsernames.push("Developer96");
  
      return [...headmasterUsernames, ...staffUsernames];
    } catch (error) {
      console.error("Error fetching usernames:", error);
      return []; // Return empty array on error
    }
  };