import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import RecordList from '../src/components/RecordList.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('RecordList.vue', () => {
  let store;
  let state;

  beforeEach(() => {
    state = {
      records: [
        { id: '1', name: 'Record 1', value: 10 },
        { id: '2', name: 'Record 2', value: 20 }
      ]
    };
    store = new Vuex.Store({
      state
    });
  });

  it('should render a list of records from the store', () => {
    const wrapper = shallowMount(RecordList, { store, localVue });
    const recordItems = wrapper.findAll('.record-item');

    expect(recordItems).toHaveLength(2);
    expect(recordItems.at(0).text()).toContain('Record 1');
    expect(recordItems.at(1).text()).toContain('Record 2');
  });

  it('should update when a new record is inserted', async () => {
    const wrapper = shallowMount(RecordList, { store, localVue });
    state.records.push({ id: '3', name: 'Record 3', value: 30 });
    await wrapper.vm.$nextTick();

    const recordItems = wrapper.findAll('.record-item');
    expect(recordItems).toHaveLength(3);
    expect(recordItems.at(2).text()).toContain('Record 3');
  });

  it('should call handleRecordChange on insertRecord mutation', () => {
    const handleRecordChangeSpy = jest.spyOn(RecordList.methods, 'handleRecordChange');
    shallowMount(RecordList, { store, localVue });

    store.commit('insertRecord', { id: '4', name: 'Record 4', value: 40 });
    expect(handleRecordChangeSpy).toHaveBeenCalled();
  });
});