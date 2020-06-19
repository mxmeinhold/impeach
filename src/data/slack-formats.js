module.exports = {
  message_header: {
    type: 'section',
    text: {
      type: 'plain_text',
      text: "Hello :eboard:\nHere's a new Eboard Eval.",
      emoji: true,
    },
  },
  content_block: (title, content) => {
    return !content
      ? []
      : [
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${title}*`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: content,
            },
          },
        ];
  },
};
