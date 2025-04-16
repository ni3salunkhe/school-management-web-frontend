import axios from "axios";


const apiService = {
  url: "http://localhost:8080/",

    post(endpoint,data,config){
        return axios.post(`${this.url}${endpoint}`,data)
    },
     getdata(endpoint)
    {
        return axios.get(`${this.url}${endpoint}`
        //     {
        //     headers: {
        //       "Authorization": `Bearer ${sessionStorage.getItem('token')}`
        //     }
        //   }
        );
    },
    
    getbyid(endpoint,id)
    {
      return axios.get(`${this.url}${endpoint}${id}`)
      }  ,
  postdata(endpoint, data) {
    return axios.post(`${this.url}${endpoint}`, data)
  },
  getdata(endpoint) {
    return axios.get(`${this.url}${endpoint}`
      //     {
      //     headers: {
      //       "Authorization": `Bearer ${sessionStorage.getItem('token')}`
      //     }
      //   }
    );
  },

  putdata(endpoint, data, id) {
    return axios.put(`${this.url}${endpoint}${id}`, data)
  },

  getbyid(endpoint, id) {
    return axios.get(`${this.url}${endpoint}${id}`
      , {
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

    putData(endpoint, data)
    {
      return axios.put(this.url +endpoint,data)
    }
   
  

};
export default apiService;