import { atom } from "recoil";

export const buildModeState = atom({
  key: "buildModeState",
  default: false,
});


// 클릭한 녀석 포지션
export const dragPositionState = atom({
  key: "dragPositionState",
  default: null,
});

// 클릭한 녀석이 누군지
export const draggedItemState = atom({
  key: "draggedItem",
  default: null,
});

// 그냥 Item 전체
export const ItemsState = atom({
  key: "ItemsState",
  default: null,
});


// 클릭한 녀석 회전 상태
export const ItemRotateState = atom({
  key: "ItemRotateState",
  default: null,
});


export const checkState = atom({
  key:"checkState",
  default: null,
})
