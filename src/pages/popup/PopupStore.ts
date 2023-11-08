import { makeAutoObservable } from 'mobx'

export default class PopupStore {
  points: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  async loadPoints() {}
}
