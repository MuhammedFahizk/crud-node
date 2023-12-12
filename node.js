const http = require("http");
const fs = require("fs");
const url = require("url");
const chokidar = require("chokidar");
const ejs = require("ejs");
const queryString = require("querystring");
const { v4: uuidv4 } = require("uuid");


const formfile = fs.readFileSync("form.html", "utf-8");
const datauser = fs.readFileSync("Data/data.json", "utf-8");
const datahtml = fs.readFileSync("userdata.html", "utf-8");
const indexdata = fs.readFileSync("index.html", "utf-8");

const templatehtml = fs.readFileSync("template.html", "utf-8");
const userjson = JSON.parse(datauser);

let userdata = userjson.map((item) => {
  let output = datahtml.replace("{{%name}}", item.name);
  output = output.replace("{{%age}}", item.age);
  output = output.replace("{{%number}}", item.number);
  output = output.replace("{{%email}}", item.email);
  output = output.replace("{{%id}}", item.id);
  output = output.replace("{{%did}}", item.id);

  return output;
});

let eid = 0;

var server = http
  .createServer((req, res) => {
    try {

      const pathname = url.parse(req.url).pathname;
      let { query, pathname: path } = url.parse(req.url, true);

      if (pathname === "/") {
        fs.readFile("index.html", "utf-8", (err, data) => {
          if (err) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("Error reading the file");
          } else {
            res.writeHead(200, { "content-type": "text/html" });
            let dataadd = data.replace("{{%content}}", userdata.join(","));
            res.write(dataadd);
            res.end();
          }
        });
      } else if (pathname === "/form.html") {
        fs.readFile("form.html", "utf-8", (err, data) => {
          if (err) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("error reading file form page");
            console.log(err);
          } else {
            res.writeHead(200, { "content-type": "text/html" });
            res.write(data);

            res.end();
          }
        });
      } else if (pathname === "/myform" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          const formData = new URLSearchParams(body);
          const name = formData.get("name");
          const age = formData.get("age");
          const number = formData.get("number");
          const email = formData.get("email");
          res.writeHead(200, { "Content-Type": "text/plain" });
          fs.readFile("Data/data.json", "utf-8", (err, datajson) => {
            try {
              let existdata = [];
              existdata = JSON.parse(datajson);
            
              const id = uuidv4();

              const formsubmition = {
                id: id,
                name: name,
                age: age,
                number: number,
                email: email,
              };
              existdata.push(formsubmition);

              fs.writeFile(
                "Data/data.json",
                JSON.stringify(existdata, null, 2),
                "utf-8",
                (err, newdata) => {
                  if (err) {
                    console.error("Error writing data.json:", err);
                  } else {
                    console.log("Data written to data.json successfully");
                    res.end();
                  }
                }
              );
            } catch {
              console.error("Error reading data.json:", err);
            }
          });
          res.writeHead(200, { "content-type": "text/html" });
          res.end(formfile);
        });
      } else if (pathname === "/delete" && req.method === "GET") {
        deletevalu = JSON.parse(datauser);

        deletevalu = deletevalu.filter((a) => a.id != query.id);

        fs.writeFileSync(
          "Data/data.json",
          JSON.stringify(deletevalu, null, 2),
          "utf-8",
          (err1, data1) => {
            if (err1) {
              res.writeHead(500, { "content-type": "text/plain" });
              res.end();
            } else {
            }
            console.log(deletenum);
          }
        );
        fs.readFile("deletesuccess.html", "utf-8", (err, datadelete) => {
          if (err) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end();
          } else {
            res.writeHead(200, { "content-type": "text/html" });
            res.write(datadelete);
            res.end();
          }
        });
      } else if (pathname === "/edit" && req.method === "GET") {
        try {
          res.writeHead(200, { "content-type": "text/html" });
          const editid = query.id;
          let editdata = [];
          editdata = JSON.parse(datauser);
          const edititem = editdata.find((item) => item.id == editid);
          fs.readFile("templatemain.html", "utf-8", (err, jsdata) => {
            fs.readFile("template.html", "utf-8", (err1, htmldata) => {
              htmldata = htmldata.replace("{{%name}}", edititem.name);
              htmldata = htmldata.replace("{{%age}}", edititem.age);
              htmldata = htmldata.replace("{{%number}}", edititem.number);
              htmldata = htmldata.replace("{{%email}}", edititem.email);
              eid = edititem.id;
              let firstdtat = userjson[editid - 1];

              let editpage = jsdata.replace("{{%updata}}", htmldata);

              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(editpage);
            });
          });
        } catch {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          } else {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end();
          }
        }
      } else if (pathname === "/editpage" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          const formData = queryString.parse(body);
          const inputname = formData.name || "";
          const inputage = formData.age || "";
          const inputnumber = formData.number || "";
          const inputemail = formData.email || "";

          let editValue = userjson.find((item) => item.id === eid);

          if (editValue) {
            // Update the values
            editValue.name = inputname;
            editValue.age = inputage;
            editValue.number = inputnumber;
            editValue.email = inputemail;
            // Save the updated data to the JSON file
            fs.writeFile(
              "Data/data.json",
              JSON.stringify(userjson, null, 2),
              "utf-8",
              (err) => {
                if (err) {
                  console.error("Error writing data.json:", err);
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end("Internal Server Error");
                } else {
                  console.log("Data updated in data.json successfully");
                  res.writeHead(200, { "Content-Type": "text/html" });
                  fs.readFile("editsuccess.html", "utf-8", (err, data) => {
                    if (err) {
                      res.writeHead(500, { "content-type": "text/plain" });
                      res.end("Error reading the file");
                    } else {
                      res.writeHead(200, { "content-type": "text/html" });

                      res.end(data);
                    }
                  });
                }
              }
            );
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Data not found for the given ID");
          }
        });
      }
      // ...
      else if (pathname === "/home") {
        fs.readFile("index.html", "utf-8", (err, data) => {
          if (err) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("Error reading the file");
          } else {
            res.writeHead(200, { "content-type": "text/html" });
            let dataadd = data.replace("{{%content}}", userdata.join(","));
            res.write(dataadd);
            res.end();
          }
        });
      } else {
        {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        }
      }
    } catch (err) {
      res.writeHead(400, { "content-type": "text/plain" });
      console.log(err);
      res.end("Bad Request");
    }
  })
  .listen(9000);


