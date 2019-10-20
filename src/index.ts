import * as login from "./data/login";
import * as grades from "./data/grades";
import testConfig from "../config/test.json";
import { courseURL } from "./url";

(async () => {
  try {
    const course = courseURL("2019_Fall_Math_331_Berget");
    const loginInfo = await login.login(course, testConfig.username, testConfig.password);
    console.log("Login info: ", loginInfo);
    const gradeInfo = await grades.grades(course, loginInfo);
    console.log("Grade info", gradeInfo);
  } catch (err) {
    console.error(err);
  }
})();
