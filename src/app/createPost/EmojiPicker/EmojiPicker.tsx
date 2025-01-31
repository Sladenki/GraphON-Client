import React from 'react';

// @ts-expect-error 123

const EmojiPicker = ({ onEmojiClick }) => {
  // Список доступных эмодзи
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '👻'];

  return (
    <div style={{
      position: 'absolute',
      top: '40px',
      left: '0',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '5px',
      display: 'flex',
      gap: '5px',
      zIndex: 1
    }}>
      {emojis.map((emoji) => (
        <span
          key={emoji}
          style={{ cursor: 'pointer', fontSize: '20px' }}
          onClick={() => onEmojiClick(emoji)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default EmojiPicker;
