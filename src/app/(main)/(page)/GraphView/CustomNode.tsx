import React, { useState } from 'react';

export interface CustomNodeProps {
  nodeDatum: any;
  toggleNode: () => void;
  isSelected: boolean;
  theme?: 'light' | 'dark';
}

export const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  isSelected,
  theme = 'light',
}) => {
  const [hover, setHover] = useState(false);
  const isParent = !!nodeDatum.children;
  const isCollapsed = nodeDatum.__rd3t?.collapsed;

  // Цвета из CSS-переменных
  const bg = isParent
    ? 'var(--block-color, #fffbe6)'
    : 'var(--background-color, #e3f2fd)';
  const border = isSelected
    ? 'var(--main-Color, #673ab7)'
    : isParent
    ? 'var(--parent-node, #ffb300)'
    : 'var(--child-node, #1976d2)';
  const shadow = 'rgba(80,80,120,0.10)';

  // Размеры
  const maxTextWidth = 160;
  const rectWidth = 180;
  const rectHeight = 70;
  const tooltipHeight = 32;
  const tooltipPadding = 10;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Новый аккуратный tooltip */}
      {hover && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={-maxTextWidth / 2 - tooltipPadding}
            y={-rectHeight / 2 - tooltipHeight - 8}
            width={maxTextWidth + tooltipPadding * 2}
            height={tooltipHeight}
            rx={8}
            fill="rgba(40,40,40,0.96)"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))', transition: 'opacity 0.2s' }}
          />
          <text
            x={0}
            y={-rectHeight / 2 - tooltipHeight / 2 - 2}
            textAnchor="middle"
            fontSize={15}
            fill="#fff"
            style={{ pointerEvents: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}
          >
            {nodeDatum.name}
          </text>
        </g>
      )}
      <rect
        x={-rectWidth / 2}
        y={-rectHeight / 2}
        width={rectWidth}
        height={rectHeight}
        rx={18}
        fill={bg}
        stroke={border}
        strokeWidth={isSelected ? 4 : 2}
        style={{
          filter: `drop-shadow(0 2px 8px ${shadow})`,
          transition: 'stroke 0.2s, fill 0.2s',
        }}
      />
      <foreignObject
        x={-maxTextWidth / 2}
        y={-16}
        width={maxTextWidth}
        height={32}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: maxTextWidth,
            fontFamily: 'Roboto, sans-serif',
            fontSize: 18,
            color: 'var(--main-text, #222)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            userSelect: 'none',
          }}
          title={nodeDatum.name}
        >
          {nodeDatum.name}
        </div>
      </foreignObject>
      {isParent && (
        <g onClick={e => { e.stopPropagation(); toggleNode(); }} style={{ cursor: 'pointer' }}>
          <circle
            cx={rectWidth / 2 - 20}
            cy={-rectHeight / 2 + 20}
            r={14}
            fill={isCollapsed ? '#fff' : 'var(--parent-node, #ffb300)'}
            stroke="#888"
            strokeWidth={1}
          />
          <text
            x={rectWidth / 2 - 20}
            y={-rectHeight / 2 + 25}
            textAnchor="middle"
            fontSize={20}
            fontWeight={700}
            fill="#333"
            pointerEvents="none"
          >
            {isCollapsed ? '+' : '-'}
          </text>
        </g>
      )}
    </g>
  );
}; 