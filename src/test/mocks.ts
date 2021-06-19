export const sceneMock = () => {
  const eventsMock = () => ({
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
  });
  const gameObjectMock = () => ({
    ...eventsMock(),
    setDepth: jest.fn(),
    setSize: jest.fn(),
    setScale: jest.fn(),
    sendToBack: jest.fn(),
    bringToTop: jest.fn(),
    destroy: jest.fn(),
    setOrigin: jest.fn(),
    setInteractive: jest.fn(),
  });
  const containerMock = jest.fn((x?: number, y?: number) => ({
    x,
    y,
    add: jest.fn(),
    ...gameObjectMock(),
  }));
  const imageMock = jest.fn(() => ({
    setTint: jest.fn(),
    ...gameObjectMock(),
  }));

  const textMock = jest.fn(() => ({
    setShadow: jest.fn(),
    setColor: jest.fn(),
    ...gameObjectMock(),
  }));
  const graphicsMock = jest.fn(() => ({
    ...gameObjectMock(),
    lineStyle: jest.fn(),
    fillGradientStyle: jest.fn(),
    strokeRect: jest.fn(),
    fillRect: jest.fn(),
  }));
  const tweensMock = {
    add: jest.fn(),
    killAll: jest.fn(),
  };
  return ({
    add: {
      container: containerMock,
      image: imageMock,
      text: textMock,
      graphics: graphicsMock,
      zone: containerMock,
    },
    tweens: tweensMock,
    events: {
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
    },
    game: {
      events: { ...eventsMock() },
    },
  } as unknown) as Phaser.Scene;
};

export const getMockCalls = (a: any) => {
  return a.mock.calls;
};
