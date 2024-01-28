import { expect, test, mock, jest } from "bun:test";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      text: async () => ({
        test: {}
      })
    }),
  })
);


