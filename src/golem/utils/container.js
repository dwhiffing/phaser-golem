
import { v4 as uuid } from 'uuid'

export class Entity {
  id = uuid()
  class_mappings = []
  ids = {}
  init = () => { }

  constructor(relationships, init = () => { }) {
    Object.keys(relationships).forEach(key => {
      const relationship = relationships[key]
      const many = Array.isArray(relationship)
      const Model = many ? relationship[0] : relationship

      this.class_mappings.push({
        mapping: key,
        name: Model.prototype.constructor.name,
      })
      this.ids[key] = many ? new Set() : undefined
    })
    this.init = init
  }
}

class Container {
  entities = {}

  get = (model, id) => this.entities[model]?.get(id)

  register = Class => {
    const self = this
    const class_name = Class.prototype.constructor.name

    if (!self.entities[class_name]) {
      self.entities[class_name] = new Map()
    }

    return new Proxy(Class, {
      construct(target, args) {
        const instance = new target(...args)
        self.entities[class_name].set(instance.id, instance)

        Object.keys(instance.ids).forEach(kin => {
          Object.defineProperty(instance, kin, {
            get() {
              const query = instance.ids[kin]
              const kin_class_name = instance.class_mappings.find(
                klass => klass.mapping === kin
              ).name

              return query && query instanceof Set
                ? [...query.values()].map(id => self.get(kin_class_name, id))
                : self.get(kin_class_name, query)
            },
          })
          Object.defineProperty(instance, `link_${kin}`, {
            value(Entity) {
              const entities = Array.isArray(Entity) ? Entity : [Entity]
              const query = instance.ids[kin]

              if (query && query instanceof Set) {
                entities.forEach(entity => instance.ids[kin].add(entity.id))
              } else {
                instance.ids[kin] = Entity.id
              }

              return instance
            },
          })
          Object.defineProperty(instance, `unlink_${kin}`, {
            value(Entity) {
              const entities = Array.isArray(Entity) ? Entity : [Entity]
              const query = instance.ids[kin]

              if (query && query instanceof Set) {
                entities.forEach(entity => instance.ids[kin].delete(entity.id))
              } else {
                instance.ids[kin] = undefined
              }

              return instance
            },
          })
        })

        Object.defineProperty(instance, 'release_from_container', {
          value() {
            self.entities[class_name].delete(instance.id)
          },
        })

        instance.init()
        return instance
      },
    })
  }
}

export default new Container()