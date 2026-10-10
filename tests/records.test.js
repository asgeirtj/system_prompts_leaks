import { insertRecord } from '../src/store/modules/records';
import { generateUniqueId } from '@/utils/idGenerator';

jest.mock('@/utils/idGenerator', () => ({
  generateUniqueId: jest.fn(() => 'unique-id-123')
}));

describe('insertRecord', () => {
  let state;

  beforeEach(() => {
    state = { records: [] };
  });

  it('should add a new record with a unique ID to the state', () => {
    const newRecord = { name: 'Test Record', value: 42 };
    insertRecord(state, newRecord);

    expect(state.records).toHaveLength(1);
    expect(state.records[0]).toEqual({
      id: 'unique-id-123',
      name: 'Test Record',
      value: 42
    });
  });

  it('should call generateUniqueId to generate a unique ID', () => {
    const newRecord = { name: 'Another Record', value: 100 };
    insertRecord(state, newRecord);

    expect(generateUniqueId).toHaveBeenCalled();
  });

  it('should handle inserting multiple records', () => {
    const records = [
      { name: 'Record 1', value: 10 },
      { name: 'Record 2', value: 20 }
    ];

    records.forEach(record => insertRecord(state, record));

    expect(state.records).toHaveLength(2);
    expect(state.records[0].name).toBe('Record 1');
    expect(state.records[1].name).toBe('Record 2');
  });

  it('should handle an empty newRecord object', () => {
    const newRecord = {};
    insertRecord(state, newRecord);

    expect(state.records).toHaveLength(1);
    expect(state.records[0]).toEqual({
      id: 'unique-id-123',
      name: undefined,
      value: undefined
    });
  });

  it('should not throw an error if state is undefined', () => {
    expect(() => insertRecord(undefined, { name: 'Test', value: 1 })).not.toThrow();
  });
});