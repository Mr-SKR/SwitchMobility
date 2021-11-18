// Action to read value
export const ReadValue = characteristicUUID => {
  return {
    type: 'READ_VALUE',
    payload: characteristicUUID,
  };
};
