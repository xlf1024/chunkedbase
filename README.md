# chunkedbase
Library for encodings **similar to** Ascii85

The encoding used is based on the Adobe version described in [https://en.wikipedia.org/wiki/Ascii85#Adobe_version](https://en.wikipedia.org/wiki/Ascii85#Adobe_version), however it is **not** compatible. Differences are:
- alphabet and chunk size are parameters
- null chunks are not replaced with `z`, instead they are encoded in full.

## usage
es6 import:
```
import {encode, decode} from "./chunkedbase.mjs"
```

encode:
```
ascii = encode(source, alphabet, chunkSize);
```

decode:
```
source = encode(ascii, alphabet, chunkSize, format);
```

parameters:
- `source`: a `Uint8Array`, `String` or `Number` that you want to encode
- `ascii`: the encoded version as a `String`. Technically does not need to be Ascii-only, but usually will be.
- `alphabet`: the alphabet to use for encoding, as a `String` or as an `Array`. E.g. hexadecimal would be `"0123456789abcdef"`. When using an `Array`, each entry must be a single-character `String`.
- `chunkSize`: the size of each chunk in bytes. Must be an integer value `<=6` due to javascript Number precision.
- `format`: for decoding only; `Uint8Array` (default), `String` or `Number`; case-insensitive. Is determined based on javascript `typeof` for encoding.

## choosing alphabet and chunk size
examples:

| |alphabet|alphabet size|chunk size| |
|:-|:-|-:|-:|:-|
|hexadecimal|`"0123456789abcdef"`|16|1| |
|base64|`"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`|64|3|differs in how padding is handled; use `atob()` and `btoa()` instead. (probably faster as well)|
|ascii85|``"!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu"``|85|4| |most similar, however this library does not replace all zero chunks by the single character `z`, and will fail when reading that.

chosing custom formats:
Based on the number of bytes each chunk spans in the source, the number of characters each chunk contains is calculated automatically such that all possible values can be encoded. The formula is `character_count = ceil(byte_count * 8 / log2(alphabet_size))`. The ratio `character_count / byte_count` gives the size increase due to encoding, thus minimal values are desirable. However, a large `byte_count` means that often padding will be needed, though some of it is removed as described in the wikipedia article linked above. This only matters for short payloads, obviously.

some useful combinations:

|alphabet size|bytes per chunk (`chunkSize`)|characters per chunk|size ratio|
|-:|-:|-:|-:|
|16|1|2|2.00|
|21|6|11|1.83|
|22|5|9|1.80|
|24|4|7|1.75|
|28|3|5|1.67|
|32|5|8|1.60|
|41|2|3|1.50|
|53|5|7|1.40|
|64|3|4|1.33|
|85|4|5|1.25|

These represent the optimal chunk sizes for each alphabet size. Alphabet sizes not listed here will perform identical to the next lower entry in this chart, however they may be useful if you decide to limit the chunk size below 6 bytes.
