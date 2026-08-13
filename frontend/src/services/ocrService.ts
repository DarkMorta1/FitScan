import axios from "axios";

export interface OCRResult {
  available: boolean;
  text: string;
  items: string[];
  confidence: number;
}

export async function extractMenuText(file: File): Promise<OCRResult> {
  try {

    const formData = new FormData();

    formData.append("image", file);

    const response = await axios.post(
      "http://localhost:5000/api/scan/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = response.data;

    if (!data.detected) {
      return {
        available: false,
        text: "",
        items: [],
        confidence: 0,
      };
    }

    return {
      available: true,
      text: data.scan.detectedFoodName,
      items: [data.scan.detectedFoodName],
      confidence: data.scan.confidence,
    };

  } catch (error) {

    console.error(error);

    return {
      available: false,
      text: "",
      items: [],
      confidence: 0,
    };

  }
}

export function parseMenuItems(text: string): string[] {
  return text
    .split(/[\n,;|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}