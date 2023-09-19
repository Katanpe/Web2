import {RowDataPacket} from 'mysql2';

interface Cat {
  cat_id: number;
  cat_name: string;
  weight: number;
  owner: number;
  filename: string;
  birthdate: Date;
  lat: number;
  lng: number;
}

interface GetCat extends RowDataPacket, Cat {}

type PostCat = Omit<Cat, 'cat_id'>;

type PutCat = Partial<Omit<Cat, 'cat_id'>>;

export {Cat, GetCat, PostCat, PutCat};
