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

// Fan authentication APIs
export const fanSignup = async (payload: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
  confirmAdult: boolean;
  creatorHandle: string;  // 追加: どのクリエイターへの登録か
}) => {
  const response = await fetch("/api/fans/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error ?? "登録に失敗しました");
  }

  const result = await response.json();

  // 登録成功後、自動的にログインする
  // Note: この関数はクライアントサイドから呼ばれるため、
  // 呼び出し元でsignInを実行する必要がある
  return { ...result, credentials: { email: payload.email, password: payload.password } };
};

const requestPut = async (path: string, payload: unknown) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
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

// Password change API
export const changePassword = async (payload: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => requestPut("/creators/change-password", payload);

// Profile update API
export const updateProfile = async (payload: {
  userId: string;
  name?: string;
  displayName?: string;
}) => requestPut("/creators/update-profile", payload);

// Credit charge API
export const createChargeRequest = async (payload: {
  creatorId: string;
  amount: number;
}) => request("/payments/charge", payload);

