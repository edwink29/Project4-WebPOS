export const fetchAPI = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("token");
  const validToken = token && token !== "undefined" ? token : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(validToken ? { Authorization: `Bearer ${validToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
    }

    // 1. Baca isi body sebagai teks sekali saja
    const rawText = await response.text();
    let errorMessage = `Server Error (${response.status})`;

    // 2. Coba parse JSON dari teks tersebut secara aman
    if (rawText) {
      try {
        const errorData = JSON.parse(rawText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Jika bukan format JSON (misal HTML error 500 / teks biasa)
        errorMessage = rawText;
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
};
