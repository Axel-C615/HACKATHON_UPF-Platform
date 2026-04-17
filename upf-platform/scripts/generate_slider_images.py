import zlib
import struct


def png_write(path, width, height, pixels):
    assert len(pixels) == width * height * 3
    def chunk(t, data):
        return struct.pack('!I', len(data)) + t + data + struct.pack('!I', zlib.crc32(t + data) & 0xffffffff)
    raw = b''.join(b'\x00' + pixels[i*3:(i+1)*3] for i in range(0, len(pixels), 3))
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(data)


def blend(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def circle_mask(x, y, cx, cy, r):
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def create(path, c1, c2):
    w, h = 1200, 650
    pixels = bytearray()
    for y in range(h):
        t = y / (h - 1)
        base = blend(c1, c2, t)
        for x in range(w):
            col = list(base)
            if circle_mask(x, y, int(w * 0.25), int(h * 0.4), 140):
                col = [min(255, c + 40) for c in col]
            if circle_mask(x, y, int(w * 0.7), int(h * 0.35), 100):
                col = [min(255, c + 30) for c in col]
            if circle_mask(x, y, int(w * 0.5), int(h * 0.6), 220):
                col = [min(255, c + 20) for c in col]
            pixels.extend(bytes(col))
    png_write(path, w, h, pixels)


create('public/images/image1.png', (39, 49, 122), (126, 147, 245))
create('public/images/image2.png', (14, 165, 233), (92, 33, 182))
create('public/images/image3.png', (5, 150, 105), (22, 163, 74))
print('images generated')
