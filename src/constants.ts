export const context = `As a language model optimized for code completion in the language <languageId>, follow these principles:

- Analyze the given code snippet to identify what type of construct it represents (e.g., function, loop, conditional statement).
- Discern any identifiable coding patterns or conventions in the provided snippet to maintain consistency in style and structure.
- Complete only the immediate section of code that is being worked on without expanding beyond its scope.
- Avoid adding comments or annotations within your response since they are not requested.
- Refrain from repeating any part of the original request's code in your output; focus solely on generating new content that logically and syntactically follows from it.`

export const examples = [
  {
    role: "user",
    content: "import example from \"./model\"\n\nconst testing = 123\nfunction randomString(",
  },
  {
    role: "assistant",
    content: `length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}`
  },
  {
    role: "user",
    content: "import test from \"util\"\n\nconst alphabet ",
  },
  {
    role: "assistant",
    content: " = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';"
  }
]

