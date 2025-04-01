"use client";
// import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";
//
// const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false });

export default function Visualize({ data }: { data: any }) {
  return (
    <div style={{ height: '100vh' }}>
      {/*<ForceGraph2D*/}
      {/*  graphData={data}*/}
      {/*  nodeLabel="label"*/}
      {/*  nodeAutoColorBy="label"*/}
      {/*  linkDirectionalArrowLength={4}*/}
      {/*  linkDirectionalArrowRelPos={1}*/}
      {/*/>*/}
    </div>
  );
}
