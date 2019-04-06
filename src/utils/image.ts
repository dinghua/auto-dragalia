import { loadingText, retryButtonBlue, retryButtonRed } from '@/images';
import { wait } from '@/utils/wait';

images.requestScreenCapture(false);
const screenCache: {
  image: Image;
  updated: Date;
} = {
  image: images.captureScreen(),
  updated: new Date()
};
export function captureScreenWithCache(maxAge: number = 500): Image {
  const now: Date = new Date();
  if (now.getTime() - screenCache.updated.getTime() > maxAge) {
    screenCache.image = images.captureScreen();
    screenCache.updated = now;
  }

  return screenCache.image;
}

export function tryFindAnyImage(
  images: Image[],
  options?: IFindImageOptions
): Point | undefined {
  for (const i of images) {
    const pos: Point | undefined = tryFindImageInScreen(i, options);
    if (pos) {
      return pos;
    }
  }
}

export function tryFindImageInScreen(
  ...args: Parameters<typeof findImageInScreen>
): Point | undefined {
  try {
    return findImageInScreen(...args);
  } catch {
    return;
  }
}

export function findImageInScreen(
  image: Image,
  options?: IFindImageOptions
): Point {
  const { id = '<id-not-set>' } = options || {};
  const ret: Point | null = images.findImage(
    captureScreenWithCache(),
    image,
    options
  );
  if (ret === null) {
    throw new Error(`未找到图像: ${id}`);
  }
  console.verbose(`Found image: ${id}: ${ret}`);

  return ret;
}

export function clickImage(image: Image, options?: IFindImageOptions): Point {
  const pos: Point = findImageInScreen(image, options);
  click(pos.x, pos.y);

  return pos;
}

export function tryClickImage(
  image: Image,
  options?: IFindImageOptions
): Point | undefined {
  try {
    return clickImage(image, options);
  } catch (err) {
    return;
  }
}

export async function waitAndClickImage(
  ...args: Parameters<typeof waitImage>
): Promise<Point> {
  const pos: Point = await waitImage(...args);
  click(pos.x, pos.y);

  return pos;
}

export async function waitImage(
  image: Image,
  options?: IWaitImageOptions
): Promise<Point> {
  return waitAnyImage([image], options);
}

let waitingCount: number = 0;

export async function waitAnyImage(
  images: Image[],
  options?: IWaitImageOptions
): Promise<Point> {
  waitingCount += 1;
  const {
    timeout = 600e3,
    delay = 500,
    findOptions = {},
    onDelay = (): void | Promise<void> => undefined,
    id = String(waitingCount)
  } = options || {};

  await wait(delay);
  const startTime: Date = new Date();
  let roundStartTime: Date = startTime;
  while (new Date().getTime() - startTime.getTime() < timeout) {
    const ret: Point | undefined = tryFindAnyImage(images, {
      ...findOptions,
      id
    });
    if (ret) {
      return ret;
    }
    console.verbose(`Waiting image: ${id}`);
    await onDelay();
    tryClickImage(retryButtonRed, { id: 'retry-button-red' });
    tryClickImage(retryButtonBlue, { id: 'retry-button-blue' });
    const now: Date = new Date();
    await wait(delay - (now.getTime() - roundStartTime.getTime()));
    roundStartTime = now;
  }
  throw new Error('等待超时');
}

export async function waitLoading(delay: number = 500): Promise<void> {
  let roundStartTime: Date = new Date();
  while (tryFindImageInScreen(loadingText, { id: 'loading-text' })) {
    tryClickImage(retryButtonRed, { id: 'retry-button-red' });
    tryClickImage(retryButtonBlue, { id: 'retry-button-blue' });
    const now: Date = new Date();
    await wait(delay - (now.getTime() - roundStartTime.getTime()));
    roundStartTime = now;
  }
}

interface IWaitImageOptions {
  timeout?: number;
  delay?: number;
  findOptions?: images.FindImageOptions;
  id?: string;
  onDelay?(): void | Promise<void>;
}

interface IFindImageOptions extends images.FindImageOptions {
  id?: string;
}
