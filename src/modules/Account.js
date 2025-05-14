import { render } from '@testing-library/react';
import React from 'react'
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import Credit from '../components/account/Credit';



function Account({ role }) {
  
  const renderRoutes = () => {
    switch (role) {
      case 'TEACHER':
        return (

          <Routes>
            <Route path='credit' element={<Credit />} />
          </Routes>
        )
      default:
        return null
    }
  }
  return (
    <Container>
      {renderRoutes()}
    </Container>
  )
}

export default Account
