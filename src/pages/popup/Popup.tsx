import React from 'react'
import logo from '@assets/img/logo.svg'
import '@pages/popup/Popup.css'
import useStorage from '@src/shared/hooks/useStorage'
import chosenPointsStorage from '@src/shared/storages/chosenPointsStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'

const Popup = () => {
  const chosenPoints = useStorage(chosenPointsStorage)

  return <div className="App"></div>
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
