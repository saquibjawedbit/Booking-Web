import { loginStart, loginSuccess, setUser } from '../Store/UserSlice.js';
import { axiosClient } from '../AxiosClient/axios.js';
import { data } from 'react-router-dom';

export const UserRegister = async (data) => {
  const res = await axiosClient.post('/api/auth/signUp', data, {
    withCredentials: true,
  });
  if (res.status === 201) {
    return res.status;
  } else if (res.status === 409) {
    return res.status;
  }
};

export const VerifyUser = async (data, dispatch) => {
  const res = await axiosClient.post('/api/auth/verifyOtp', data, {
    withCredentials: true,
  });
  if (res.status === 200) {
    if (dispatch) {
      dispatch(loginSuccess(res.data.data));
    }
    return res.status;
  } else if (res.status === 400) {
    return res.status;
  }
};

export const UserLogin = async (data, dispatch) => {
  const res = await axiosClient.post('/api/auth/login', data, {
    withCredentials: true,
  });
  if (res?.data?.statusCode === 200) {
    console.log(res?.data?.data);
    dispatch(loginSuccess(res?.data?.data?.user));
    return res;
  }
  return res?.data?.statusCode;
};

export const ResendOtp = async (email) => {
  try {
    const data = { email: email };
    const res = await axiosClient.post('/api/auth/resendOtp', data);
  } catch (err) {
    console.log(err);
    if (err?.response) {
      if (err?.response?.status === 403) {
        return err?.response?.status;
      }
    }
  }
};

export const ForgotPass = async (email) => {
  try {
    const data = { email: email };
    const res = await axiosClient.post('/api/auth/forgotPassword', data);
    return res;
  } catch (err) {
    return err;
  }
};

export const UpdatePass = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updatePassword', data);
    return res;
  } catch (err) {
    return err;
  }
};

export const VerifyNewEmail = async (data) => {
  try {
    const res = await axiosClient.post(
      '/api/auth/verifyNewEmail',
      { newEmail: data },
      {
        withCredentials: true,
      }
    );
    console.log(res);
    if (res?.status === 200) {
      return res;
    } else {
      return res?.status;
    }
  } catch (err) {
    if (err?.response) {
      return err?.response?.status;
    }
  }
};

export const UpdateEmail = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updateEmail', data, {
      withCredentials: true,
    });
    console.log(res);
    if (res?.status === 200) {
      return res;
    } else {
      return res?.status;
    }
  } catch (err) {
    if (err?.response) {
      return err?.response?.status;
    }
  }
};

export const UpdatePassword = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updatePassword', data, {
      withCredentials: true,
    });
    if (res?.status === 200) {
      return res;
    } else {
      return res?.status;
    }
  } catch (err) {
    if (err?.response) {
      return err;
    }
  }
};

export const GoogleLoginSuccess = async (response, dispatch) => {
  await axiosClient
    .post(
      '/api/auth/signInWithGoogle',
      { token: response?.credential },
      { withCredentials: true }
    )
    .then((res) => {
      if (res?.status === 200) {
        dispatch(loginSuccess(res?.data?.data));
        return res?.status;
      }
    })
    .catch((err) => {
      return err;
    });
};

export const userLogout = async (dispatch) => {
  try {
    await axiosClient.post(
      '/api/auth/logout',
      {},
      {
        withCredentials: true,
      }
    );
    dispatch(logout());
    return 200;
  } catch (error) {
    return error;
  }
};
