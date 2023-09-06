import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../models/userModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {PostUser, User} from '../../interfaces/User';
import {validationResult} from 'express-validator/src/validation-result';
import MessageResponse from '../../interfaces/MessageResponse';
const salt = bcrypt.genSaltSync(12);

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, PostUser>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const userData = {
      ...req.body,
      password: hashedPassword,
    };

    const userId = await addUser(userData);
    const message: MessageResponse = {
      message: 'User added',
      id: userId,
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{id: number}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const user = req.body;

    const result = await updateUser(user, req.params.id);
    if (result) {
      res.json({
        message: 'user modified',
      });
    }
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{id: number}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.params);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_putCurrent validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const userId = (req.user as User).user_id;
    const user = req.body;
    const result = await updateUser(user, userId);
    if (result) {
      res.json({
        message: 'user modified',
      });
    }
  } catch (error) {
    next(error);
  }
};

const userDelete = async (
  req: Request<{id: number}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.params);

  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_delete validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const userId = req.params.id;
    const result = await deleteUser(userId);

    if (result) {
      res.json({
        message: 'user deleted',
      });
    }
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteUser((req.user as User).user_id);
    if (result) {
      res.json({
        message: 'user deleted',
      });
    }
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json(req.user);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken,
};
