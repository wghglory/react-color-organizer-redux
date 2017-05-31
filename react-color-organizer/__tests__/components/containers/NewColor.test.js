import { mount, shallow } from 'enzyme'
import { Provider } from 'react-redux'
import { NewColor } from '../../../app/components/containers'
import { addColor } from '../../../app/actions/actions.color'

jest.mock('../../../app/components/ui/AddColorForm')
jest.mock('../../../app/actions/actions.color.js')

describe("<NewColor /> Container ", () => {

    let wrapper, result
    const _store = {
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        getState: jest.fn(() => ({}))
    }

    it("dispatch invokes addColor action", () => {
        wrapper = mount(
            <Provider store={_store}>
                <NewColor />
            </Provider>
        )
        wrapper.find("AddColorFormMock").props().onNewColor("test color", "#FF0000")
        expect(addColor.mock.calls[0]).toEqual(["test color", "#FF0000"])
    })

})
