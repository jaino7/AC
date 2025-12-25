const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const request = async (path: string, payload: unknown) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "リクエストに失敗しました");
  }

  return response.json();
};

export const creatorSignup = async (payload: {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  confirmAdult: boolean;
}) => request("/creators/signup", payload);

export const creatorLogin = async (payload: {
  email: string;
  password: string;
}) => request("/creators/login", payload);
