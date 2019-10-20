import cheerio from "cheerio";
import axios from "axios";
import path from "path";
import { URL } from "url";
import { LoginResult } from "./login";

export interface GradesResult {
  assignments: Array<AssignmentGradeResult>;
}

export interface AssignmentGradeResult {
  name: string;
  score: number;
  possibleScore: number;
  problems: Array<ProblemGradeResult>;
}

export interface ProblemGradeResult {
  grade: "C" | number;
  attempts: number;
}

const gradesURL = (courseURL: URL) => new URL(path.join(courseURL.href, "grades"));

export const grades = async (courseURL: URL, login: LoginResult): Promise<GradesResult> => {
  const url = gradesURL(courseURL);
  const params = {
    user: login.name,
    effectiveUser: login.name,
    key: login.key
  };

  const response = await axios.get(url.href, { params });

  const $ = cheerio.load(response.data);
  const gradeTable = $("#grades_table");
  const rows = gradeTable.find("tr").toArray();

  const dataRows = rows.slice(2);

  return {
    assignments: dataRows.map(row => {
      const [
        {
          children: [
            {
              children: [{ data: name }]
            }
          ]
        },
        ,
        {
          children: [{ data: score }]
        },
        ,
        {
          children: [{ data: possibleScore }]
        },
        ,
        ...problems
      ] = row.childNodes;

      return {
        name: name as string,
        score: Number.parseFloat(score as string),
        possibleScore: Number.parseFloat(possibleScore as string),
        problems: problems
          .filter(x => x.type !== "text")
          .map(td => {
            const [
              {
                children: [{ data: grade }]
              },
              ,
              { data: attempts }
            ] = td.childNodes;
            return {
              grade: grade !== "C" ? Number.parseFloat(grade as string) : (grade as "C"),
              attempts: Number.parseInt(attempts as string)
            };
          })
      };
    })
  };
};
