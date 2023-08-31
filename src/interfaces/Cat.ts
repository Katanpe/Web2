import {RowDataPacket} from 'mysql2';
import {User} from './User';

interface Cat {
  cat_id: number;
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  lat: number;
  long: number;
  owner: {
    user_id: number;
    user_name: string;
  };
}

interface GetCat extends RowDataPacket, Cat {}

type PostCat = Omit<Cat, 'cat_id'>;

type PutCat = Partial<Omit<Cat, 'cat_id'>>;

export {Cat, GetCat, PostCat, PutCat};
