import {existsSync} from "node:fs";
import {mkdir, readFile, writeFile} from "fs/promises";
import {IUser} from "../IUser";

const path = './src/data/data.json';
const fileExists = () => {
  try {
    return existsSync(path);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const createDatabase = async () => {
  if (!fileExists()) {
    await mkdir('./src/data', {recursive: true});
    await writeFile(path, JSON.stringify([]));
  } else {
    console.log('database already exists!');
  }
}

export const fileRead = async () => {
  return await readFile(path, 'utf-8');
}

export const fileWrite = async (res: any, data: IUser[], sender: any) => {
  const jsonData = JSON.stringify(data, null, 2);
  try {
    await writeFile(path, jsonData);
    sender(res, 201, data)
  } catch (err) {
    sender(res, 500, {message: 'Server internal error'})
  }
}

export const sendResponse = (res: any, status: number, data: any) => {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(data, null, 2));
}

export const validateUser = async (newUser: IUser, db: IUser[]) => {
  return db.find((user) => user.username === newUser.username);
}

export const getUserIdx = async (userId: string, db: IUser[]) => {
  return db.findIndex(user => user.id === userId)
}

export const getDB = async () => {
  try {
    return JSON.parse(await fileRead());
  } catch (err: any) {
    console.error(err.message)
  }
}