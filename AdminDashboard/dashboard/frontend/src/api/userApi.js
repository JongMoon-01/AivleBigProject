const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-cloud-server.com"
    : "http://localhost:8000"; // 개발용

export const fetchDashboard = async () => {
  const res = await fetch(`${BASE_URL}/api/dashboard`);
  if (!res.ok) throw new Error("Dashboard API Error");
  return res.json();
};
