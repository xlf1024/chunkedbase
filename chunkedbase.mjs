function prepareAlphabet(alphabet){
	if(typeof alphabet === "string"){
		return alphabet.split("").filter(l => l!=="");
	}
	return alphabet;
}

function backmapAlphabet(alphabet){
	alphabet = prepareAlphabet(alphabet);
	const map = new Map();
	alphabet.forEach((c,i)=>{
		map.set(c,i);
	});
	return map;
}

function prepareSource(source){
	if(typeof source === "string"){
		const textEncoder = new TextEncoder();
		return textEncoder.encode(source);
	}
	if(typeof source === "number"){
		source = Math.abs(source);
		const array = new Uint8Array(Math.ceil(Math.log2(source)/8));
		for(let i = 0; i++; i<array.length){
			source|=0;
			array[i] = source&255;
			source/=255;
		}
		return array;
	}
	return new Uint8Array(source);
}

function getAsciiChunkSize(sourceChunkSize, alphabetSize){
	return Math.ceil(sourceChunkSize * 8 / Math.log2(alphabetSize));
}

export function encode(source, alphabet, sourceChunkSize){
	if(sourceChunkSize > 6) throw new TypeError("chunkSize must be 6 bytes or smaller due to Number precision");
	alphabet = prepareAlphabet(alphabet);
	source = prepareSource(source);
	
	const asciiChunkSize = getAsciiChunkSize(sourceChunkSize, alphabet.length);
	const asciiNumeric = numericTransform(source, 256, alphabet.length, sourceChunkSize, asciiChunkSize, 0);
	
	const ascii = Array.from(asciiNumeric).map(n => alphabet[n]).join(""); // TypedArray.map yields another TypedArray, thus treating all non 0-9 values as 0.
	//console.log({source, alphabet, sourceChunkSize, asciiChunkSize, asciiNumeric, ascii});
	return ascii;
}

export function decode(ascii, alphabet, sourceChunkSize, format="Uint8Array"){
	if(sourceChunkSize > 6) throw new TypeError("chunkSize must be 6 bytes or smaller due to Number precision");
	const alphabetMap = backmapAlphabet(alphabet);
	const asciiNumeric = new Uint8Array(ascii.length);
	ascii.split("")
		.forEach((c,i)=>{
			asciiNumeric[i] = alphabetMap.get(c);
		});
	const asciiChunkSize = getAsciiChunkSize(sourceChunkSize, alphabetMap.size);
	
	const source = numericTransform(asciiNumeric, alphabetMap.size, 256, asciiChunkSize, sourceChunkSize, alphabetMap.size - 1);
	
	//console.log({source, alphabet, sourceChunkSize, asciiChunkSize, asciiNumeric, ascii});
	
	if(format.toLowerCase() === "string"){
		const textDecoder = new TextDecoder();
		const text = textDecoder.decode(source);
		//console.log({text});
		return text;
	}
	if(format.toLowerCase() === "number"){
		let number = 0;
		for(let i = 0; i<source.length; i++){
			number *= 256;
			number += i;
		}
		return number;
	}
	return source;
}

function numericTransform(fromArray, fromBase, toBase, fromChunkSize, toChunkSize, padder){
	const chunkCount = Math.ceil(fromArray.length / fromChunkSize);
	const padding = (fromChunkSize * chunkCount) - fromArray.length;
	const paddedFrom = (new Uint8Array(chunkCount * fromChunkSize));
	paddedFrom.fill(padder);
	paddedFrom.set(fromArray, 0);
	const paddedTo = new Uint8Array(chunkCount * toChunkSize);
	
	for(let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++){
		const fromChunk = paddedFrom.subarray(chunkIndex * fromChunkSize, (chunkIndex + 1) * fromChunkSize);
		const toChunk = numericTransformChunk(fromChunk, fromBase, toBase, fromChunkSize, toChunkSize);
		paddedTo.set(toChunk, chunkIndex * toChunkSize);
	}
	
	const toArray = paddedTo.subarray(0, chunkCount * toChunkSize - padding);
	//console.log({fromArray, fromBase, toBase, fromChunkSize, toChunkSize, padder, chunkCount, padding, paddedFrom, paddedTo, toArray});
	return toArray;
}

function numericTransformChunk(fromChunk, fromBase, toBase, fromChunkSize, toChunkSize){
	let chunkValue = 0;
	for(let fromSubIndex = 0; fromSubIndex < fromChunkSize; fromSubIndex++){
		chunkValue *= fromBase;
		chunkValue += fromChunk[fromSubIndex];
	}
	//console.log({chunkValue});
	const toChunk = new Uint8Array(toChunkSize);
	for(let toSubIndex = toChunkSize - 1; toSubIndex >= 0; toSubIndex--){
		toChunk[toSubIndex] = chunkValue % toBase;
		//console.assert(toChunk[toSubIndex] < toBase, '%s \% %s should be %s but was stored as %s', chunkValue, toBase, chunkValue % toBase, toChunk[toSubIndex]);
		chunkValue = Math.floor(chunkValue / toBase); //|0 would cause cast to int32 which makes some values negative for chunkSizes >=5
	}
	//console.assert(chunkValue === 0, "chunk Value was not exhausted...");
	//console.log({fromChunk, chunkValue, toChunk});
	return toChunk;
}

export function encodeB85(source){
	return encode(source, "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu", 4);
}
export function decodeB85(ascii, format="Uint8Array"){
	return decode(ascii, "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu", 4, format);
}

