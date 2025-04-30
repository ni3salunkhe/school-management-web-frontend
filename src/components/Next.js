import React from 'react'
import { Button } from 'react-bootstrap'
import { useNavigateService } from '../services/useNavigateService';

function Next({classname,path,placeholder}) {
    const {navigateTo} = useNavigateService();
  return (
    <>
        <Button className={classname} onClick={()=>navigateTo(path)}>{placeholder}</Button>
    </>
  )
}

export default Next
