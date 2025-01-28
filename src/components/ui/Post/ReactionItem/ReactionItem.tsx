import React from 'react'
import styles from './ReactionItem.module.scss'

interface ReactionItemProps {
    reaction: any;
    isReacted: boolean;
    onClick: (reactionId: string, postId: string) => void;
}

const ReactionItem: React.FC<ReactionItemProps> = ({ reaction, isReacted, onClick }) => {
  return (
    <div
      className={styles.reactionBlock}
      onClick={() => onClick(reaction._id, reaction.postId)}
    >
      <span style={{ color: isReacted ? '#D8BFD8' : 'inherit' }}>
        {isReacted ? 'оп' : 'не-оп'} {reaction.emoji}
      </span>
      <span>{reaction.clickNum}</span>
      <span>{reaction.text}</span>
    </div>
  )
}

export default ReactionItem