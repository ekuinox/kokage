import { nanoid } from 'nanoid';

export const createState = (length: number) => {
  return nanoid(length);
};
