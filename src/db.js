const mongoose = require('mongoose');
const { message_header, content_block } = require('./data/slack-formats.js');
const eboard = require('./data/eboard.json');

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
  });
  const parseEboard = (dir) => eboard[dir] || dir;
  evalSchema.methods.pretty_print = () => {
    return `Evaluation for ${this.eboard.map(parseEboard).join(', ')}:
Likes: ${this.likes}
Dislikes: ${this.dislikes}
Comments: ${this.comments}
${this.name ? `From: ${this.name}` : ''}`;
  };
  evalSchema.methods.block_format = () => {
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
          ],
        },
      ],
    };
  };

  Open = mongoose.model(`${model_prefix}Open`, evalSchema);
  Archive = mongoose.model(`${model_prefix}Archive`, evalSchema);
});

module.exports = db;
