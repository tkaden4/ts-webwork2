import path from "path";
import { URL } from "url";

export const baseURL: URL = new URL("https://mathwebwork.wwu.edu/webwork2/");

export const courseURL = (course: string, base = baseURL) => new URL(path.join(base.href, course));
