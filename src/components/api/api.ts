const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const BASE_URL = IS_DEV
  ? 'http://127.0.0.1:8000/api/'
  : 'https://flowkey.co.ke/api/';

const END_POINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}auth/register/`,
    LOGIN: `${BASE_URL}auth/login/`,
  },
};

const registerUser = async (credentials: {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
}) => {
  const response = await fetch(END_POINTS.AUTH.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch(END_POINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
};

export { END_POINTS, registerUser, loginUser };
