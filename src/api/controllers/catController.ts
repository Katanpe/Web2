import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import {Cat, PostCat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (
  req: Request<{id: number}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_get validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const cat = await getCat(req.params.id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, PostCat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  console.log(req.file);
  if (req.file === undefined) {
    const errorMessage = 'File is missing.';
    console.log('cat_post validation', errorMessage);
    return;
  }

  const body = req.body;
  const {lat, long} = res.locals.coords;
  const user_id = (req.user as User).user_id;
  const user_name = (req.user as User).user_name;
  const filename = req.file.filename;

  try {
    const catId = await addCat({
      ...body,
      filename,
      lat,
      long,
      owner: {user_id, user_name},
    });
    const message: MessageResponse = {
      message: 'Cat added',
      id: catId,
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const cat = req.body;
    const result = await updateCat(
      cat,
      id,
      (req.user as User).user_id,
      (req.user as User).role
    );
    if (result) {
      const message: MessageResponse = {
        message: 'cat updated',
        id,
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteCat((req.body as Cat).cat_id);
    if (result) {
      res.json({
        message: 'cat deleted',
      });
    }
  } catch (error) {
    next(error);
  }
};
// catDelete should use validationResult to validate req.params.id

export {catListGet, catGet, catPost, catPut, catDelete};
