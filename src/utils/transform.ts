import type { UploadedModelCamelCase } from "~/types";

// utils/transform.ts
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function transformObjectKeys(
  obj: any,
  transformFn: (key: string) => string
): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformObjectKeys(item, transformFn));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transformFn(key);
      acc[newKey] = transformObjectKeys(obj[key], transformFn);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Convert backend response (snake_case) to frontend format (camelCase)
export function backendToFrontendModel(model: any): UploadedModelCamelCase {
  return transformObjectKeys(model, snakeToCamelCase);
}

// Convert frontend data (camelCase) to backend format (snake_case)
export function frontendToBackendModel(model: any): any {
  return transformObjectKeys(model, camelToSnakeCase);
}