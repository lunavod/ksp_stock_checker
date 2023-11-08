import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base'

type Points = string[]

type PointsStorage = BaseStorage<Points> & {
  togglePoint: (point: string) => void
}

const storage = createStorage<Points>('points-storage-key', [], {
  storageType: StorageType.Local,
})

const chosenPointsStorage: PointsStorage = {
  ...storage,
  togglePoint: (point: string) => {
    storage.set(currentPoints => {
      const points = new Set(currentPoints)
      points.add(point)
      return [...points]
    })
  },
}

export default chosenPointsStorage
