const Task = require('../models/task');
const Section = require('../models/section');

exports.create = async (req, res) => {
  const { sectionId } = req.body;
  try {
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const tasksCount = await Task.find({ section: sectionId }).count();
    const task = await Task.create({
      section: sectionId,
      position: tasksCount > 0 ? tasksCount : 0
    });
    task._doc.section = section;
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: req.body },
      { new: true } // Returns the updated document
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.delete = async (req, res) => {
  const { taskId } = req.params;
  try {
    const currentTask = await Task.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.deleteOne({ _id: taskId });
    const tasks = await Task.find({ section: currentTask.section }).sort('position');
    for (const [index, task] of tasks.entries()) {
      await Task.findByIdAndUpdate(
        task.id,
        { $set: { position: index } }
      );
    }
    res.status(200).json('Task deleted successfully');
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  const {
    resourceList,
    destinationList,
    resourceSectionId,
    destinationSectionId
  } = req.body;
  const resourceListReverse = resourceList.reverse();
  const destinationListReverse = destinationList.reverse();
  try {
    // Additional validation if resource and destination sections are not equal
    if (resourceSectionId !== destinationSectionId) {
      // Updating tasks from resource section to destination section
      for (const [index, resourceTask] of resourceListReverse.entries()) {
        await Task.findByIdAndUpdate(
          resourceTask.id,
          {
            $set: {
              section: destinationSectionId,
              position: index
            }
          }
        );
      }
    }
    // Updating tasks within the destination section
    for (const [index, destinationTask] of destinationListReverse.entries()) {
      await Task.findByIdAndUpdate(
        destinationTask.id,
        {
          $set: {
            section: destinationSectionId,
            position: index
          }
        }
      );
    }
    res.status(200).json('Tasks updated successfully');
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
