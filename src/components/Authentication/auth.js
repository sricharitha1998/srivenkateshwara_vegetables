export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
  
    try {
      const response = await fetch("http://178.16.139.77:8000/api/v1/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error("Token refresh failed");
      }
  
      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      return data.access;
    } catch (err) {
      console.error("Refresh error:", err);
      // logout or redirect to login
      localStorage.clear();
      window.location.href = "/";
    }
  };