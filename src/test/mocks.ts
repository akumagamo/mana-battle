import { Container } from "../Models";

export const eventsMock = () => ({
  on: jest.fn(),
  once: jest.fn(),
  emit: jest.fn(),
});
export const gameObjectMock = () => ({
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
export const containerMock = (jest.fn((x?: number, y?: number) => ({
  x,
  y,
  add: jest.fn(),
  ...gameObjectMock(),
})) as unknown) as () => Container;
export const imageMock = jest.fn(() => ({
  setTint: jest.fn(),
  ...gameObjectMock(),
}));

export const textMock = jest.fn(() => ({
  setShadow: jest.fn(),
  setColor: jest.fn(),
  ...gameObjectMock(),
}));
export const graphicsMock = jest.fn(() => ({
  ...gameObjectMock(),
  lineStyle: jest.fn(),
  fillGradientStyle: jest.fn(),
  strokeRect: jest.fn(),
  fillRect: jest.fn(),
}));
export const tweensMock = {
  add: jest.fn(),
  killAll: jest.fn(),
};

export const sceneMock = () => {
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
    cameras: {
      main: {
        fadeIn: jest.fn().mockResolvedValue(null),
        fadeOut: jest.fn().mockResolvedValue(null),
      },
    },
    time: {
      addEvent: jest.fn().mockResolvedValue(null),
    },
    game: {
      events: { ...eventsMock() },
    },
  } as unknown) as Phaser.Scene;
};

export const getMockCalls = (a: any) => {
  return a.mock.calls;
};
