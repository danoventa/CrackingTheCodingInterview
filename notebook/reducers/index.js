import appReducer from './app';
import documentReducer from './document';

export const reducers = {
  ...appReducer,
  ...documentReducer,
};
