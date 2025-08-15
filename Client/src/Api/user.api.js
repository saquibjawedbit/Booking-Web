import { axiosClient } from '../AxiosClient/axios';

export const fetchUsers = async ({
  search = '',
  role = 'all',
  page = 1,
  limit = 10,
}) => {
  const params = { search, role, page, limit };
  const { data } = await axiosClient.get('/api/user', { params });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await axiosClient.delete(`/api/user/${userId}`);
  return data;
};

export const getUserAdventures = async () => {
  const response = await axiosClient.get(`/api/user/adventure`, {
    withCredentials: true,
  });
  return response.data;
};

export const getUserAdventureExperiences = async () => {
  const response = await axiosClient.get('/api/user/adventure-experiences', {
    withCredentials: true,
  });
  return response.data;
};
