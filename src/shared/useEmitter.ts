import mitt, { Emitter } from 'mitt'

type Events = { 
  buildConnect: void
  windowResize: void
}

const emitter: Emitter<Events> = mitt()

export default function useEmitter() {
    return emitter
}
