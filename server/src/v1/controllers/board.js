const Board = require('../models/board');
const Section = require('../models/section');
const Task = require('../models/task');

exports.create = async (req, res) => {
  try {
    const boardsCount = await Board.find().count();
    const board = await Board.create({
      user: req.user._id,
      position: boardsCount > 0 ? boardsCount : 0
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create board', details: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user._id }).sort('-position');
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve boards', details: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  const { boards } = req.body;
  try {
    for (const key in boards.reverse()) {
      const board = boards[key];
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      );
    }
    res.status(200).json('Boards position updated');
  } catch (err) {
    res.status(500).json({ error: 'Failed to update boards position', details: err.message });
  }
};

exports.getOne = async (req, res) => {
  const { boardId } = req.params;
  try {
    const board = await Board.findOne({ user: req.user._id, _id: boardId });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const sections = await Section.find({ board: boardId });
    for (const section of sections) {
      const tasks = await Task.find({ section: section.id }).populate('section').sort('-position');
      section._doc.tasks = tasks;
    }
    board._doc.sections = sections;
    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve board details', details: err.message });
  }
};

exports.update = async (req, res) => {
  const { boardId } = req.params;
  const { title, description, bookmark } = req.body;

  try {
    if (title === '') req.body.title = 'Untitled';
    if (description === '') req.body.description = 'Add description here';
    const currentBoard = await Board.findById(boardId);
    if (!currentBoard) return res.status(404).json({ error: 'Board not found' });

    if (bookmark !== undefined && currentBoard.bookmark !== bookmark) {
      const bookmarks = await Board.find({
        user: currentBoard.user,
        bookmark: true,
        _id: { $ne: boardId }
      }).sort('bookmarkPosition');
      if (bookmark) {
        req.body.bookmarkPosition = bookmarks.length > 0 ? bookmarks.length : 0;
      } else {
        for (const key in bookmarks) {
          const element = bookmarks[key];
          await Board.findByIdAndUpdate(
            element.id,
            { $set: { bookmarkPosition: key } }
          );
        }
      }
    }

    const board = await Board.findByIdAndUpdate(
      boardId,
      { $set: req.body }
    );
    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update board', details: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Board.find({
      user: req.user._id,
      bookmark: true
    }).sort('-bookmarkPosition');
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookmarks', details: err.message });
  }
};

exports.updateBookmarkPosition = async (req, res) => {
  const { boards } = req.body;
  try {
    for (const key in boards.reverse()) {
      const board = boards[key];
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { bookmarkPosition: key } }
      );
    }
    res.status(200).json('Bookmark positions updated');
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bookmark positions', details: err.message });
  }
};

exports.delete = async (req, res) => {
  const { boardId } = req.params;
  try {
    const sections = await Section.find({ board: boardId });
    for (const section of sections) {
      await Task.deleteMany({ section: section.id });
    }
    await Section.deleteMany({ board: boardId });

    const currentBoard = await Board.findById(boardId);

    if (currentBoard.bookmark) {
      const bookmarks = await Board.find({
        user: currentBoard.user,
        bookmark: true,
        _id: { $ne: boardId }
      }).sort('bookmarkPosition');

      for (const key in bookmarks) {
        const element = bookmarks[key];
        await Board.findByIdAndUpdate(
          element.id,
          { $set: { bookmarkPosition: key } }
        );
      }
    }

    await Board.deleteOne({ _id: boardId });

    const boards = await Board.find().sort('position');
    for (const key in boards) {
      const board = boards[key];
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      );
    }

    res.status(200).json('Board deleted');
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete board', details: err.message });
  }
};
