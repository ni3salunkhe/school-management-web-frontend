import React from 'react'
import { Container } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import NewSchool from '../components/NewSchool'
import Subscription from '../components/Subscription'
import ViewSchool from '../components/ViewSchools'
import StateForm from '../components/StateForm'
import DistrictForm from '../components/DistrictForm'
import TehsilForm from '../components/TehsilForm'
import VillageOrCityForm from '../components/VillageOrCityForm'
import ViewUsers from '../components/ViewUsers'

function Developer() {
  return (
    <Container fluid>
      <Routes>
        <Route path='school' element={<NewSchool />} />
        <Route path='subscription' element={<Subscription></Subscription>} />
        <Route path='view' element={<ViewSchool />} />
        <Route path='state' element={<StateForm />} />
        <Route path='district' element={<DistrictForm />} />
        <Route path='tehsil' element={<TehsilForm />} />
        <Route path='village' element={<VillageOrCityForm />} />
        <Route path='view-users' element={<ViewUsers />} />
      </Routes>
    </Container>
  )
}

export default Developer
