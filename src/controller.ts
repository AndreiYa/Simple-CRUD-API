import {IncomingMessage, ServerResponse} from "http";
import {fileWrite, getDB, getUserIdx, sendResponse, validateReq, validateUser} from './helpers/fileHelper';
import {IUser} from "./IUser";
import {v4 as uuidv4} from 'uuid';

export const getUsers = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const data = await getDB();
    sendResponse(res, 200, data);
  } catch {
    sendResponse(res, 500, {message: 'Internal server error'});
  }
}

export const getUserById = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const id = req.url?.split("/")[3];
    const db = await getDB();
    const user = db.find((user: { id: string | undefined; }) => user.id === id)
    if (!user) {
      sendResponse(res, 404, {message: 'user not found'})
    }
    sendResponse(res, 200, user);
  } catch {
    sendResponse(res, 500, {message: 'Internal server error'});
  }
}

export const addUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk.toString();
    });
    req.on('end', async () => {
      if (!data) {
        sendResponse(res, 400, 'Body can`t be empty')
      }
      let user: IUser = JSON.parse(data);
      if (!await validateUser(user, await getDB())) {
        user.id = uuidv4();
        if (validateReq(user)) {
          const users: IUser[] = [user, ...await getDB()];
          await fileWrite(res, users, sendResponse);
        } else {
          sendResponse(res, 422, {message: 'name, age, hobbies is required'});
        }
      } else {
        sendResponse(res, 422, {message: 'User already exist'});
      }
    })
  } catch {
    sendResponse(res, 500, {message: 'Internal server error'});
  }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk.toString();
    });
    req.on('end', async () => {
      if (!data) {
        sendResponse(res, 400, 'Body can`t be empty')
      }
      let user: IUser = JSON.parse(data);
      const id = req.url?.split("/")[3];
      const userIdx = await getUserIdx(id as string, await getDB());
      if (userIdx === -1) {
        sendResponse(res, 404, 'User not found')
      }
      const db = await getDB();
      db[userIdx] = user;
      await fileWrite(res, db, sendResponse);
    });
  } catch {
    sendResponse(res, 500, {message: 'Internal server error'});
  }
}
export const deleteUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    req.on('end', async () => {
      const id = req.url?.split("/")[3];
      console.log(id)
      const userIdx = await getUserIdx(id as string, await getDB());
      if (!userIdx) {
        sendResponse(res, 404, {message: 'User not found'});
      }
      const db = await getDB();
      db.splice(userIdx, 1);
      await fileWrite(res, db, sendResponse);
    })
  } catch {
    sendResponse(res, 500, {message: 'Internal server error'});
  }
}

export const notFound = async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(404, { "Content-Type": "text/plain" })
  res.write("Url Not Found")
  res.end()
}