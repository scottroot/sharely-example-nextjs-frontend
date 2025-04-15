"use client";
import { BasicNvlWrapper } from '@neo4j-nvl/react'
import ForceGraph2D from 'react-force-graph-2d';
import {GraphData} from "force-graph";
import {Relationship} from "@neo4j-nvl/base";


export default function Visualize({ data }: { data: any }) {

  return (
    <div className="w-full relative" style={{width: 768, height: 512}}>
      {/*<pre>{JSON.stringify({nodes: data.nodes, rels: data.rels}, null, 2)}</pre>*/}
      <ForceGraph2D
        graphData={{nodes: data.nodes, links: data.rels}}
        width={768}
        height={512}
        backgroundColor="#ddd"
        nodeLabel={(node) => node.properties.name}
        // nodeCanvasObject={(node, ctx, globalScale) => {
        //   const label = node.properties.name as string;
        //   const fontSize = 12 / globalScale;
        //   ctx.font = `${fontSize}px Sans-Serif`;
        //   ctx.fillStyle = 'black';
        //   ctx.textAlign = 'center';
        //   ctx.textBaseline = 'middle';
        //   ctx.fillText(label, node.x!, node.y!);
        // }}
        // nodePointerAreaPaint={(node, color, ctx) => {
        //   const label = node.properties.name as string;
        //   ctx.font = '12px Sans-Serif';
        //   const textWidth = ctx.measureText(label).width;
        //   const textHeight = 12;
        //
        //   ctx.fillStyle = color;
        //   ctx.fillRect(
        //     node.x! - textWidth / 2,
        //     node.y! - textHeight / 2,
        //     textWidth,
        //     textHeight,
        //   )
        // }}
        />
    </div>
  );
}
