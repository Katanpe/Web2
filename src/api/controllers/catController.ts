import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import {Cat, PostCat, PutCat} from '../../interfaces/Cat';
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
    console.log('cat_post validation', messages);
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

  try {
    if (req.file === undefined) {
      const errorMessage = 'File is missing.';
      console.log('cat_post validation', errorMessage);
      return;
    }

    const cat_name = req.body.cat_name;
    const weight = req.body.weight;
    const birthdate = req.body.birthdate;
    const lat = res.locals.coords[0];
    const lng = res.locals.coords[1];
    const owner = (req.user as User).user_id;
    const filename = req.file.filename;

    const catId = await addCat({
      cat_name,
      weight,
      owner,
      filename,
      birthdate,
      lat,
      lng,
    });

    const message: MessageResponse = {
      message: 'Cat added',
      id: catId,
    };
    res.json(message);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, PutCat>,
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
  req: Request<{id: number}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req.params);
    if (!errors.isEmpty()) {
      const messages: string = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      console.log('cat_post validation', messages);
      next(new CustomError(messages, 400));
      return;
    }

    const id = req.params.id;
    await deleteCat(id);

    const message: MessageResponse = {
      message: 'cat deleted',
      id: Number(id),
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

export {catListGet, catGet, catPost, catPut, catDelete};
