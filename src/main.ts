import dotenv from "dotenv";
import http from "http";
import {getUsers, addUser, notFound, getUserById, updateUser, deleteUser} from "./controller";
import {createDatabase} from './helpers/fileHelper';
import { cpus } from "node:os";
import cluster from "node:cluster";

dotenv.config({ path: __dirname+'/.env'});
const PORT = process.env.PORT || 6000;
const MULTI = process.env.MULTI;

const db = async () => {
  await createDatabase();
}

db().then(() => {
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

  if (MULTI === 'true') {
    if (cluster.isPrimary) {
      for (let i = 0; i < cpus().length; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code) => {
        console.log(`Worker ${worker.id} finish work. Exit with code: ${code}`);
        server.listen(process.env.PORT, () => console.log(`Worker ${cluster.worker?.id} started`));
      });
    } else {
      server.listen(process.env.PORT, () => console.log(`Worker ${cluster.worker?.id} started`));
    }
  } else {
    server.listen(process.env.PORT, () => console.log(`Server is running on port ${PORT}`));
  }
});





