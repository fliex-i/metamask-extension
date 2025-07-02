import localforage from 'localforage';

export async function getStorageItem(key) {
  try {
    const serializedData = await localforage.getItem(key);
    if (serializedData === null) {
      return undefined;
    }

    console.log(JSON.parse(serializedData), 'get strong chains');
    return JSON.parse(serializedData);
  } catch (err) {
    return undefined;
  }
}

export async function setStorageItem(key, value) {
  try {
    const serializedData = JSON.stringify(value);
    await localforage.setItem(key, serializedData);
  } catch (err) {
    console.warn(err);
  }
}
