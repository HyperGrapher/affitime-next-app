import React from 'react'
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import WelcomePage from "../../src/pages/testpage"

describe('Welcome Page Test', () => {

    jest.mock('next/router');


    it('should render Test Page header', () => {
        render(<WelcomePage />)

        const header = screen.getByText("Test Page")
        expect(header).toBeInTheDocument()
    })

    it('should render Home Link', () => {
        render(<WelcomePage />)

        const link = screen.getByRole('link')
        expect(link).toHaveTextContent('Home Link')
    })
})