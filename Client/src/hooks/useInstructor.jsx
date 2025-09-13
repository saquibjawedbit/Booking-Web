import { useEffect, useState } from 'react';
import {
  changeDocumentStatusById,
  deleteInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructorCommission,
} from '../Api/instructor.api';

export function useInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const getProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getAllInstructors();
      console.log(res.data.message);
      setInstructors(res.data.message.instructors);
      setTotal(res.data.message.total);
      setTotalPages(res.data.message.totalPages);
      setError(null);
    } catch (err) {
      setError(err);
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getProfile();
  }, [page]);

  const deleteInstructorById = async (id) => {
    setIsLoading(true);
    try {
      await deleteInstructor(id);
      await getProfile(); // Refresh the data
      setError(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkInstructorStatus = async (id) => {
    setIsLoading(true);
    try {
      const res = await getInstructorById(id);
      if (
        res.data.message.instructor[0].instructor.documentVerified === 'pending'
      ) {
        return false;
      } else if (
        res.data.message.instructor[0].instructor.documentVerified ===
        'verified'
      ) {
        return true;
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeDocumentStatus = async (id, status) => {
    setIsLoading(true);
    try {
      await changeDocumentStatusById(id, status);
      setInstructors((prevInstructors) =>
        prevInstructors.map((instructor) =>
          instructor?.instructor?._id === id
            ? {
                ...instructor,
                instructor: {
                  ...instructor.instructor,
                  documentVerified: status,
                },
              }
            : instructor
        )
      );
      await getProfile(); // Refresh the data
      setError(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCommission = async (instructorId, commission) => {
    setIsLoading(true);
    try {
      await updateInstructorCommission(instructorId, commission);
      // Update the local state to reflect the change
      setInstructors((prevInstructors) =>
        prevInstructors.map((instructor) =>
          instructor?.instructor?._id === instructorId
            ? {
                ...instructor,
                instructor: {
                  ...instructor.instructor,
                  commission: commission,
                },
              }
            : instructor
        )
      );
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    instructors,
    isLoading,
    getProfile,
    error,
    page,
    setPage,
    total,
    limit,
    deleteInstructorById,
    checkInstructorStatus,
    totalPages,
    changeDocumentStatus,
    updateCommission,
  };
}
