const eboard = require('./data/eboard.json');
const mongoose = require('mongoose');
const { message_header, content_block } = require('./data/slack-formats.js');

const model_prefix = process.env.IS_PROD === 'production' ? '' : 'dev-';

// Define and connect to database
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  const evalSchema = mongoose.Schema({
    name: String,
    eboard: [String],
    likes: String,
    dislikes: String,
    comments: String,
    date: Date,
  });
  const parseEboard = (dir) => eboard[dir] || dir;
  evalSchema.methods.pretty_print = function () {
    return `Evaluation for ${this.eboard.map(parseEboard).join(', ')}:
Likes: ${this.likes}
Dislikes: ${this.dislikes}
Comments: ${this.comments}
${this.name ? `From: ${this.name}` : ''}
${this.date ? this.date : ''}`;
  };
  evalSchema.methods.block_format = function () {
    return {
      blocks: [message_header],
      attachments: [
        {
          color: '#b0197e',
          blocks: [
            ...content_block(
              'Directorships',
              this.eboard.map(parseEboard).join(', ')
            ),
            ...content_block('Likes', this.likes),
            ...content_block('Dislikes', this.dislikes),
            ...content_block('Comments', this.comments),
            ...content_block('From:', this.name),
            ...content_block('Timestamp:', this.date),
          ],
        },
      ],
    };
  };

  Open = mongoose.model(`${model_prefix}Open`, evalSchema);
  Archive = mongoose.model(`${model_prefix}Archive`, evalSchema);
});

module.exports = db;
