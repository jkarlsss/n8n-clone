import toposort from "toposort";
import { Connection, Node } from "../lib/generated/prisma/client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  
  // if no connections, return nodes
  if (connections.length === 0) {
    return nodes;
  }

  // create edges
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  // Add nodes with no connections
  const connectedNodeId = new Set(nodes.map((node) => node.id));
  for (const conn of connections) {
    connectedNodeId.add(conn.fromNodeId);
    connectedNodeId.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeId.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  // perform toposort
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);

    // return sorted nodes
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Graph contains a cycle");
    }
    throw error;
  }

  // Map sorted ids to nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);                                                                
};