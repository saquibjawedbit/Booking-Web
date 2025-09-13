import { axiosClient } from '../AxiosClient/axios';

export const getAllSessions = async ({
  adventure = '',
  location = '',
  session_date = '',
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (adventure && adventure.trim() !== '')
      params.append('adventure', adventure);
    if (location && location.trim() !== '') params.append('location', location);
    if (session_date && session_date.trim() !== '')
      params.append('session_date', session_date);
    const res = await axiosClient.get(
      `/api/session/instructors?${params.toString()}`
    );
    return res;
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    throw error;
  }
};

export const getAllInstructors = async () => {
  try {
    const res = await axiosClient.get('/api/instructor');
    return res;
  } catch (error) {
    console.error('Error fetching all instructors:', error);
    throw error;
  }
};

export const getInstructorById = async (id) => {
  try {
    const res = await axiosClient.get(`/api/instructor/${id}`);
    return res;
  } catch (error) {
    console.error('Error fetching instructor by ID:', error);
    throw error;
  }
};

export const deleteInstructor = async (id) => {
  try {
    const res = await axiosClient.delete(`/api/instructor/${id}`);
    return res;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
};

export const updateInstructorCommission = async (instructorId, commission) => {
  try {
    const res = await axiosClient.patch(
      `/api/instructor/${instructorId}/commission`,
      { commission },
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.error('Error updating instructor commission:', error);
    throw error;
  }
};

export const changeDocumentStatusById = async (id, status) => {
  try {
    const res = await axiosClient.put(`/api/instructor/${id}`, { status });
    return res;
  } catch (error) {
    console.error('Error changing document status:', error);
    throw error;
  }
};

// Get instructor's own sessions with booking details
export const getInstructorSessionsWithBookings = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const res = await axiosClient.get(
      `/api/session/instructor/my-sessions${params ? `?${params}` : ''}`,
      {
        withCredentials: true,
      }
    );
    return res;
  } catch (error) {
    console.error('Error fetching instructor sessions:', error);
    throw error;
  }
};
