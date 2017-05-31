import App from '../../app/components/App'

jest.mock("../../app/components/Containers")

describe("<App /> Root Component", () => {

    it("renders correctly", () =>
        expect(App().props.children.length).toBe(3)
    )

})
