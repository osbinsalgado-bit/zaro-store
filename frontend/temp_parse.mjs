import fs from "fs";
import parser from "@babel/parser";
const code = fs.readFileSync("src/pages/ProfilePage.jsx","utf8");
try {
  parser.parse(code, { sourceType: "module", plugins: ["jsx"] });
  console.log("PARSE_OK");
} catch (e) {
  console.error("PARSE_ERROR");
  console.error(e.message);
  if (e.loc) console.error("line", e.loc.line, "column", e.loc.column);
  process.exit(1);
}
