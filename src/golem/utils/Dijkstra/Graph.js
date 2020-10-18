import Queue from './PriorityQueue'
import removeDeepFromMap from './removeDeepFromMap'
import toDeepMap from './toDeepMap'
import validateDeep from './validateDeep'

/** Creates and manages a graph */
export default class Graph {
  constructor(graph) {
    if (graph instanceof Map) {
      validateDeep(graph)
      this.graph = graph
    } else if (graph) {
      this.graph = toDeepMap(graph)
    } else {
      this.graph = new Map()
    }
  }

  addNode(name, neighbors) {
    let nodes
    if (neighbors instanceof Map) {
      validateDeep(neighbors)
      nodes = neighbors
    } else {
      nodes = toDeepMap(neighbors)
    }

    this.graph.set(name, nodes)

    return this
  }

  removeNode(key) {
    this.graph = removeDeepFromMap(this.graph, key)
    return this
  }

  path(
    unit,
    start,
    goal,
    options = {}
  ) {
    // Don't run when we don't have nodes set
    if (!this.graph.size) {
      if (options.cost) return { path: null, cost: 0 }

      return null
    }

    const explored = new Set()
    const frontier = new Queue()
    const previous = new Map()

    let path = []
    let totalCost = 0

    const avoid = options.avoid ?? []
    if (avoid.includes(start)) {
      throw new Error(`Starting node (${start}) cannot be avoided`)
    } else if (avoid.includes(goal)) {
      throw new Error(`Ending node (${goal}) cannot be avoided`)
    }

    // Add the starting point to the frontier, it will be the first node visited
    frontier.set(start, 0)

    // Run until we have visited every node in the frontier
    while (!frontier.isEmpty()) {
      // Get the node in the frontier with the lowest cost (`priority`)
      const node = frontier.next()

      // When the node with the lowest cost in the frontier in our goal node,
      // we can compute the path and exit the loop
      if (node.key === goal) {
        // Set the total cost to the current value
        totalCost = node.priority

        let nodeKey = node.key
        while (previous.has(nodeKey)) {
          path.push(nodeKey)
          nodeKey = previous.get(nodeKey)
        }

        break
      }

      // Add the current node to the explored set
      explored.add(node.key)

      // Loop all the neighboring nodes
      const neighbors = (this.graph.get(node.key) || new Map())
      neighbors.forEach((footprint, nNode) => {
        // If we already explored the node, or the node is to be avoided, skip it
        if (explored.has(nNode) || avoid.includes(nNode)) return null

        // If the neighboring node is not yet in the frontier, we add it with
        // the correct cost

        const tileCost = footprint.reduce((acc, tile) => acc + tile.cost(unit), 0)

        if (!frontier.has(nNode)) {
          previous.set(nNode, node.key)
          return frontier.set(nNode, node.priority + tileCost)
        }

        const frontierPriority = frontier.get(nNode).priority
        const nodeCost = node.priority + tileCost

        // Otherwise we only update the cost of this node in the frontier when
        // it's below what's currently set
        if (nodeCost < frontierPriority) {
          previous.set(nNode, node.key)
          return frontier.set(nNode, nodeCost)
        }

        return null
      })
    }

    // Return null when no path can be found
    if (!path.length) {
      if (options.cost) return { path: null, cost: 0 }

      return null
    }

    // From now on, keep in mind that `path` is populated in reverse order,
    // from destination to origin

    // Remove the first value (the goal node) if we want a trimmed result
    if (options.trim) {
      path.shift()
    } else {
      // Add the origin waypoint at the end of the array
      path = path.concat([start])
    }

    // Reverse the path if we don't want it reversed, so the result will be
    // from `start` to `goal`
    if (!options.reverse) {
      path = path.reverse()
    }

    // Return an object if we also want the cost
    if (options.cost) {
      return {
        path,
        cost: totalCost,
      }
    }

    return path
  }
}
