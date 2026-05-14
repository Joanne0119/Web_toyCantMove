export const navLinks = [
  { id: 'hero', label: '首頁' },
  { id: 'about', label: '理念' },
  { id: 'characters', label: '角色' },
  { id: 'levels', label: '關卡' },
  { id: 'gameplay', label: '玩法' },
  { id: 'tech', label: '技術' },
  { id: 'team', label: '團隊' },
];

export const characters = [
  {
    id: 'wobo',
    charName: '沃寶',
    engName: 'Wobo',
    type: '發條玩具',
    speed: 8,
    power: 23,
    skill: 15,
    graySrc: '/images/gray_wind-up.png',
    colorSrc: '/images/red_wind-up.png',
    description: '一個充滿力量的發條玩具，雖然移動速度不快，但擁有驚人的爆發力。',
  },
  {
    id: 'mavo',
    charName: '冒冒',
    engName: 'Mavo',
    type: '小帽子',
    speed: 20,
    power: 11,
    skill: 2,
    graySrc: '/images/gray_hat.png',
    colorSrc: '/images/blue_hat.png',
    description: '速度最快的角色！像風一樣穿梭在玩具箱裡，但力量和技巧稍嫌不足。',
  },
  {
    id: 'remy',
    charName: '雷米',
    engName: 'Remy',
    type: '小老鼠',
    speed: 10,
    power: 14,
    skill: 20,
    graySrc: '/images/gray_mouse.png',
    colorSrc: '/images/green_mouse.png',
    description: '技巧最高的角色，靈活聰明，善於利用環境中的一切來取得優勢。',
  },
  {
    id: 'fiffy',
    charName: '菲菲',
    engName: 'Fiffy',
    type: '小狗狗',
    speed: 13,
    power: 17,
    skill: 9,
    graySrc: '/images/gray_dog.png',
    colorSrc: '/images/yellow_dog.png',
    description: '均衡型選手，忠誠可靠的小狗狗，各方面能力都很穩定。',
  },
  {
    id: 'luka',
    charName: '夢鹿',
    engName: 'Luka',
    type: '小鹿',
    speed: 15,
    power: 19,
    skill: 6,
    graySrc: '/images/gray_deer.png',
    colorSrc: '/images/blue_deer.png',
    description: '優雅而強大的小鹿，擁有出色的速度和力量，是全方位的好手。',
  },
];

export const levels = [
  {
    id: 0,
    name: '玩具紙箱',
    engName: 'Toybox',
    image: '/images/toyboxLevel.png',
    description: '在堆滿玩具的紙箱中展開冒險！各種玩具散落其中，快來收集它們吧。這是一個經典的競技場地，充滿了童年的回憶。',
    bgClass: 'bg-base-200',
  },
  {
    id: 1,
    name: '塗鴉畫紙',
    engName: 'Color Paper',
    image: '/images/tableLevel.png',
    description: '在一張巨大的畫紙上奔跑！收集顏料罐，用繽紛的色彩佔領畫紙。每位玩家的力量值會影響顏料的爆炸範圍，策略性十足！',
    bgClass: 'bg-base-300',
  },
  {
    id: 2,
    name: '瘋狂餐桌',
    engName: 'Tap Eat',
    image: '/images/foodLevel.png',
    description: '在擺滿美食的餐桌上比拼手速！快速點擊螢幕來吃掉盤中的食物，看誰能在時間內吃完最多盤！',
    bgClass: 'bg-base-200',
  },
];

export const gameplaySteps = [
  {
    step: 1,
    title: '開啟遊戲',
    description: '在電腦或大螢幕上打開遊戲主程式，準備好你的遊戲場地。',
    icon: 'Monitor',
  },
  {
    step: 2,
    title: '手機連線',
    description: '用手機掃描畫面上的 QR Code，輸入暱稱後即可加入遊戲房間。',
    icon: 'Smartphone',
  },
  {
    step: 3,
    title: '體感操控',
    description: '傾斜你的手機來控制角色移動！向前傾就前進，向左傾就左轉。',
    icon: 'RotateCcw',
  },
  {
    step: 4,
    title: '競爭得分',
    description: '與朋友們即時競爭，收集物品累積分數，最後看誰是玩具箱之王！',
    icon: 'Trophy',
  },
];

export const techStack = [
  {
    id: 'webrtc',
    name: 'WebRTC P2P',
    description: '採用 WebRTC 點對點技術實現即時多人連線，無需中間伺服器轉發，確保低延遲的遊戲體驗。',
    icon: 'Wifi',
  },
  {
    id: 'gyroscope',
    name: '陀螺儀感測',
    description: '運用手機內建的陀螺儀與加速度計，將真實的傾斜動作轉化為遊戲中的角色控制。',
    icon: 'Compass',
  },
  {
    id: 'unity',
    name: 'Unity 遊戲引擎',
    description: '使用 Unity 6 打造精美的 3D 遊戲場景與物理互動，呈現栩栩如生的玩具世界。',
    icon: 'Gamepad2',
  },
  {
    id: 'react',
    name: 'React + Vite',
    description: '以 React 建構流暢的手機控制器介面，搭配 Vite 實現極速載入與開發體驗。',
    icon: 'Code',
  },
];

export const teamMembers = [
  {
    id: 1,
    name: '劉丞恩',
    role: '遊戲企劃 / Unity 開發',
    avatar: null,
    description: '負責遊戲機制設計與 Unity 場景開發。',
  },
  {
    id: 2,
    name: '許昀韋',
    role: '前端開發 / 網路架構',
    avatar: null,
    description: '負責 React 控制器、官網與 WebRTC 連線。',
  },
  {
    id: 3,
    name: '黃姿云',
    role: '美術設計 / UI 設計',
    avatar: null,
    description: '負責角色設計、場景美術與視覺呈現。',
  },
];

export const youtubeVideos = [
  {
    id: 'bkyDx8T4C8U',
    title: '宣傳預告（短版）',
    type: 'short',
  },
  {
    id: 'SDmLQXVDDQw',
    title: '宣傳預告（完整版）',
    type: 'long',
  },
];
