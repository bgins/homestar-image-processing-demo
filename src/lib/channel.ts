import { get as getStore } from 'svelte/store'

import type { Maybe } from '$lib'

import { activeWorkflowStore, channelStore } from '../stores'
import { fail, handleMessage } from './workflow'

// TYPES


export type Channel = {
  close: () => void
  send: (data: ChannelData) => void
}

export type ChannelOptions = {
  handleMessage: (event: MessageEvent) => void
}

export type ChannelData = string | ArrayBufferLike | Blob | ArrayBufferView


export async function connect() {
  console.log('endpoint', import.meta.env)
  const channel = await createWssChannel(import.meta.env.VITE_WEBSOCKET_ENDPOINT, { handleMessage })

  channelStore.set(channel)

  setInterval(() => {
    channel.send('ping')

    setTimeout(() => {
      const activeWorkflow = getStore(activeWorkflowStore)

      if (!activeWorkflow) return

      // Check failed ping count for lost connection
      const failedPingCount = activeWorkflow.failedPingCount

      if (failedPingCount > 3) {
        // Fail the workflow
        fail(activeWorkflow.id)
      } else {
        // Assume failure. We reset the count to zero in the message handler on pong.
        activeWorkflowStore.update(store => store ? ({ ...store, failedPingCount: failedPingCount + 1 }) : null)
      }
    }, 10000)

  }, 10000)
}

export const createWssChannel = async (
  endpoint: string,
  options: ChannelOptions
): Promise<Channel> => {
  const { handleMessage } = options

  const topic = `ipvm-homestar`
  console.log('Opening channel', topic)

  const socket: Maybe<WebSocket> = new WebSocket(endpoint)
  await waitForOpenConnection(socket)
  socket.onmessage = handleMessage
  socket.onerror = (err) => { console.log('socket error', err) }

  const send = publishOnWssChannel(socket)
  const close = closeWssChannel(socket)

  return {
    send,
    close
  }
}

const waitForOpenConnection = async (socket: WebSocket): Promise<void> => {
  return new Promise((resolve, reject) => {
    socket.onopen = () => resolve()
    socket.onerror = () => reject('Websocket channel could not be opened')
  })
}

export const closeWssChannel = (socket: Maybe<WebSocket>): () => void => {
  return function () {
    if (socket) socket.close(1000)
  }
}

export const publishOnWssChannel = (socket: Maybe<WebSocket>): (data: ChannelData) => void => {
  return function (data: ChannelData) {
    const binary = typeof data === 'string'
      ? new TextEncoder().encode(data).buffer
      : data

    socket?.send(binary)
  }
}
