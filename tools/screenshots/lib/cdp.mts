// Minimal Chrome DevTools Protocol driver used by the screenshot pipeline.
// Uses the WebSocket built into the Node versions supported by the package.
import fs from 'node:fs'

const PORT = process.env.CDP_PORT || 9222

interface Target {
  type: string
  webSocketDebuggerUrl: string
}

interface EvaluationResult {
  result: { value?: unknown }
  exceptionDetails?: { exception?: { description?: string } }
}

interface ScreenshotOptions {
  format: 'png'
  fromSurface: boolean
  clip?: { x: number; y: number; width: number; height: number; scale: number }
}

type Commands = {
  'Page.enable': [undefined, unknown]
  'Page.navigate': [{ url: string }, unknown]
  'Page.reload': [undefined, unknown]
  'Page.captureScreenshot': [ScreenshotOptions, { data: string }]
  'Runtime.enable': [undefined, unknown]
  'Runtime.evaluate': [{ expression: string; returnByValue: boolean; awaitPromise: boolean; userGesture: boolean }, EvaluationResult]
  'Input.dispatchKeyEvent': [{ type: 'keyDown' | 'keyUp'; key: string; code: string; windowsVirtualKeyCode?: number; text?: string }, unknown]
  'Input.dispatchMouseEvent': [{ type: 'mouseMoved'; x: number; y: number }, unknown]
  'Input.insertText': [{ text: string }, unknown]
  'Emulation.setDeviceMetricsOverride': [{ width: number; height: number; deviceScaleFactor: number; mobile: boolean }, unknown]
}

type CommandParams<K extends keyof Commands> = Commands[K][0] extends undefined
  ? [params?: undefined]
  : [params: Commands[K][0]]

interface ResponseMessage {
  id?: number
  error?: unknown
  result?: unknown
}

interface PendingResponse {
  resolve(value: unknown): void
  reject(error: Error): void
}

async function target() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json() as Target[]
  const page = list.find(t => t.type === 'page')
  if (!page) throw new Error('no page target')
  return page
}

export class Session {
  readonly ws: WebSocket
  private id = 0
  private readonly pending = new Map<number, PendingResponse>()

  constructor(ws: WebSocket) {
    this.ws = ws
    ws.addEventListener('message', event => {
      const msg: ResponseMessage = JSON.parse(event.data as string)
      if (!msg.id) return
      const response = this.pending.get(msg.id)
      if (!response) return
      this.pending.delete(msg.id)
      if (msg.error) response.reject(new Error(JSON.stringify(msg.error)))
      else response.resolve(msg.result)
    })
  }

  send<K extends keyof Commands>(method: K, ...[params]: CommandParams<K>): Promise<Commands[K][1]> {
    const id = ++this.id
    // The response id correlates the WebSocket reply with this command's result type.
    return new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params: params === undefined ? {} : params }))
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`timeout: ${method}`))
      }, 30000)
    }) as Promise<Commands[K][1]>
  }
}

export async function connect() {
  const page = await target()
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise<Event>((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  const session = new Session(ws)
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  // Pin the content box and DPR when the host window cannot be sized exactly
  // (Windows headless Chrome subtracts frame pixels). Same numbers run.sh gets
  // from --window-size/--force-device-scale-factor on macOS, so crop.py's 4x
  // constants and the 1440x900 layout still hold.
  const viewport = /^(\d+)x(\d+)@(\d+(?:\.\d+)?)$/.exec(process.env.SHOT_VIEWPORT || '')
  if (viewport) {
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: Number(viewport[1]),
      height: Number(viewport[2]),
      deviceScaleFactor: Number(viewport[3]),
      mobile: false,
    })
  }
  return session
}

export async function evaluate<T = unknown>(session: Session, expression: string): Promise<T> {
  const result = await session.send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true, userGesture: true,
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails))
  }
  return result.result.value as T
}

export async function shot(session: Session, file: string) {
  const { data } = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  fs.writeFileSync(file, Buffer.from(data, 'base64'))
  return file
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
