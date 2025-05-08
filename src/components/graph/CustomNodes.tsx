import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import styles from './CustomNodes.module.scss';

const BaseNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const { label, isParent, hasChildren } = data;
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {hasChildren && <span className={styles.expandIcon}>+</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const ParentNode = memo(({ data, selected }: NodeProps) => (
  <div className={`${styles.parentNode} ${selected ? styles.selected : ''}`}>
    <BaseNode data={data} selected={selected} />
  </div>
));

export const IntermediateNode = memo(({ data, selected }: NodeProps) => (
  <div className={`${styles.intermediateNode} ${selected ? styles.selected : ''}`}>
    <BaseNode data={data} selected={selected} />
  </div>
));

export const ChildNode = memo(({ data, selected }: NodeProps) => (
  <div className={`${styles.childNode} ${selected ? styles.selected : ''}`}>
    <BaseNode data={data} selected={selected} />
  </div>
)); 