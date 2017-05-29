import { shallow } from 'enzyme'
import TimeAgo from '../../../app/components/ui/TimeAgo'

jest.mock('../../../app/utils/timeHelper', () => ({
    ago() {
        return 'less than a minute...'
    }
}))

describe("<TimeAgo /> UI Component", () => {

    let wrapper,
        time

    beforeAll(() => {
        time = new Date().toString()
        wrapper = shallow(<TimeAgo timestamp={time} />)
    })

    it("renders a div.time-ago element", () =>
        expect(wrapper.find("div.time-ago").length).toEqual(1))

    it("writes the results of ago", () =>
        expect(wrapper.text()).toEqual("less than a minute..."))

})
