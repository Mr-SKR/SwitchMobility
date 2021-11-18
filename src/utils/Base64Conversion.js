import {Buffer} from 'buffer';

const base64ToString = base64String => {
  return Buffer.from(base64String, 'base64').toString('ascii');
};

const stringToBase64 = string => {
  return Buffer.from(string).toString('base64');
};

export default {base64ToString, stringToBase64};
