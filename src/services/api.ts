
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json'
  }
})

export default api
