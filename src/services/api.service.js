import axios from "axios";


const apiService = {
  url: "http://localhost:8080/",
  
   api : axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    }
  })
  ,
  postlogin(endpoint, data) {
    return axios.post(`${this.url}${endpoint}`, data)
  },
  post(endpoint, data) {
    return axios.post(`${this.url}${endpoint}`, data,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },
  getdata(endpoint) {
    return axios.get(`${this.url}${endpoint}`,
      {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );
  },

  getbyid(endpoint, id) {
    return axios.get(`${this.url}${endpoint}${id}`,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },
  postdata(endpoint, data) {
    return axios.post(`${this.url}${endpoint}`, data,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    }).then(response => {
      console.log('Success:', response.data);
    })
    .catch(error => {
      console.error('403 Error?', error.response.status);
      console.error('Full error:', error);
    })
  },
  putdata(endpoint, data, id) {
    return axios.put(`${this.url}${endpoint}${id}`, data,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },
  put(endpoint, data) {
    return axios.put(`${this.url}${endpoint}`, data,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },
  
  getbyusername(endpoint, username) {
    return axios.get(`${this.url}${endpoint}${username}`, {
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },

  putData(endpoint, data) {
    return axios.put(this.url + endpoint, data,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  },

  deleteById(endpoint){
    return axios.delete(this.url+endpoint,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      }})
  }

  


};
export default apiService;