import React from 'react'
import { Container } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import NewSchool from '../components/NewSchool'
import Subscription from '../components/Subscription'
import ViewSchool from '../components/ViewSchools'

function Developer() {
  return (
    <Container fluid>
      <Routes>
        <Route path='school' element={<NewSchool />} />
        <Route path='subscription' element={<Subscription></Subscription>} />
        <Route path='view' element={<ViewSchool/>} />
      </Routes>
    </Container>
  )
}

export default Developer
