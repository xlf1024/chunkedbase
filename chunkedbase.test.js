import {encode, decode, encodeB85, decodeB85} from "./chunkedbase.mjs";

// Example from https://en.wikipedia.org/wiki/Ascii85
const wikiSource = "Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.";
const wikiAscii = "9jqo^BlbD-BleB1DJ+*+F(f,q/0JhKF<GL>Cj@.4Gp$d7F!,L7@<6@)/0JDEF<G%<+EV:2F!,O<DJ+*.@<*K0@<6L(Df-\\0Ec5e;DffZ(EZee.Bl.9pF\"AGXBPCsi+DGm>@3BB/F*&OCAfu2/AKYi(DIb:@FD,*)+C]U=@3BN#EcYf8ATD3s@q?d$AftVqCh[NqF<G:8+EV:.+Cf>-FD5W8ARlolDIal(DId<j@<?3r@:F%a+D58'ATD4$Bl@l3De:,-DJs`8ARoFb/0JMK@qB4^F!,R<AKZ&-DfTqBG%G>uD.RTpAKYo'+CT/5+Cei#DII?(E,9)oF*2M7/c";

console.assert(encodeB85(wikiSource) == wikiAscii, 'b85 encoding of "%s" should be "%s" but was "%s"', wikiSource, wikiAscii, encodeB85(wikiSource));
console.assert(decodeB85(wikiAscii, "string") == wikiSource, 'b85 decoding of "%s" should be "%s" but was "%s"', wikiAscii, wikiSource, decodeB85(wikiAscii, "string"));


// custom base53 draft
const b53Alphabet = "23456789ABCDEFGHKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz";
const wikib53 = "Gzh2CRURKNyghARYZagcWPS2FuT7AYCA7SB8H8FYpd8GagGssPRzeDqtMtrkCct8GaeeB8N6MAfKWPRzeDvnQPtTqbkR87kth5RNKH5LTNsAE26XQaeLBZN8GYUtDVMtYu2HFS9MQ7eS8GtXUXG8GzwZmL8H8BvEEPEAZRqZQPkUUYgPE2mVvvSTztsWeNdtwdTrNdtnkLSNaaYAeqNT6vUcCPEmTpS38HKrNUDNGDtCg6QQS7StsMtd2maEQPkxfnZRYZXbmUQ2EsqEfQPpC7HuPRrpdVDNnsrWMcS9Vt878Nb5QfTsNFqXHbn8HKrNUDRNGAP588HQ5S7vQCWrEvN8H8BvDtQQa3rdnRBEUFarQnbbR9KRmCyyd";
console.assert(encode(wikiSource, b53Alphabet, 5) == wikib53, 'b53 encoding of "%s" should be "%s" but was "%s"', wikiSource, wikib53, encode(wikiSource, b53Alphabet, 5));
console.assert(decode(wikib53, b53Alphabet, 5, "string") == wikiSource, 'b53 decoding of "%s" should be "%s" but was "%s"', wikib53, wikiSource, decode(wikiSource, b53Alphabet, 5, "string"));

// debugging: encode-decode pair:
const b64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
console.assert(decode(encode(wikiSource, b64Alphabet, 3),b64Alphabet,3,"string") == wikiSource);