"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BaseEdge,
  Controls,
  type EdgeProps,
  Handle,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MasterTreeNode } from "@/lib/types";

type LineageGraphProps = {
  tree: MasterTreeNode;
  focusMasterId?: number | null;
};

const gapY = 70;
const depthGapX = 340;
const verticalLeafGap = 360;
const verticalDepthGap = 145;

type LineageOrientation = "horizontal" | "vertical";
type LineageViewMode = "horizontal" | "vertical" | "list";

type LineageNodeData = {
  id: number;
  label: string;
  overview: string;
  name: string;
  nameNative: string;
  yearBorn: number | null;
  yearDied: number | null;
  gender: string;
  location: string;
  isHighlighted: boolean;
  orientation: LineageOrientation;
  isDescendant: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (nodeId: number) => void;
};

type LineageEdgeData = {
  orientation: LineageOrientation;
};

function LineageNode({ data }: NodeProps<Node<LineageNodeData, "lineage">>) {
  const [isHovered, setIsHovered] = useState(false);
  const targetPosition = data.orientation === "vertical" ? Position.Top : Position.Left;
  const sourcePosition = data.orientation === "vertical" ? Position.Bottom : Position.Right;
  const showToggle = data.hasChildren && (isHovered || data.isCollapsed);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={targetPosition}
        className="!h-2 !w-2"
        style={{ backgroundColor: "var(--primary)" }}
      />
      <div
        className={`rounded border px-3 py-2 text-[var(--ink)] ${
          data.orientation === "horizontal" && data.isDescendant ? "text-left" : "text-center"
        }`}
        title={data.label}
        style={{
          backgroundColor: "var(--canvas)",
          borderColor: data.isHighlighted ? "var(--primary)" : "var(--hairline)",
          borderWidth: data.isHighlighted ? 2 : 1,
          borderRadius: 8,
          width: "fit-content",
          maxWidth: 300,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          boxShadow: data.isHighlighted ? "0 0 0 2px color-mix(in srgb, var(--primary) 18%, transparent)" : "none",
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={sourcePosition}
        className="!h-2 !w-2"
        style={{ backgroundColor: "var(--primary)" }}
      />
      {showToggle ? (
        <button
          type="button"
          aria-label={data.isCollapsed ? "Expand descendants" : "Collapse descendants"}
          title={data.isCollapsed ? "Expand descendants" : "Collapse descendants"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            data.onToggleCollapse(data.id);
          }}
          className="absolute z-30 inline-flex h-4 w-4 items-center justify-center rounded-full border border-red-600 bg-red-500 text-white hover:bg-red-600"
          style={
            data.orientation === "vertical"
              ? { left: "50%", bottom: "-1px", transform: "translate(-50%, 50%)" }
              : { right: "-1px", top: "50%", transform: "translate(50%, -50%)" }
          }
        >
          <span aria-hidden="true" className="absolute h-px w-2 bg-current" />
          {data.isCollapsed ? (
            <span aria-hidden="true" className="absolute h-2 w-px bg-current" />
          ) : null}
        </button>
      ) : null}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  lineage: LineageNode,
};

function OrthogonalRoundedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  data,
}: EdgeProps<Edge<LineageEdgeData>>) {
  const orientation = data?.orientation ?? "horizontal";
  const epsilon = 0.75;
  const radiusBase = 10;

  if (Math.abs(sourceX - targetX) <= epsilon || Math.abs(sourceY - targetY) <= epsilon) {
    return (
      <BaseEdge
        id={id}
        path={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        markerEnd={markerEnd}
        style={style}
      />
    );
  }

  if (orientation === "vertical") {
    const midY = sourceY + (targetY - sourceY) / 2;
    const seg1 = Math.abs(midY - sourceY);
    const seg2 = Math.abs(targetX - sourceX);
    const seg3 = Math.abs(targetY - midY);
    const radius = Math.max(1, Math.min(radiusBase, seg1 / 2, seg2 / 2, seg3 / 2));
    const dirY1 = targetY >= sourceY ? 1 : -1;
    const dirX = targetX >= sourceX ? 1 : -1;
    const dirY2 = targetY >= midY ? 1 : -1;

    const path = [
      `M ${sourceX},${sourceY}`,
      `L ${sourceX},${midY - dirY1 * radius}`,
      `Q ${sourceX},${midY} ${sourceX + dirX * radius},${midY}`,
      `L ${targetX - dirX * radius},${midY}`,
      `Q ${targetX},${midY} ${targetX},${midY + dirY2 * radius}`,
      `L ${targetX},${targetY}`,
    ].join(" ");

    return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
  }

  const midX = sourceX + (targetX - sourceX) / 2;
  const seg1 = Math.abs(midX - sourceX);
  const seg2 = Math.abs(targetY - sourceY);
  const seg3 = Math.abs(targetX - midX);
  const radius = Math.max(1, Math.min(radiusBase, seg1 / 2, seg2 / 2, seg3 / 2));
  const dirX1 = targetX >= sourceX ? 1 : -1;
  const dirY = targetY >= sourceY ? 1 : -1;
  const dirX2 = targetX >= midX ? 1 : -1;

  const path = [
    `M ${sourceX},${sourceY}`,
    `L ${midX - dirX1 * radius},${sourceY}`,
    `Q ${midX},${sourceY} ${midX},${sourceY + dirY * radius}`,
    `L ${midX},${targetY - dirY * radius}`,
    `Q ${midX},${targetY} ${midX + dirX2 * radius},${targetY}`,
    `L ${targetX},${targetY}`,
  ].join(" ");

  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
}

const edgeTypes = {
  orthogonalRounded: OrthogonalRoundedEdge,
};

function findAncestorIds(root: MasterTreeNode, targetId: number): number[] | null {
  if (root.master.id === targetId) return [];
  for (const child of root.children) {
    const inner = findAncestorIds(child, targetId);
    if (inner) return [root.master.id, ...inner];
  }
  return null;
}

function flattenTree(
  root: MasterTreeNode,
  highlightedNodeId: number | null,
  orientation: LineageOrientation,
  collapsedNodeIds: Set<number>,
  onToggleCollapse: (nodeId: number) => void,
) {
  const positionById = new Map<number, { x: number; y: number }>();
  const depthById = new Map<number, number>();
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
    const depthGap = orientation === "vertical" ? verticalDepthGap : depthGapX;
    const leafGap = orientation === "vertical" ? verticalLeafGap : gapY;
    const x = depth * depthGap;
    depthById.set(node.master.id, depth);
    const isCollapsed = collapsedNodeIds.has(node.master.id);
    const visibleChildren = isCollapsed ? [] : node.children;
    if (!visibleChildren.length) {
      const y = leafCursor * leafGap;
      leafCursor += 1;
      positionById.set(node.master.id, { x, y });
      return y;
    }

    const childCenters = visibleChildren.map((child) => assignPositions(child, depth + 1));
    const y = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    positionById.set(node.master.id, { x, y });
    return y;
  };

  const alignSingleChildChainsForVertical = (node: MasterTreeNode) => {
    if (orientation !== "vertical") return;
    const parentPosition = positionById.get(node.master.id);
    if (!parentPosition) return;

    if (node.children.length === 1 && !collapsedNodeIds.has(node.master.id)) {
      const child = node.children[0];
      const childPosition = positionById.get(child.master.id);
      if (childPosition) {
        // Keep linear descendant chains centered under the parent in vertical mode.
        // This minimizes unnecessary elbows while preserving elbow routing for all edges.
        childPosition.y = parentPosition.y;
        positionById.set(child.master.id, childPosition);
      }
    }

    for (const child of node.children) {
      alignSingleChildChainsForVertical(child);
    }
  };

  const createElements = (node: MasterTreeNode, parentId?: number) => {
    const logicalPosition = positionById.get(node.master.id) ?? { x: 0, y: 0 };
    const position =
      orientation === "vertical"
        ? { x: logicalPosition.y, y: logicalPosition.x }
        : logicalPosition;

    nodes.push({
      id: String(node.master.id),
      position,
      type: "lineage",
      data: {
        id: node.master.id,
        label: `${node.master.name ?? "Unknown"} ${node.master.nameNative ?? ""}`.trim(),
        overview: node.master.overview ?? "",
        name: node.master.name ?? "Unknown",
        nameNative: node.master.nameNative ?? "",
        yearBorn: node.master.yearBorn,
        yearDied: node.master.yearDied,
        gender: node.master.gender ?? "",
        location: node.master.location ?? "",
        isHighlighted: node.master.id === highlightedNodeId,
        orientation,
        isDescendant: parentId !== undefined,
        hasChildren: node.children.length > 0,
        isCollapsed: collapsedNodeIds.has(node.master.id),
        onToggleCollapse,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.master.id}`,
        source: String(parentId),
        target: String(node.master.id),
        type: "orthogonalRounded",
        data: { orientation },
        animated: false,
        style: { stroke: "var(--primary-line)", strokeWidth: 1.75 },
      });
    }

    if (collapsedNodeIds.has(node.master.id)) {
      return;
    }

    for (const child of node.children) {
      createElements(child, node.master.id);
    }
  };

  countLevelWidths(root, 0);
  assignPositions(root, 0);
  alignSingleChildChainsForVertical(root);

  // Match legacy D3 behavior in horizontal mode only.
  // In vertical mode, compressing this span causes sibling label overlap.
  const maxNodesAtAnyDepth = Math.max(...levelWidths, 1);
  const legacyTargetSpan = Math.max(420, (maxNodesAtAnyDepth - 1) * 140);
  if (orientation === "horizontal" && leafCursor > 1) {
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

  // Depth-column collision guard only for horizontal mode.
  // In vertical mode this was introducing lateral drift that detached descendants
  // from their parent's center line.
  if (orientation === "horizontal") {
    const minVerticalLabelGap = 58;
    const idsByDepth = new Map<number, number[]>();
    for (const [id, depth] of depthById.entries()) {
      const bucket = idsByDepth.get(depth) ?? [];
      bucket.push(id);
      idsByDepth.set(depth, bucket);
    }

    for (const ids of idsByDepth.values()) {
      ids.sort((left, right) => {
        const leftY = positionById.get(left)?.y ?? 0;
        const rightY = positionById.get(right)?.y ?? 0;
        return leftY - rightY;
      });

      let lastY = Number.NEGATIVE_INFINITY;
      for (const id of ids) {
        const position = positionById.get(id);
        if (!position) continue;
        if (position.y < lastY + minVerticalLabelGap) {
          position.y = lastY + minVerticalLabelGap;
          positionById.set(id, position);
        }
        lastY = position.y;
      }
    }
  }

  createElements(root);
  return { nodes, edges };
}

export function LineageGraph({ tree, focusMasterId = null }: LineageGraphProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [drawerMaster, setDrawerMaster] = useState<LineageNodeData | null>(null);
  const [viewMode, setViewMode] = useState<LineageViewMode>("horizontal");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lineage-view-mode");
    if (stored === "horizontal" || stored === "vertical" || stored === "list") {
      setViewMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lineage-view-mode", viewMode);
  }, [viewMode]);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<number>>(new Set());
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node<LineageNodeData>, Edge> | null>(
    null,
  );
  const orientation: LineageOrientation = viewMode === "vertical" ? "vertical" : "horizontal";

  const onToggleCollapse = useCallback((nodeId: number) => {
    setCollapsedNodeIds((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(
    () => flattenTree(tree, focusMasterId, orientation, collapsedNodeIds, onToggleCollapse),
    [tree, focusMasterId, orientation, collapsedNodeIds, onToggleCollapse],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFocusInUrl = (nodeId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nodeId == null) {
      params.delete("focus");
    } else {
      params.set("focus", String(nodeId));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const focusedMasterFromUrl =
    focusMasterId == null ? null : nodes.find((node) => node.data.id === focusMasterId)?.data ?? null;
  const activeDrawerMaster = focusedMasterFromUrl ?? drawerMaster;

  useEffect(() => {
    if (focusMasterId == null) return;
    const ancestors = findAncestorIds(tree, focusMasterId);
    if (!ancestors || ancestors.length === 0) return;
    setCollapsedNodeIds((previous) => {
      if (ancestors.every((id) => !previous.has(id))) return previous;
      const next = new Set(previous);
      for (const id of ancestors) next.delete(id);
      return next;
    });
  }, [focusMasterId, tree]);

  useEffect(() => {
    if (!flowInstance || !focusMasterId) return;
    const targetNode = nodes.find((node) => node.data.id === focusMasterId);
    if (!targetNode) return;

    const focusX = orientation === "horizontal" ? targetNode.position.x + 150 : targetNode.position.x;
    flowInstance.setCenter(focusX, targetNode.position.y, {
      zoom: 1,
      duration: 450,
    });
  }, [flowInstance, focusMasterId, nodes, orientation]);

  useEffect(() => {
    if (viewMode !== "list" || focusMasterId == null) return;
    if (typeof document === "undefined") return;
    const element = document.querySelector(`[data-master-id="${focusMasterId}"]`);
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [viewMode, focusMasterId, collapsedNodeIds]);

  const highlightedEdgeIds = useMemo(() => {
    const childrenByParent = new Map<number, number[]>();
    const parentsByChild = new Map<number, number[]>();
    for (const edge of edges) {
      const parentId = Number.parseInt(edge.source, 10);
      const childId = Number.parseInt(edge.target, 10);
      if (!Number.isFinite(parentId) || !Number.isFinite(childId)) continue;

      const childBucket = childrenByParent.get(parentId) ?? [];
      childBucket.push(childId);
      childrenByParent.set(parentId, childBucket);

      const parentBucket = parentsByChild.get(childId) ?? [];
      parentBucket.push(parentId);
      parentsByChild.set(childId, parentBucket);
    }

    const highlighted = new Set<string>();

    const collectLineageEdges = (startNodeId: number | null) => {
      if (startNodeId == null) return;

      const stackDown = [startNodeId];
      const seenDown = new Set<number>([startNodeId]);
      while (stackDown.length) {
        const currentId = stackDown.pop();
        if (currentId == null) continue;
        const children = childrenByParent.get(currentId) ?? [];
        for (const childId of children) {
          highlighted.add(`${currentId}-${childId}`);
          if (!seenDown.has(childId)) {
            seenDown.add(childId);
            stackDown.push(childId);
          }
        }
      }

      const stackUp = [startNodeId];
      const seenUp = new Set<number>([startNodeId]);
      while (stackUp.length) {
        const currentId = stackUp.pop();
        if (currentId == null) continue;
        const parents = parentsByChild.get(currentId) ?? [];
        for (const parentId of parents) {
          highlighted.add(`${parentId}-${currentId}`);
          if (!seenUp.has(parentId)) {
            seenUp.add(parentId);
            stackUp.push(parentId);
          }
        }
      }
    };

    collectLineageEdges(activeDrawerMaster?.id ?? null);
    collectLineageEdges(hoveredNodeId);

    return highlighted;
  }, [activeDrawerMaster?.id, edges, hoveredNodeId]);

  const edgesForRender = useMemo(
    () =>
      edges.map((edge) => {
        if (!highlightedEdgeIds.has(edge.id)) return edge;
        return {
          ...edge,
          style: {
            ...edge.style,
            strokeWidth: 4.75,
          },
        };
      }),
    [edges, highlightedEdgeIds],
  );

  const renderNestedListNode = useCallback(
    (
      node: MasterTreeNode,
      depth = 0,
      isLastSibling = true,
      parentMasterId: number | null = null,
      hasHighlightedLaterSibling = false,
    ) => {
      const label = `${node.master.name ?? "Unknown"} ${node.master.nameNative ?? ""}`.trim();
      const hasChildren = node.children.length > 0;
      const isCollapsed = collapsedNodeIds.has(node.master.id);
      const isActive = activeDrawerMaster?.id === node.master.id;
      const incomingEdgeHighlighted =
        parentMasterId != null && highlightedEdgeIds.has(`${parentMasterId}-${node.master.id}`);
      const highlightedChildEdges = hasChildren
        ? node.children.filter((child) =>
            highlightedEdgeIds.has(`${node.master.id}-${child.master.id}`),
          )
        : [];
      const childBranchHighlighted = highlightedChildEdges.length > 0;

      return (
        <li key={node.master.id} data-master-id={node.master.id} className="relative">
          {depth > 0 ? (
            <>
              {!isLastSibling ? (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -left-[17px] top-0 h-full ${
                    hasHighlightedLaterSibling ? "w-0.5 bg-red-500" : "w-px bg-red-500"
                  }`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -left-[17px] top-0 h-3 w-[17px] rounded-bl-[8px] ${
                  incomingEdgeHighlighted
                    ? "border-b-2 border-l-2 border-red-500"
                    : "border-b border-l border-red-500"
                }`}
              />
            </>
          ) : null}
          <div className="flex h-6 items-center gap-1">
            <span aria-hidden="true" className="relative inline-block h-5 w-1.5">
              <span
                className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ${
                  isActive ? "h-2.5 w-2.5" : "h-1.5 w-1.5"
                }`}
              />
              {hasChildren ? (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-0 top-1/2 h-[22px] -translate-x-1/2 ${
                    childBranchHighlighted ? "w-0.5 bg-red-500" : "w-px bg-red-500"
                  }`}
                />
              ) : null}
            </span>
            <button
              type="button"
              className={`whitespace-nowrap text-left text-[13px] leading-5 hover:text-[var(--ink)] hover:underline ${
                isActive ? "font-semibold text-[var(--ink)]" : "text-[var(--body)]"
              }`}
              onClick={() => {
                setDrawerMaster({
                  id: node.master.id,
                  label,
                  overview: node.master.overview ?? "",
                  name: node.master.name ?? "Unknown",
                  nameNative: node.master.nameNative ?? "",
                  yearBorn: node.master.yearBorn,
                  yearDied: node.master.yearDied,
                  gender: node.master.gender ?? "",
                  location: node.master.location ?? "",
                  isHighlighted: false,
                  orientation,
                  isDescendant: depth > 0,
                  hasChildren,
                  isCollapsed,
                  onToggleCollapse,
                });
                updateFocusInUrl(node.master.id);
              }}
            >
              {label}
            </button>
          </div>
          {hasChildren ? (
            <div className="flex h-5 items-center gap-1">
              <div className="relative inline-flex h-5 w-1.5 items-center">
                <button
                  type="button"
                  aria-label={isCollapsed ? "Expand descendants" : "Collapse descendants"}
                  title={isCollapsed ? "Expand descendants" : "Collapse descendants"}
                  className="absolute left-0 top-1/2 z-10 inline-flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-600 bg-red-500 text-white hover:bg-red-600"
                  onClick={() => onToggleCollapse(node.master.id)}
                >
                  <span aria-hidden="true" className="absolute h-px w-1.5 bg-current" />
                  {isCollapsed ? (
                    <span aria-hidden="true" className="absolute h-1.5 w-px bg-current" />
                  ) : null}
                </button>
                {!isCollapsed ? (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-1/2 z-0 h-2.5 -translate-x-1/2 ${
                      childBranchHighlighted ? "w-0.5 bg-red-500" : "w-px bg-red-500"
                    }`}
                  />
                ) : null}
              </div>
              <span aria-hidden="true" className="inline-block h-5 w-5" />
            </div>
          ) : null}
          {hasChildren && !isCollapsed ? (
            <ul className="relative ml-[16.5px]">
              {node.children.map((child, childIndex) => {
                const isLastChild = childIndex === node.children.length - 1;
                const laterSiblingHighlighted = node.children
                  .slice(childIndex + 1)
                  .some((later) =>
                    highlightedEdgeIds.has(`${node.master.id}-${later.master.id}`),
                  );
                return renderNestedListNode(
                  child,
                  depth + 1,
                  isLastChild,
                  node.master.id,
                  laterSiblingHighlighted,
                );
              })}
            </ul>
          ) : null}
        </li>
      );
    },
    [
      activeDrawerMaster?.id,
      collapsedNodeIds,
      highlightedEdgeIds,
      onToggleCollapse,
      orientation,
      updateFocusInUrl,
    ],
  );

  return (
    <div className="relative h-[calc(100vh-57px)] w-full bg-[var(--canvas)]">
      {viewMode === "list" ? (
        <div
          className={`h-full overflow-auto pb-6 pl-4 pt-14 ${
            activeDrawerMaster ? "pr-[calc(1rem+360px+1rem)]" : "pr-4"
          }`}
        >
          <div className="min-w-max">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Lineage List
            </h2>
            <ul>{renderNestedListNode(tree)}</ul>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edgesForRender}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={orientation === "horizontal" ? [0, 0.5] : [0.5, 0.5]}
          defaultEdgeOptions={{
            type: "orthogonalRounded",
            style: { stroke: "var(--primary-line)", strokeWidth: 1.75 },
          }}
          defaultViewport={{ x: 40, y: 140, zoom: 1 }}
          minZoom={0.05}
          maxZoom={2}
          onInit={(instance) => setFlowInstance(instance)}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.data.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          onNodeClick={(_, node) => {
            setDrawerMaster(node.data);
            updateFocusInUrl(node.data.id);
          }}
          onPaneClick={() => {
            setDrawerMaster(null);
            updateFocusInUrl(null);
          }}
        >
          <Controls />
        </ReactFlow>
      )}
      <div className="absolute left-3 top-3 z-40">
        <div className="inline-flex items-center gap-1 rounded border border-[var(--hairline)] bg-[var(--canvas)] p-1">
          <button
            type="button"
            aria-label="Horizontal tree view"
            aria-pressed={viewMode === "horizontal"}
            title="Horizontal view"
            className={`rounded p-1.5 ${
              viewMode === "horizontal"
                ? "bg-[var(--surface-card)] text-[var(--body)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--body)]"
            }`}
            onClick={() => setViewMode("horizontal")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(-90deg)" }}
              aria-hidden="true"
            >
              <rect x="16" y="16" width="6" height="6" rx="1" />
              <rect x="2" y="16" width="6" height="6" rx="1" />
              <rect x="9" y="2" width="6" height="6" rx="1" />
              <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
              <path d="M12 12V8" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Vertical tree view"
            aria-pressed={viewMode === "vertical"}
            title="Vertical view"
            className={`rounded p-1.5 ${
              viewMode === "vertical"
                ? "bg-[var(--surface-card)] text-[var(--body)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--body)]"
            }`}
            onClick={() => setViewMode("vertical")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="16" y="16" width="6" height="6" rx="1" />
              <rect x="2" y="16" width="6" height="6" rx="1" />
              <rect x="9" y="2" width="6" height="6" rx="1" />
              <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
              <path d="M12 12V8" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Nested list view"
            aria-pressed={viewMode === "list"}
            title="Nested list view"
            className={`rounded p-1.5 ${
              viewMode === "list"
                ? "bg-[var(--surface-card)] text-[var(--body)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--body)]"
            }`}
            onClick={() => setViewMode("list")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 5h13" />
              <path d="M13 12h8" />
              <path d="M13 19h8" />
              <path d="M3 10a2 2 0 0 0 2 2h3" />
              <path d="M3 5v12a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
      {activeDrawerMaster ? (
        <aside
          className="absolute right-0 top-0 z-30 flex h-full w-[360px] flex-col border-l bg-[var(--canvas)]"
          style={{ borderColor: "var(--hairline)" }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--hairline)" }}
          >
            <h2 className="truncate pr-3 text-lg font-medium text-[var(--ink)]">{activeDrawerMaster.name}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="View page"
                title="View page"
                className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--body)]"
                onClick={() => router.push(`/index/${activeDrawerMaster.id}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="14" y2="17" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Close details drawer"
                className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--body)]"
                onClick={() => {
                  setDrawerMaster(null);
                  updateFocusInUrl(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="lineage-drawer-scroll flex-1 overflow-y-auto px-4 py-4">
            {activeDrawerMaster.nameNative ? (
              <p className="mb-3 text-sm text-[var(--muted)]">{activeDrawerMaster.nameNative}</p>
            ) : null}
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <p>Born: {activeDrawerMaster.yearBorn ?? "?"}</p>
              <p>Died: {activeDrawerMaster.yearDied ?? "?"}</p>
              <p>Gender: {activeDrawerMaster.gender || "Unknown"}</p>
              <p>Location: {activeDrawerMaster.location || "Unknown"}</p>
            </div>
            <div className="rounded border border-[var(--hairline)] bg-[var(--surface-card)] p-3 text-sm leading-6 text-[var(--body)]">
              {activeDrawerMaster.overview || "No overview available for this person yet."}
            </div>
          </div>
        </aside>
      ) : null}
      <style jsx global>{`
        .lineage-drawer-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .lineage-drawer-scroll::-webkit-scrollbar-track {
          background: var(--surface-card);
        }

        .lineage-drawer-scroll::-webkit-scrollbar-thumb {
          background: var(--hairline);
          border-radius: 10px;
          border: 2px solid var(--surface-card);
        }

        .lineage-drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
      `}</style>
    </div>
  );
}
