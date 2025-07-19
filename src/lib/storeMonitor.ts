import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import useStore from '../store/store'

const monitorStore = create(
  subscribeWithSelector(() => (useStore.getState().group.enabled))
)

const unsubLowHP = monitorStore.subscribe(
    (state) => state.group.enabled,
    (state, prevState) => console.log(state, prevState),
)