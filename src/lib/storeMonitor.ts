import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import useStore from '../store/store'

// https://github.com/pmndrs/zustand?tab=readme-ov-file#using-subscribe-with-selector

const monitorStore = create(
  subscribeWithSelector(() => (useStore.getState().group.enabled))
)

const unsubLowHP = monitorStore.subscribe(
    (state) => state.group.enabled,
    (state, prevState) => console.log(state, prevState),
)