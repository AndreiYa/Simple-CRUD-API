import http from "http";
import {getUsers, addUser, notFound, getUserById, updateUser, deleteUser} from "./controller";
import {createDatabase} from './helpers/fileHelper';

createDatabase().then(() => {
  const server = http.createServer((req, res) => {
    if (req.method == "GET" && req.url === "/api/users") {
      return getUsers(req, res);
    } else if (req.method === 'GET' && req.url?.match(/\/api\/users\/(\w+)/)) {
      return getUserById(req, res);
    } else if (req.method == "POST" && req.url == "/api/users") {
      return addUser(req, res);
    } else if (req.method == "PUT" && req.url?.match(/\/api\/users\/(\w+)/)) {
      return updateUser(req, res);
    } else if (req.method == "DELETE" && req.url?.match(/\/api\/users\/(\w+)/)) {
      return deleteUser(req, res);
    } else {
      return notFound(req, res);
    }
  });

  server.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});


