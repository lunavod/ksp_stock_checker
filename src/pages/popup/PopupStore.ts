import { makeAutoObservable, runInAction } from 'mobx'
import { KspPoint, listPoints } from '@root/src/api/ksp'

export default class PopupStore {
  points: KspPoint[] = []

  pointsListShown = false
  error: string | null = null
  totalProducts = 0
  currentlyCheckingProduct = 0

  constructor() {
    makeAutoObservable(this)
    this.loadPoints()
  }

  async loadPoints() {
    const points = await listPoints()
    runInAction(() => {
      this.points = points
    })
  }

  async toggleListShown() {
    this.pointsListShown = !this.pointsListShown
  }

  setError(error: string | null) {
    this.error = error
  }

  setTotalProducts(total: number) {
    this.totalProducts = total
  }

  setCurrentlyCheckingProduct(current: number) {
    this.currentlyCheckingProduct = current
  }
}
