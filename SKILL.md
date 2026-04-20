# ComfyUI RunJS Skill Guide

You are controlling a ComfyUI workflow via the **RunJS** node.
RunJS executes arbitrary JavaScript inside ComfyUI's frontend context.
Write code in the `text` widget of a RunJS node; it runs when triggered.

---

## Execution Context

Every script runs with these variables pre-bound:

| Variable | Type | Description |
|---|---|---|
| `SELF` | `Node` | The RunJS node itself |
| `COMMAND` | `string` | The script source currently executing |
| `STATE` | `Record<string, any>` | Persists across runs within the same node instance |
| `PROPS` | `Record<string, any>` | Persists to `node.properties.PROPS` (survives reload) |
| `NODES` | `Node[]` | All nodes in the current graph |
| `GROUPS` | `Group[]` | All groups in the current graph |
| `LINKS` | `Link[]` | All links in the current graph |
| `ARGS` | `any[]` | Arguments passed by the triggering event |
| `QUEUE_MODE` | `"disabled" \| "instant" \| "change"` | Current queue mode |
| `BATCH_COUNT` | `number` | Current batch count |

---

## Events (when a RunJS node fires)

Set the `event` widget of a RunJS node to one of:

| Event | Trigger |
|---|---|
| `comfyui_setup` | Once after all extensions load |
| `workflow_changed` | When the active workflow tab changes |
| `before_queued` | Just before a prompt is queued |
| `after_queued` | After a prompt is queued (`promptQueued`) |
| `status` | WebSocket status update |
| `progress` | Generation progress tick |
| `executing` | A node starts executing |
| `executed` | A node finishes executing |
| `execution_start` | Entire execution begins |
| `execution_success` | Entire execution succeeds |
| `execution_error` | Execution error |
| `execution_cached` | Cached result used |
| `graph_changed` | Graph structure changed |
| *(button)* | Manual "Run" button click or `run(node)` call |

---

## API Reference

### Node / Group Lookup

```js
Node(query)          // Find first node by numeric ID, title string, or type string
Nodes(query)         // Find all matching nodes → Node[]
Group(title)         // Find first group by title string
Groups(title)        // Find all matching groups → Group[]
```

**Examples:**
```js
const sampler = Node("KSampler");          // by type
const myNode  = Node("My Custom Title");   // by title
const byId    = Node(42);                  // by numeric ID
const all     = Nodes("CLIPTextEncode");   // all nodes of a type
```

---

### Widget Values

```js
getValues(node)              // → { widgetName: value, ... }
setValues(node, { k: v })    // set one or more widget values
```

`getValue` / `setValue` are aliases for the above.

**Examples:**
```js
const vals = getValues(Node("KSampler"));
// { seed: 123, steps: 20, cfg: 7, ... }

setValues(Node("KSampler"), { steps: 30, cfg: 8 });
setValues(Node("CLIPTextEncode"), { text: "a cat on a roof" });
```

---

### Node Control

```js
bypass(...nodesOrGroups)    // Set mode = 4 (bypassed)
unbypass(...nodesOrGroups)  // Set mode = 0 (active)
pin(...nodesOrGroups)       // Pin node position
unpin(...nodesOrGroups)     // Unpin node position
select(...nodesOrGroups)    // Select nodes on canvas
remove(...nodesOrGroups)    // Remove nodes/groups from graph
```

Arguments can be Node objects, Group objects, IDs, titles, or types.

**Examples:**
```js
bypass("VAEDecode");
unbypass(Node("LoraLoader"), Group("Upscale Pipeline"));
remove(Node("PrimitiveNode"));
```

---

### Node Creation & Connection

```js
create(type, values?, options?)   // Create and place a new node → Node
connect(outputNode, inputNode, outputSlotName?, inputSlotName?)
```

`create` options: `{ select: boolean, shiftY: number, before: boolean }`
If slot names are omitted, `connect` auto-matches by type.

**Examples:**
```js
const lora = create("LoraLoader", { lora_name: "my_lora.safetensors", strength_model: 0.8 });
connect(Node("CheckpointLoaderSimple"), lora);       // auto-match
connect(lora, Node("KSampler"), "MODEL", "model");   // explicit slots
```

---

### Queue & Generation

```js
generate()                      // Queue a prompt → Promise<void>
cancel()                        // Interrupt current execution → Promise<void>
getQueue()                      // → Promise<number> (running + pending count)
setQueueMode("disabled" | "instant" | "change")
setBatchCount(n)
run(...runJsNodes)              // Trigger other RunJS nodes programmatically
```

> **`await` works.** The script runs inside an `async` context, so `await generate()`, `await sleep()`, `await getQueue()` all work correctly.

**Examples:**
```js
// Queue 3 images
setBatchCount(3);
await generate();

// Cancel if queue is backed up
const depth = await getQueue();
if (depth > 5) await cancel();

// Chain another RunJS node
run(Node("Post Process"));
```

---

### Random / Generation Helpers

```js
generateSeed()                  // → safe random seed integer
generateFloat(min, max)         // → random float in [min, max]
generateInt(min, max)           // → random integer in [min, max]
random(...values)               // → pick one value at random
generatePlots(...arrays)        // → cartesian product as array of arrays
```

**Examples:**
```js
setValues(Node("KSampler"), { seed: generateSeed() });

const noise = generateFloat(0.0, 1.0);
const steps = generateInt(15, 35);

// All combinations of samplers × schedulers
const plots = generatePlots(
  ["euler", "dpmpp_2m"],
  ["karras", "normal"]
);
// → [["euler","karras"],["euler","normal"],["dpmpp_2m","karras"],["dpmpp_2m","normal"]]
```

---

### Toast Notifications

```js
showInfo(message, life?)      // blue info toast
showSuccess(message, life?)   // green success toast
showWarn(message, life?)      // yellow warning toast
showError(message, life?)     // red error toast
// life = display duration in ms (default 5000)
```

---

### Persistence Patterns

```js
// STATE: survives multiple Run clicks, lost on page reload
if (!STATE.count) STATE.count = 0;
STATE.count++;
showInfo(`Run #${STATE.count}`);

// PROPS: written to node.properties.PROPS, survives workflow save/load
PROPS.lastSeed = generateSeed();
setValues(Node("KSampler"), { seed: PROPS.lastSeed });
```

---

## Common Patterns

### Randomize seed before each queue

```js
setValues(Node("KSampler"), { seed: generateSeed() });
await generate();
```

### Toggle a node on/off

```js
const n = Node("DetailerFix");
if (n.mode === 0) bypass(n);
else unbypass(n);
```

### Sweep through prompt variants

```js
const prompts = ["a cat", "a dog", "a bird"];
const idx = (STATE.idx ?? -1) + 1;
STATE.idx = idx % prompts.length;
setValues(Node("CLIPTextEncode"), { text: prompts[STATE.idx] });
await generate();
```

### Cartesian product batch

```js
const plots = generatePlots([10, 20, 30], ["euler", "dpmpp_2m"]);
for (const [steps, sampler] of plots) {
  setValues(Node("KSampler"), { steps, sampler_name: sampler, seed: generateSeed() });
  await generate();
  await sleep(500); // small gap between queues
}
```

### Check queue before generating

```js
const depth = await getQueue();
if (depth === 0) {
  setValues(Node("KSampler"), { seed: generateSeed() });
  await generate();
} else {
  showWarn(`Queue busy (${depth} pending), skipping.`);
}
```

### Misc

```js
sleep(ms)    // → Promise<void> delay
```

---

## Notes

- `sleep(ms)` is available as a Promise-based delay helper.
- Errors inside `eval(COMMAND)` are caught, logged to console, and shown as an error toast — they do not crash ComfyUI.
- `SELF` always refers to the RunJS node running the current script.
- Bypassed RunJS nodes (`mode !== 0`) are **skipped** by all event listeners.
- `Node()` / `Group()` lookups return the **first** match; use `Nodes()` / `Groups()` for multiples.