import axios from 'axios';

const backendAgent = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACK_END_ENDPOINT}/api/v1`,
});

export default backendAgent;