import { URL } from "url";
import FormData from "form-data";
import axios, { AxiosResponse } from "axios";
import cookie from "cookie";

export interface LoginResult {
  key: string;
  name: string;
  timestamp: string;
}

// TODO detect redirect to login pages when set-cookie overrides our current cookie
export const isLoginPage = (response: AxiosResponse) => false;

export const login = async (courseURL: URL, username: string, password: string): Promise<LoginResult> => {
  const formData = new FormData();

  formData.append("user", username);
  formData.append("passwd", password);

  const response = await axios.post(courseURL.href, formData, {
    headers: formData.getHeaders()
  });

  const responseCookie = cookie.parse(response.headers["set-cookie"][0]);

  const keyCandidates = Object.entries(responseCookie)
    .filter(([name, _]) => /^WeBWorKCourseAuthen.+$/.test(name))
    .map(x => x[1]);
  if (keyCandidates.length === 0) {
    throw new Error("No user key candidates found in response");
  }

  const [name, key, timestamp] = keyCandidates[0].split("\t");

  if (!name || !key || !timestamp) {
    throw new Error("Improperly formatted cookie");
  }

  return {
    name,
    key,
    timestamp
  };
};
