export const sceneMock = () => {
  const containerMock = jest.fn((x?: number, y?: number) => ({
    x,
    y,
    add: jest.fn(),
    setDepth: jest.fn(),
    setSize: jest.fn(),
    setScale: jest.fn(),
    sendToBack: jest.fn(),
    bringToTop: jest.fn(),
    destroy: jest.fn(),
  }));
  const imageMock = jest.fn(() => ({
    setTint: jest.fn(),
    setDepth: jest.fn(),
    setSize: jest.fn(),
    setScale: jest.fn(),
  }));
  const tweensMock = {
    add: jest.fn(),
    killAll: jest.fn(),
  };
  return {
    add: {
      container: containerMock,
      image: imageMock,
    },
    tweens: tweensMock,
  };
};

export const getMockCalls = (a: any) => {
  return a.mock.calls;
};
