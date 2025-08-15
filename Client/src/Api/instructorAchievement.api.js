import { axiosClient } from '../AxiosClient/axios';

export const getInstructorBadge = async (instructorId) => {
    const res = await axiosClient.get(`/api/instructorAchievement/${instructorId}`, {
        withCredentials: true,
    });
    return res;
};