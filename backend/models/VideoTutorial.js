const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VideoTutorial = sequelize.define('VideoTutorial', {
  judul: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT
  },
  gambar: {
    type: DataTypes.TEXT('long') // thumbnail base64 or url
  },
  video_url: {
    type: DataTypes.TEXT // URL or base64 data for video/file
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = VideoTutorial;
