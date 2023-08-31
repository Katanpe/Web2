import {RowDataPacket} from 'mysql2';

interface User {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

interface GetUser extends RowDataPacket, User {}

type PostUser = Omit<User, 'user_id'>;

type PutUser = Partial<Omit<User, 'user_id'>>;

export {User, GetUser, PostUser, PutUser};
