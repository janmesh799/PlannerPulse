// File path: /path/to/your/controller/getNotes.ts

const mongoose = require("mongoose");
import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import Note, { INote } from "../../Model/Note";
import User, { IUser } from "../../Model/User";
import { decryptData } from "../../utils/encryption";
import Tag, { ITag } from "../../Model/Tag";

const getNotes = async (req: Request, res: Response) => {
  let errorCode: number | null = null;
  try {
    const date = req.headers.date as string | null;
    const priority = req.headers.priority as string | null;
    const status = req.headers.status as string | null;

    const userId: string =
      typeof req.headers.userId === "string" ? req.headers.userId : "";
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      errorCode = 403;
      throw new Error("User not valid");
    }

    const filter: any = {
      $or: [
        { owner: user._id },
        {
          sharedWith: {
            $in: [user._id],
          },
        },
      ],
    };
    if (date) {
      const parsedDate = new Date(date);
      filter.createdOn = {
        $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
      };
    }
    if (priority) {
      filter.priority = priority;
    }
    if (status) {
      filter.status = status;
    }

    let notes: INote[] = await Note.find(filter);

    // Resolve all promises in updatedNotes
    let updatedNotes = await Promise.all(
      notes.map(async (note) => {
        note.content = decryptData(note.content);
        note.title = decryptData(note.title);
        const tag: ITag | null = await Tag.findById(note.tag);

        if (tag) {
          note.tag = tag;
        }
        return note;
      })
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      data: updatedNotes,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(errorCode ? errorCode : StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: err.message,
        errors: getReasonPhrase(errorCode ? errorCode : 500),
      });
  }
};

export default getNotes;
