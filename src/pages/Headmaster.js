import React from 'react'
import Account from '../modules/Account'

const availableComponents = {
  'Account': Account
}

function Headmaster({ componentMap = [] }) {
  return (
    <div>
      {componentMap.map((moduleName, index) => {
        const Component = availableComponents[moduleName]
        return Component ? <Component key={index} /> : null
      })}
    </div>
  )
}

export default Headmaster
