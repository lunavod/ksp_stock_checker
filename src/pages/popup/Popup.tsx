import React, { useState, useEffect } from 'react'
import '@pages/popup/Popup.css'
import useStorage from '@src/shared/hooks/useStorage'
import chosenPointsStorage from '@src/shared/storages/chosenPointsStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'
import { observer } from 'mobx-react-lite'
import PopupStore from './PopupStore'
import { checkStock, listProductInCategory } from '@root/src/api/ksp'
import 'unfonts.css'

const Popup = observer(() => {
  const chosenPointCodes = useStorage(chosenPointsStorage)
  const [store] = useState(() => new PopupStore())
  useEffect(() => {
    store.loadPoints().then(() => console.log([...store.points]))
  }, [store])

  const [chosenPoints, setChosenPoints] = useState([])
  useEffect(() => {
    setChosenPoints(store.points.filter(point => chosenPointCodes.includes(point.key)))
  }, [store.points, chosenPointCodes])

  const [productsInStock, setProductsInStock] = useState([])

  const [inProcess, setInProcess] = useState(false)

  const runStockCheck = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const tab = tabs[0]
    console.log(tab, tab.url)
    if (!tab.url?.startsWith('https://ksp.co.il/web/cat/')) {
      store.setError('Please open a catalog page in ksp')
      return
    }

    if (!chosenPointCodes.length) {
      store.setError('Please choose at least one point')
      return
    }

    setProductsInStock([])
    store.setError(null)

    setInProcess(true)

    const u = new URL(tab.url)
    const catId = u.pathname.split('/').pop()

    const products = {}
    const initialResp = await listProductInCategory(catId)
    console.log(initialResp)

    initialResp.items.forEach(product => {
      const stock = {}
      for (const point of chosenPointCodes) {
        stock[point] = false
      }
      products[product.uinsql] = {
        product,
        stock,
      }
    })
    const total_pages = Math.ceil(initialResp.products_total / Object.keys(products).length)

    if (total_pages > 15) {
      setInProcess(false)
      alert('Too many products, please narrow your search')
      return
    }

    for (let i = 2; i <= total_pages; i++) {
      const resp = await listProductInCategory(catId, i)
      resp.items.forEach(product => {
        const stock = {}
        for (const point of chosenPointCodes) {
          stock[point] = false
        }
        products[product.uinsql] = {
          product,
          stock,
        }
      })
    }

    console.log(products)

    if (!Object.keys(products).length) {
      store.setError('No products found')
      return
    }

    store.setTotalProducts(Object.keys(products).length)
    for (const pid of Object.keys(products)) {
      store.setCurrentlyCheckingProduct(Object.keys(products).indexOf(pid) + 1)
      const resp = await checkStock(pid)
      let total = 0
      for (const point of chosenPointCodes) {
        products[pid].stock[point] = resp[point].qnt
        total += resp[point].qnt
      }
      if (total) setProductsInStock(pIS => [...pIS, products[pid]])
    }

    setInProcess(false)
  }

  const onLinkClick = e => {
    e.preventDefault()
    chrome.tabs.create({ url: e.target.href })
  }

  return (
    <div className="App customScrollbar">
      <div className="logo">
        <span className="big">K.S.P</span>
        <div className="twoPart">
          <span>Stock</span>
          <span>Checker</span>
        </div>
      </div>
      <div>
        <div className="pointsChooserWrapper">
          <span className="heading">Your chosen points:</span>
          <div className="pointsListToggle" onClick={() => store.toggleListShown()}>
            Add points
          </div>
        </div>
        <div className="chosenPointsList">
          {chosenPoints.map(point => (
            <span key={point.key} className="chosenPoint">
              {point.nameEn}
            </span>
          ))}
        </div>
      </div>

      {store.pointsListShown && (
        <div className="pointsList customScrollbar">
          {store.points.map(point => (
            <div key={point.key} className="pointElement">
              <input
                type="checkbox"
                id={point.key}
                checked={chosenPointCodes.includes(point.key)}
                onChange={() => chosenPointsStorage.togglePoint(point.key)}
              />{' '}
              <label htmlFor={point.key}>
                {point.nameEn} ({point.nameHe})
              </label>
            </div>
          ))}
        </div>
      )}

      <button className="checkButton" onClick={runStockCheck} disabled={inProcess}>
        Check stock in selected points
      </button>
      {store.error && <div className="error">{store.error}</div>}

      {!!store.totalProducts && (
        <>
          <div className="info">
            Total products: <span className="count">{store.totalProducts}</span>
            {store.totalProducts !== store.currentlyCheckingProduct && (
              <>
                , now checking <span className="count">{store.currentlyCheckingProduct}</span>
              </>
            )}
          </div>
          <div>
            <div className="heading lined">Products in stock ({productsInStock.length}):</div>
            <div className="productsList">
              {productsInStock.map(product => (
                <div key={product.product.uinsql} className="product">
                  <img src={product.product.img} alt={product.product.name} />
                  <div className="productInfo">
                    <a href={`https://ksp.co.il/web/item/${product.product.uin}`} onClick={e => onLinkClick(e)}>
                      {product.product.name}
                    </a>
                    <div className="price">₪ {product.product.price}</div>
                    <div className="points">
                      {Object.keys(product.stock)
                        .filter(p => !!product.stock[p])
                        .map(p => store.points.find(point => point.key === p).nameEn)
                        .join(', ')}
                    </div>
                  </div>
                </div>
              ))}
              {!Object.keys(productsInStock).length && (
                <div className="noProductsPlaceholder">No products in stock</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
})

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
