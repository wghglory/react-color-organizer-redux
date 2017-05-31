import { render } from 'react-dom'

jest.mock('react-dom')
jest.mock('../app/store/storeFactory', () => () => ({
  subscribe: jest.fn(),
  dispatch: jest.fn(),
  getState: jest.fn()
}))

describe("App Entry Point - /app/index.js", () => {

  it("renders app wihtout error", () => {
    require('../app/index.js')
  })

})
