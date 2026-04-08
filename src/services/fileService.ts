import axiosInstance from "./axiosInstance";

interface UploadResponse {
  id: string;
  title: string;
  path: string;
  persistence: string;
  type: string;
  size: number;
  note: string;
  uploaded_by: number;
  uploaded_date: string;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFile(file: File): Promise<string> {
  const base64 = await toBase64(file);

  const response = await axiosInstance.post<UploadResponse>("/files", {
    persistence: "disk",
    title: file.name,
    data: base64,
    type: file.type,
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "https://cfc.bits.com.kw";

  return `${baseURL}/files/${response.data.id}`;
}

export const fileService = { uploadFile };
