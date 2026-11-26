import zlib from 'node:zlib';

if (typeof (zlib as any).createZstdDecompress !== 'function') {
  (zlib as any).createZstdDecompress = function () {
    return {
      on() { return this; },
      once() { return this; },
      emit() { return true; },
      pipe() { return this; },
    };
  };
}

if (!(zlib as any).constants) {
  (zlib as any).constants = {};
}

if ((zlib as any).constants.ZSTD_d_windowLogMax === undefined) {
  (zlib as any).constants.ZSTD_d_windowLogMax = 23;
}
