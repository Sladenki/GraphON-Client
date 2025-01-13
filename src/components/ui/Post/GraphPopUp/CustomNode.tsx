import { Handle, Position } from "@xyflow/react";

interface NodeProps {
    id: string;
    data: { label: string };
    selected: boolean;
}

const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const radius = 50; // Радиус круга
    const strokeWidth = selected ? 3 : 1;
    const strokeColor = selected ? 'blue' : 'black';

    return (
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
            <svg width={radius * 2} height={radius * 2}>
                <circle
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth/2}
                    fill="white"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
                <text
                    x={radius}
                    y={radius}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="14"
                    fill="black"
                >
                    {data.label}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} id="a" />
            <Handle type="source" position={Position.Bottom} id="b" />
            <Handle type="source" position={Position.Left} id="c" />
            <Handle type="source" position={Position.Right} id="d" />
        </div>
    );
};

export default CustomNode;