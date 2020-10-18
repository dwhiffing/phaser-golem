import { EventEmitter } from 'events'
import Coords from '../utils/Coords'
import container, { Entity } from '../utils/container'
import Deployment from './Deployment'

class Grid extends Entity {
  timestamp = Date.now()
  events = new EventEmitter()

  tiles = {}

  constructor({ tiles, units }) {
    super({ deployments: [Deployment] }, () => {
      this.tiles = tiles.map((row, y) =>
        row.map((tile, x) => ({
          coords: new Coords({ x, y }),
          tile,
        })),
      )
      if (units) this.deploy_units(units)
    })
  }

  get size() {
    return { height: this.tiles.length, width: this.tiles[0].length }
  }

  tile_at = (coordinates) => this.tiles[coordinates.y]?.[coordinates.x]?.tile

  teams = () => [
    ...this.deployments
      .reduce((acc, deployment) => {
        acc.add(deployment.unit.team)
        return acc
      }, new Set())
      .values(),
  ]

  map_tiles = (callback = (t) => t) =>
    this.tiles.map((row) => row.map((item) => callback(item)))

  within_bounds = ({ x, y }) =>
    x >= 0 && x < this.size.width && y >= 0 && y < this.size.height

  out_of_bounds = (coordinates) => !this.within_bounds(coordinates)

  create_deployment = (unit, coordinates) => {
    if (this.find_deployment(unit.id)) {
      return undefined
    }

    this.timestamp++
    return new Deployment({
      grid: this,
      unit,
      coordinates,
    })
  }

  deploy_unit = (unit, coordinates) => {
    const deployment = this.create_deployment(unit, coordinates)
    if (deployment) this.events.emit('unitsDeployed', [deployment])
    return deployment
  }

  deploy_units = (unit_data) => {
    const deployments = unit_data
      .map(([unit, coordinates]) => this.create_deployment(unit, coordinates))
      .filter(Boolean)

    if (deployments.length) this.events.emit('unitsDeployed', deployments)
  }

  withdraw_deployment = (deployment) => {
    if (deployment.grid?.id === this.id) {
      this.unlink_deployments(deployment)
      deployment.unlink_grid()
      deployment.unlink_unit()
      deployment.release_from_container()
      this.events.emit('deploymentsWithdrawn', deployment)
      this.timestamp++
    }
    return this
  }

  withdraw_deployments = (deployments) => {
    const withdrawals = deployments.filter((d) => d.grid?.id === this.id)

    if (withdrawals.length) {
      withdrawals.forEach((deployment) => {
        deployment.unlink_grid()
        deployment.unit.unlink_deployment()
        deployment.unlink_unit()
        deployment.release_from_container()
      })
      this.unlink_deployments(withdrawals)

      this.events.emit('deploymentsWithdrawn', withdrawals)
      this.timestamp++
    }

    return this
  }

  find_deployment = (query) =>
    this.deployments.find((d) =>
      typeof query === 'string'
        ? d.unit.id === query
        : d.coordinates.hash === Coords.hash(query),
    )

  find_deployments = (queries) =>
    queries.map(this.find_deployment).filter(Boolean)
}

export default container.register(Grid)
