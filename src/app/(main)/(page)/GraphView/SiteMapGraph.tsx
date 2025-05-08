import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { buildTreeData } from '@/utils/graphToTree';

const COLORS = [
  '#1a237e', // темно-синий
  '#1976d2', // голубой
  '#ffb300', // желтый
  '#ff7043', // оранжевый
  '#26c6da', // бирюзовый
  '#f7f7fa', // фон
  '#fff',    // белый
];

const MAIN_CIRCLE_RADIUS = 70;
const SUB_CIRCLE_RADIUS = 50;
const LEAF_CIRCLE_RADIUS = 36;

function getNodeColor(depth: number, index: number) {
  if (depth === 0) return COLORS[0];
  if (depth === 1) return COLORS[1 + (index % 3)];
  if (depth === 2) return COLORS[2 + (index % 3)];
  return COLORS[5];
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxLen) {
      lines.push(line.trim());
      line = word;
    } else {
      line += ' ' + word;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

export default function SiteMapGraph({ searchQuery }: { searchQuery: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Получаем данные
  const { data: allGraphs, isPending, isError } = useQuery({
    queryKey: ['childrenGraphs', '67a499dd08ac3c0df94d6ab7'],
    queryFn: () => GraphService.getAllChildrenGraphs('67a499dd08ac3c0df94d6ab7'),
    enabled: true,
  });

  // Формируем дерево
  const treeData = React.useMemo(() => {
    if (!allGraphs) return null;
    let filtered = allGraphs.data;
    if (searchQuery) {
      filtered = filtered.filter((g: any) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return buildTreeData(
      { _id: '67a499dd08ac3c0df94d6ab7', name: 'HOME' },
      filtered
    );
  }, [allGraphs, searchQuery]);

  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    const width = 1400;
    const height = 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Zoom & Pan
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
          svg.select('g.main').attr('transform', event.transform);
        })
    );

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree()
      .size([width, height - 100])
      .separation((a, b) => {
        if (!a.children && !b.children) return 3.5;
        if (!a.children || !b.children) return 2.5;
        return 2.2;
      });
    treeLayout(root);

    // Main group for pan/zoom
    const mainG = svg.append('g').attr('class', 'main');

    // Draw links
    mainG
      .append('g')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', (d: any) =>
        d3.linkVertical()
          .x((d: any) => d.x)
          .y((d: any) => d.y)(d) as string
      )
      .attr('fill', 'none')
      .attr('stroke', '#222')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Draw nodes
    const node = mainG
      .append('g')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Hover/active state
    node
      .append('circle')
      .attr('r', (d: any) =>
        d.depth === 0 ? MAIN_CIRCLE_RADIUS :
        d.children ? SUB_CIRCLE_RADIUS : LEAF_CIRCLE_RADIUS
      )
      .attr('fill', (d: any, i: number) => getNodeColor(d.depth, i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 5)
      .attr('filter', 'drop-shadow(0 2px 8px rgba(80,80,120,0.08))')
      .on('mouseover', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r',
            d.depth === 0 ? MAIN_CIRCLE_RADIUS + 10 :
            d.children ? SUB_CIRCLE_RADIUS + 9 : LEAF_CIRCLE_RADIUS + 8
          )
          .attr('filter', 'drop-shadow(0 4px 16px rgba(80,80,120,0.18))');
        // Tooltip если текст длинный
        const lines = wrapText(d.data.name, d.depth === 0 ? 18 : 15);
        if (lines.length > 2 || d.data.name.length > 18) {
          setTooltip({ x: d.x, y: d.y - 90, text: d.data.name });
        }
      })
      .on('mouseout', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r',
            d.depth === 0 ? MAIN_CIRCLE_RADIUS :
            d.children ? SUB_CIRCLE_RADIUS : LEAF_CIRCLE_RADIUS
          )
          .attr('filter', 'drop-shadow(0 2px 8px rgba(80,80,120,0.08))');
        setTooltip(null);
      });

    // Многострочный текст
    node.each(function (d: any) {
      const lines = wrapText(d.data.name, d.depth === 0 ? 18 : 15);
      const fontSize = d.depth === 0 ? 28 : d.children ? 20 : 17;
      lines.forEach((line, i) => {
        d3.select(this)
          .append('text')
          .text(line)
          .attr('text-anchor', 'middle')
          .attr('y', 8 + i * (fontSize + 2) - (lines.length - 1) * (fontSize / 2))
          .attr('font-size', fontSize)
          .attr('font-weight', d.depth === 0 ? 700 : 500)
          .attr('fill', '#fff')
          .attr('font-family', 'Roboto, sans-serif')
          .attr('pointer-events', 'none');
      });
    });
  }, [treeData]);

  if (isPending) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка загрузки</div>;
  if (!treeData) return <div>Нет данных</div>;

  return (
    <div style={{ width: '100%', overflow: 'auto', background: '#f7f7fa', borderRadius: 24, position: 'relative' }}>
      <svg
        ref={svgRef}
        width={1400}
        height={800}
        style={{ display: 'block', margin: '0 auto', background: '#f7f7fa' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x - 120 + 700, // центрируем относительно svg
            top: tooltip.y + 400,
            background: 'rgba(40,40,40,0.96)',
            color: '#fff',
            padding: '10px 22px',
            borderRadius: 12,
            fontSize: 18,
            fontFamily: 'Roboto, sans-serif',
            pointerEvents: 'none',
            whiteSpace: 'pre-line',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            zIndex: 10,
            maxWidth: 260,
            textAlign: 'center',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
} 