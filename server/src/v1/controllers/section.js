const Section = require('../models/section');
const Task = require('../models/task');

exports.create = async (req, res) => {
  const { boardId } = req.params;
  try {
    const section = await Section.create({ board: boardId });
    if (!section) {
      return res.status(404).json({ error: 'Failed to create section' });
    }
    section._doc.tasks = [];
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  const { sectionId } = req.params;
  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $set: req.body },
      { new: true } // Returns the updated document
    );
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    section._doc.tasks = [];
    res.status(200).json(section);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.delete = async (req, res) => {
  const { sectionId } = req.params;
  try {
    const tasksDeleted = await Task.deleteMany({ section: sectionId });
    if (!tasksDeleted) {
      return res.status(404).json({ error: 'No tasks found for deletion' });
    }
    const sectionDeleted = await Section.deleteOne({ _id: sectionId });
    if (!sectionDeleted) {
      return res.status(404).json({ error: 'Section not found for deletion' });
    }
    res.status(200).json('Section and associated tasks deleted successfully');
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
