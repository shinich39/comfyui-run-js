# comfyui-run-js

Manipulate workflow via javascript on node.

## Usage  

Add node > utils > Run JS

## Usage with AI

You can use an AI assistant to generate RunJS scripts.
Pass the [SKILL.md](./SKILL.md) URL and describe what you want.

```
Read this document and write a RunJS script:
https://raw.githubusercontent.com/shinich39/comfyui-run-js/main/SKILL.md

[describe what you want]

Rules:
- Output only the JavaScript code, no explanation.
- Do not wrap in markdown code blocks.
```

**Example:**

```
Read this document and write a RunJS script:
https://raw.githubusercontent.com/shinich39/comfyui-run-js/main/SKILL.md

Randomize the seed on KSampler, set steps to a random value
between 10 and 30, then generate.

Rules:
- Output only the JavaScript code, no explanation.
- Do not wrap in markdown code blocks.
```

Paste the output directly into the `text` widget of a RunJS node.