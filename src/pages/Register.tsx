const handleGoogleSuccess = async (response: any) => {
  try {
    const result = await axios.post(
      "auth/google/google-register", // Update this URL
      { token: response.credential },
      {
        baseURL: "http://localhost:3000/api/",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    // Handle success
    console.log("Registration successful:", result.data);
  } catch (error) {
    console.error("Registration failed:", error);
    // Handle error appropriately
  }
};
