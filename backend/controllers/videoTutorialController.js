const { VideoTutorial } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await VideoTutorial.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await VideoTutorial.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = {
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      gambar: req.body.gambar,
      video_url: req.body.video_url,
      is_published: typeof req.body.is_published === 'boolean' ? req.body.is_published : true
    };
    const created = await VideoTutorial.create(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await VideoTutorial.update(req.body, { where: { id: req.params.id } });
    const updated = await VideoTutorial.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await VideoTutorial.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
