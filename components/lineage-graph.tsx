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
const gapY = 70;
const depthGapX = 340;

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
  const positionById = new Map<number, { x: number; y: number }>();
  const nodes: Node<LineageNodeData>[] = [];
  const edges: Edge[] = [];
  let leafCursor = 0;
  const levelWidths: number[] = [];

  const countLevelWidths = (node: MasterTreeNode, depth: number) => {
    levelWidths[depth] = (levelWidths[depth] ?? 0) + 1;
    for (const child of node.children) {
      countLevelWidths(child, depth + 1);
    }
  };

  // Tidy-tree rule: leaves are evenly spaced; internal nodes are centered over children.
  // This makes branch forks easier to scan and reduces visual crossings.
  const assignPositions = (node: MasterTreeNode, depth: number): number => {
    const x = depth * depthGapX;
    if (!node.children.length) {
      const y = leafCursor * gapY;
      leafCursor += 1;
      positionById.set(node.master.id, { x, y });
      return y;
    }

    const childCenters = node.children.map((child) => assignPositions(child, depth + 1));
    const y = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    positionById.set(node.master.id, { x, y });
    return y;
  };

  const createElements = (node: MasterTreeNode, parentId?: number) => {
    const position = positionById.get(node.master.id) ?? { x: 0, y: 0 };

    nodes.push({
      id: String(node.master.id),
      position,
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
        type: "step",
        animated: false,
        style: { stroke: "var(--primary-line)", strokeWidth: 1.75 },
      });
    }

    for (const child of node.children) {
      createElements(child, node.master.id);
    }
  };

  countLevelWidths(root, 0);
  assignPositions(root, 0);

  // Match legacy D3 behavior: vertical span follows tree breadth (widest level),
  // not total leaves. This avoids giant vertical gaps on sparse/deep branches.
  const maxNodesAtAnyDepth = Math.max(...levelWidths, 1);
  const legacyTargetSpan = Math.max(420, (maxNodesAtAnyDepth - 1) * 140);
  if (leafCursor > 1) {
    const entries = Array.from(positionById.entries());
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const [, position] of entries) {
      if (position.y < minY) minY = position.y;
      if (position.y > maxY) maxY = position.y;
    }
    const span = Math.max(1, maxY - minY);

    if (span > legacyTargetSpan) {
      const scale = legacyTargetSpan / span;
      const midY = (minY + maxY) / 2;

      for (const [nodeId, position] of entries) {
        positionById.set(nodeId, {
          x: position.x,
          y: (position.y - midY) * scale + midY,
        });
      }
    }
  }

  // Normalize around the root so the initial viewport consistently lands on visible nodes.
  const rootPosition = positionById.get(root.master.id);
  if (rootPosition) {
    for (const [nodeId, position] of positionById.entries()) {
      positionById.set(nodeId, {
        x: position.x,
        y: position.y - rootPosition.y,
      });
    }
  }

  createElements(root);
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
        x: hovercard.flowX * viewport.zoom + viewport.x + gapX / 4,
        y: hovercard.flowY * viewport.zoom + viewport.y + 14,
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
