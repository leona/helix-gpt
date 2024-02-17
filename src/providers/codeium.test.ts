import { expect, test } from "bun:test";
import Codeium from "./codeium"

const codeium = new Codeium()

test("completion", async () => {
  (() =>
    Promise.resolve({
      json: () => Promise.resolve({
        "state": {
          "state": "CODEIUM_STATE_SUCCESS",
          "message": "Generated 6 completions"
        },
        "completionItems": [
          {
            "completion": {
              "completionId": "4872d12f-1931-4f5d-9848-a2feee99da2e",
              "text": "const alphabet = 'abcdefghijklmnopqrstuvwxyz'",
              "stop": "\n\n",
              "score": -1.3279907496119012,
              "tokens": [
                "6",
                "68612",
                "3961"
              ],
              "decodedTokens": [
                "'",
                "abcdefghijklmnopqrstuvwxyz",
                "'\n\n"
              ],
              "probabilities": [
                0.2410283237695694,
                0.634307324886322,
                0.21950317919254303
              ],
              "adjustedProbabilities": [
                0.17243333160877228,
                0.9864425659179688,
                0.15022589266300201
              ],
              "generatedLength": "3",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "'abcdefghijklmnopqrstuvwxyz'\n\n"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              }
            ]
          },
          {
            "completion": {
              "completionId": "4eab8e74-ecdb-461b-9932-b08e172b4426",
              "text": "const alphabet = \"abcdefghijklmnopqrstuvwxyz\"\nconst numbers = \"0123456789\"",
              "stop": "<|endofmiddle|>",
              "score": -1.7445913846352432,
              "tokens": [
                "1",
                "68612",
                "702",
                "1040",
                "5219",
                "284",
                "330",
                "11531",
                "12901",
                "17458",
                "24",
                "702",
                "100299"
              ],
              "decodedTokens": [
                "\"",
                "abcdefghijklmnopqrstuvwxyz",
                "\"\n",
                "const",
                " numbers",
                " =",
                " \"",
                "012",
                "345",
                "678",
                "9",
                "\"\n",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.4467959403991699,
                0.5885083675384521,
                0.43643850088119507,
                0.7753089666366577,
                0.13237497210502625,
                0.9959436058998108,
                0.5902878642082214,
                0.6605963706970215,
                0.9968718886375427,
                0.99399334192276,
                0.9554901123046875,
                0.5480461716651917,
                0.06993699073791504
              ],
              "adjustedProbabilities": [
                0.8067222237586975,
                0.9805918335914612,
                0.828681468963623,
                0.998873770236969,
                0.16544978320598602,
                1,
                0.8822909593582153,
                0.8479676246643066,
                0.9999998807907104,
                0.9999998807907104,
                0.9998165965080261,
                0.7556309103965759,
                1
              ],
              "generatedLength": "13",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "\"abcdefghijklmnopqrstuvwxyz\"\nconst numbers = \"0123456789\"\n<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              },
              {
                "text": "const numbers = \"0123456789\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_BLOCK"
              }
            ]
          },
          {
            "completion": {
              "completionId": "27b2a63d-3b06-472b-ae08-62711cffc6e1",
              "text": "const alphabet = \"abcdefghijklmnopqrstuvwxyz\"\nconst number = 123",
              "stop": "<|endofmiddle|>",
              "score": -1.8225764230508985,
              "tokens": [
                "1",
                "68612",
                "702",
                "1040",
                "1396",
                "284",
                "220",
                "4513",
                "100299"
              ],
              "decodedTokens": [
                "\"",
                "abcdefghijklmnopqrstuvwxyz",
                "\"\n",
                "const",
                " number",
                " =",
                " ",
                "123",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.4467959403991699,
                0.5885083675384521,
                0.43643850088119507,
                0.7753089666366577,
                0.11147090047597885,
                0.9744853973388672,
                0.8618786334991455,
                0.6927213668823242,
                0.07997503876686096
              ],
              "adjustedProbabilities": [
                0.8067222237586975,
                0.9805918335914612,
                0.828681468963623,
                0.998873770236969,
                0.10766022652387619,
                0.9999990463256836,
                0.9961197376251221,
                0.9964505434036255,
                1
              ],
              "generatedLength": "9",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "\"abcdefghijklmnopqrstuvwxyz\"\nconst number = 123<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              },
              {
                "text": "const number = 123",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_BLOCK"
              }
            ]
          },
          {
            "completion": {
              "completionId": "714c6488-f5e0-41d3-a0c1-daabe410f694",
              "text": "const alphabet = \"abcdefghijklmnopqrstuvwxyz\"",
              "stop": "<|endofmiddle|>",
              "score": -1.9039497503356135,
              "tokens": [
                "1",
                "68612",
                "1",
                "100299"
              ],
              "decodedTokens": [
                "\"",
                "abcdefghijklmnopqrstuvwxyz",
                "\"",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.4467959403991699,
                0.5885083675384521,
                0.1405881941318512,
                0.4958511292934418
              ],
              "adjustedProbabilities": [
                0.8067222237586975,
                0.9805918335914612,
                0.048803623765707016,
                1
              ],
              "generatedLength": "4",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "\"abcdefghijklmnopqrstuvwxyz\"<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              }
            ]
          },
          {
            "completion": {
              "completionId": "adac237b-fd67-443a-a5f7-7c9be9e45215",
              "text": "const alphabet = 'abcdefghijklmnopqrstuvwxyz'\nconst numbers = '0123456789'",
              "stop": "<|endofmiddle|>",
              "score": -1.9936787108188172,
              "tokens": [
                "6",
                "68612",
                "1270",
                "1040",
                "5219",
                "284",
                "364",
                "11531",
                "12901",
                "17458",
                "24",
                "6",
                "100299"
              ],
              "decodedTokens": [
                "'",
                "abcdefghijklmnopqrstuvwxyz",
                "'\n",
                "const",
                " numbers",
                " =",
                " '",
                "012",
                "345",
                "678",
                "9",
                "'",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.2410283237695694,
                0.634307324886322,
                0.4231034517288208,
                0.7778605818748474,
                0.13147321343421936,
                0.9941889047622681,
                0.5793276429176331,
                0.6870170831680298,
                0.9950946569442749,
                0.994903564453125,
                0.9754427671432495,
                0.3961578607559204,
                0.9915995597839355
              ],
              "adjustedProbabilities": [
                0.17243333160877228,
                0.9864425659179688,
                0.7749241590499878,
                0.998525083065033,
                0.12466666847467422,
                0.9999997615814209,
                0.866196870803833,
                0.8840391039848328,
                0.9999995231628418,
                1,
                0.9999654293060303,
                0.3785102367401123,
                1
              ],
              "generatedLength": "13",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "'abcdefghijklmnopqrstuvwxyz'\nconst numbers = '0123456789'<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              },
              {
                "text": "const numbers = '0123456789'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_BLOCK"
              }
            ]
          },
          {
            "completion": {
              "completionId": "f173d8b9-adf9-4246-8156-c1fa0968c061",
              "text": "const alphabet = 'abcdefghijklmnopqrstuvwxyz'\nconst number = 123",
              "stop": "<|endofmiddle|>",
              "score": -2.0865020598094772,
              "tokens": [
                "6",
                "68612",
                "1270",
                "1040",
                "1396",
                "284",
                "220",
                "4513",
                "100299"
              ],
              "decodedTokens": [
                "'",
                "abcdefghijklmnopqrstuvwxyz",
                "'\n",
                "const",
                " number",
                " =",
                " ",
                "123",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.2410283237695694,
                0.634307324886322,
                0.4231034517288208,
                0.7778605818748474,
                0.09618785977363586,
                0.9696021676063538,
                0.8942249417304993,
                0.6518176198005676,
                0.076181560754776
              ],
              "adjustedProbabilities": [
                0.17243333160877228,
                0.9864425659179688,
                0.7749241590499878,
                0.998525083065033,
                0.05707655847072601,
                0.9999984502792358,
                0.9980985522270203,
                0.9948039650917053,
                1
              ],
              "generatedLength": "9",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "originalText": "'abcdefghijklmnopqrstuvwxyz'\nconst number = 123<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "'abcdefghijklmnopqrstuvwxyz'",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              },
              {
                "text": "const number = 123",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_BLOCK"
              }
            ]
          }
        ],
        "filteredCompletionItems": [
          {
            "completion": {
              "completionId": "3b5d4475-751d-46b2-b6d3-77bfe0d10bd8",
              "text": "const alphabet = \"abcdefghijklmnopqrstuvwxyz\"",
              "stop": "\n\n",
              "score": -1.5627320636692759,
              "tokens": [
                "1",
                "68612",
                "702",
                "1040",
                "3187",
                "284",
                "220",
                "4513",
                "271"
              ],
              "decodedTokens": [
                "\"",
                "abcdefghijklmnopqrstuvwxyz",
                "\"\n",
                "const",
                " example",
                " =",
                " ",
                "123",
                "\n\n"
              ],
              "probabilities": [
                0.4467959403991699,
                0.5885083675384521,
                0.43643850088119507,
                0.7753089666366577,
                0.23414745926856995,
                0.9090325832366943,
                0.716852068901062,
                0.8863968253135681,
                0.5485243797302246
              ],
              "adjustedProbabilities": [
                0.8067222237586975,
                0.9805918335914612,
                0.828681468963623,
                0.998873770236969,
                0.6884543299674988,
                0.9997839331626892,
                0.9740128517150879,
                0.9997902512550354,
                0.7436034679412842
              ],
              "generatedLength": "9",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "filterReasons": [
                "FILTER_REASON_DUPLICATE"
              ],
              "originalText": "\"abcdefghijklmnopqrstuvwxyz\"\nconst example = 123\n\n"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              }
            ]
          },
          {
            "completion": {
              "completionId": "f9386bed-70fb-4760-8e0c-4ccf4b20a713",
              "text": "const alphabet = \"abcdefghijklmnopqrstuvwxyz\"\nconst numbers = \"0123456789\"",
              "stop": "<|endofmiddle|>",
              "score": -1.7445913846352432,
              "tokens": [
                "1",
                "68612",
                "702",
                "1040",
                "5219",
                "284",
                "330",
                "11531",
                "12901",
                "17458",
                "24",
                "702",
                "100299"
              ],
              "decodedTokens": [
                "\"",
                "abcdefghijklmnopqrstuvwxyz",
                "\"\n",
                "const",
                " numbers",
                " =",
                " \"",
                "012",
                "345",
                "678",
                "9",
                "\"\n",
                "<|endofmiddle|>"
              ],
              "probabilities": [
                0.4467959403991699,
                0.5885083675384521,
                0.43643850088119507,
                0.7753089666366577,
                0.13237497210502625,
                0.9959436058998108,
                0.5902878642082214,
                0.6605963706970215,
                0.9968718886375427,
                0.99399334192276,
                0.9554901123046875,
                0.5480461716651917,
                0.06993699073791504
              ],
              "adjustedProbabilities": [
                0.8067222237586975,
                0.9805918335914612,
                0.828681468963623,
                0.998873770236969,
                0.16544978320598602,
                1,
                0.8822909593582153,
                0.8479676246643066,
                0.9999998807907104,
                0.9999998807907104,
                0.9998165965080261,
                0.7556309103965759,
                1
              ],
              "generatedLength": "13",
              "stopReason": "STOP_REASON_STOP_PATTERN",
              "filterReasons": [
                "FILTER_REASON_DUPLICATE"
              ],
              "originalText": "\"abcdefghijklmnopqrstuvwxyz\"\nconst numbers = \"0123456789\"\n<|endofmiddle|>"
            },
            "range": {
              "endOffset": "17",
              "startPosition": {},
              "endPosition": {
                "col": "17"
              }
            },
            "source": "COMPLETION_SOURCE_NETWORK",
            "completionParts": [
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE",
                "prefix": "const alphabet = "
              },
              {
                "text": "\"abcdefghijklmnopqrstuvwxyz\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_INLINE_MASK",
                "prefix": "const alphabet = "
              },
              {
                "text": "const numbers = \"0123456789\"",
                "offset": "17",
                "type": "COMPLETION_PART_TYPE_BLOCK"
              }
            ]
          }
        ],
        "promptId": "1498d309-fca8-4c4d-aac7-5520abfd9856"
      }),
      ok: true
    })
  )

  const contents = {
    contentBefore: "const alphabet = ",
    contentAfter: "const example = 123"
  }
  // const result = await codeium.completion(contents, "file:///app/test.ts", "typescript", 3)
  // console.log(result)
  // expect(result.length).toEqual(3)
})


