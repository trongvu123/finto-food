import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHmac } from "crypto";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
} 
export function formatDateBlog(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
function sortObjDataByKey(object : any) {
      const orderedObject = Object.keys(object)
        .sort()
        .reduce((obj : any, key) => {
          obj[key] = object[key];
          return obj;
        }, {});
      return orderedObject;
    }

    function convertObjToQueryStr(object : any) {
      return Object.keys(object)
        .filter((key) => object[key] !== undefined)
        .map((key) => {
          let value = object[key];
          // Sort nested object
          if (value && Array.isArray(value)) {
            value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
          }
          // Set empty string if null
          if ([null, undefined, "undefined", "null"].includes(value)) {
            value = "";
          }

          return `${key}=${value}`;
        })
        .join("&");
    }

    export function isValidData(data : any, currentSignature : any, checksumKey : any) {
      const sortedDataByKey = sortObjDataByKey(data);
      const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
      const dataToSignature = createHmac("sha256", checksumKey)
        .update(dataQueryStr)
        .digest("hex");
      return dataToSignature == currentSignature;
    }