"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MasterTreeNode } from "@/lib/types";

type LineageGraphProps = {
  tree: MasterTreeNode;
};

const gapX = 260;
const gapY = 120;

type LineageNodeData = {
  id: number;
  label: string;
  overview: string;
};

function LineageNode({ data }: NodeProps<Node<LineageNodeData, "lineage">>) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2"
        style={{ backgroundColor: "var(--primary)" }}
      />
      <div
        className="rounded border px-3 py-2 text-left text-[var(--ink)]"
        style={{
          backgroundColor: "var(--canvas)",
          borderColor: "var(--hairline)",
          borderWidth: 1,
          borderRadius: 8,
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2"
        style={{ backgroundColor: "var(--primary)" }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  lineage: LineageNode,
};

function flattenTree(
  root: MasterTreeNode,
) {
  const levels: MasterTreeNode[][] = [];
  const nodes: Node<LineageNodeData>[] = [];
  const edges: Edge[] = [];

  const walk = (node: MasterTreeNode, depth: number, parentId?: number) => {
    if (!levels[depth]) {
      levels[depth] = [];
    }
    const index = levels[depth].length;
    levels[depth].push(node);

    nodes.push({
      id: String(node.master.id),
      position: { x: depth * gapX, y: index * gapY },
      type: "lineage",
      data: {
        id: node.master.id,
        label: `${node.master.name ?? "Unknown"} ${node.master.nameNative ?? ""}`.trim(),
        overview: node.master.overview ?? "",
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.master.id}`,
        source: String(parentId),
        target: String(node.master.id),
        type: "smoothstep",
        animated: false,
        style: { stroke: "var(--primary-line)", strokeWidth: 1.75 },
      });
    }

    for (const child of node.children) {
      walk(child, depth + 1, node.master.id);
    }
  };

  walk(root, 0);
  return { nodes, edges };
}

export function LineageGraph({ tree }: LineageGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [viewport, setViewport] = useState({ x: 40, y: 140, zoom: 1 });
  const [hovercard, setHovercard] = useState<{
    node: LineageNodeData;
    flowX: number;
    flowY: number;
  } | null>(null);
  const { nodes, edges } = useMemo(() => flattenTree(tree), [tree]);
  const router = useRouter();
  const hovercardScreenPosition = hovercard
    ? {
        x: hovercard.flowX * viewport.zoom + viewport.x + 14,
        y: hovercard.flowY * viewport.zoom + viewport.y + 18,
      }
    : null;

  return (
    <div className="relative h-[calc(100vh-57px)] w-full bg-[var(--canvas)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ style: { stroke: "var(--primary-line)", strokeWidth: 1.75 } }}
        defaultViewport={{ x: 40, y: 140, zoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        onMove={(_, nextViewport) => setViewport(nextViewport)}
        onNodeClick={(event, node) => {
          const nextSelected = selectedNodeId === node.data.id ? null : node.data.id;
          setSelectedNodeId(nextSelected);
          if (!nextSelected) {
            setHovercard(null);
            return;
          }

          setHovercard({
            node: node.data,
            flowX: node.position.x,
            flowY: node.position.y,
          });
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setHovercard(null);
        }}
      >
        <Controls />
      </ReactFlow>
      {hovercard && hovercardScreenPosition ? (
        <button
          type="button"
          className="absolute z-30 w-80 rounded-md border bg-[var(--canvas)] p-3 text-left"
          style={{
            borderColor: "var(--primary-disabled)",
            left: `${hovercardScreenPosition.x}px`,
            top: `${hovercardScreenPosition.y}px`,
          }}
          onClick={() => router.push(`/masters/${hovercard.node.id}`)}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            Open Master Page
          </p>
          <p className="line-clamp-4 text-sm text-[var(--body)]">
            {hovercard.node.overview || "No overview available for this master yet."}
          </p>
        </button>
      ) : null}
    </div>
  );
}
