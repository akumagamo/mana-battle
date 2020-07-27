const PUBLIC_URL = 'assets';

export function preload(this: {
  load: {
    image: (key: string, path: string) => void;
  };
  preload: () => void;
  create: (this: {preload: () => void; create: () => void}) => void;
}) {
  const images = [
    'insignea',
    'tile',
    'hand',
    'foot',
    'head',
    'backgrounds/plain',
    'backgrounds/squad_edit',
  ];

  images.forEach((str) =>
    this.load.image(str, PUBLIC_URL + '/' + str + '.svg'),
  );

  const numbers = [1, 2, 3, 4];
  numbers.forEach((n: number) => {
    this.load.image('head' + n.toString(), PUBLIC_URL + '/head.svg');
    this.load.image('back_head' + n.toString(), PUBLIC_URL + '/back_head.svg');
  });

  const classes = ['fighter', 'knight', 'wizard'];

  classes.forEach((class_) => {
    this.load.image(`trunk_${class_}`, `${PUBLIC_URL}/trunk_${class_}.svg`);
    this.load.image(
      `trunk_back_${class_}`,
      `${PUBLIC_URL}/trunk_back_${class_}.svg`,
    );
  });

  const ui = ['arrow_right', 'panel'];
  ui.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`);
  });

  const items = [
    'amulet',
    'iron_armor',
    'iron_shield',
    'iron_sword',
    'steel_armor',
    'steel_shield',
    'steel_sword',
    'baldar_armor',
    'baldar_shield',
    'baldar_sword',
    'oaken_staff',
  ];
  items.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/items/${id}.png`);
  });

  const equips = [
    'equips/iron_sword',
    'equips/steel_sword',
    'equips/baldar_sword',
    'equips/oaken_staff',
  ];
  equips.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const props = [
    'props/grass',
    'props/bush',
    'props/far_tree_1',
    'props/branch',
  ];
  props.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const tiles = [
    'tiles/grass',
    'tiles/woods',
    'tiles/mountain',
    'tiles/castle',
  ];
  tiles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const structures = ['tiles/town'];
  structures.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.png`);
  });

  // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

  const castles = ['merano']
  castles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
  });
}
