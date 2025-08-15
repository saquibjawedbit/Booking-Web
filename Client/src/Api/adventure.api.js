import { axiosClient } from '../AxiosClient/axios';

export const createAdventure = async (data) => {
  const res = await axiosClient.post('/api/adventure/create', data, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};

export const fetchAllAdventures = async () => {
  const res = await axiosClient.get(`/api/adventure/all`);
  return res;
};

export const fetchFilteredAdventures = async ({
  adventure = '',
  location = '',
  session_date = '',
} = {}) => {
  const params = new URLSearchParams();
  if (adventure && adventure.trim() !== '')
    params.append('adventure', adventure);
  if (location && location.trim() !== '') params.append('location', location);
  if (session_date && session_date.trim() !== '')
    params.append('session_date', session_date);
  const res = await axiosClient.get(
    `/api/adventure/filter?${params.toString()}`
  );
  console.log(res);
  return res;
};

export const updateAdventure = async (data) => {
  console.log(data);
  const id = data.get('_id');
  const res = await axiosClient.put(`/api/adventure/${id}`, data, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};

export const deleteAdventure = async (id) => {
  const res = await axiosClient.delete(`/api/adventure/${id}`, {
    withCredentials: true,
  });
  return res;
};

export const getAdventure = async (id) => {
  const res = await axiosClient.get(`/api/adventure/${id}`);
  return res;
};

export const fetchUserAdventureExperiences = async () => {
  const res = await axiosClient.get('/users/adventure-experiences', {
    withCredentials: true,
  });
  return res;
};