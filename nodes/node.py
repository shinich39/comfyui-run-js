placeholder = ""

# ----- Variables -----
placeholder += "// Variables\n"
placeholder += "SELF: Node\n"
placeholder += "COMMAND: string\n"
placeholder += "STATE: Record<string, any>\n"
placeholder += "PROPS: Record<string, any>\n"
placeholder += "NODES: Node[]\n"
placeholder += "GROUPS: Group[]\n"
placeholder += "LINKS: Link[]\n"
placeholder += "ARGS: any[]\n"
placeholder += "QUEUE_MODE: 'disabled'|'instant'|'change'\n"
placeholder += "BATCH_COUNT: number\n"
placeholder += "\n"

# ----- Node / Group lookup -----
placeholder += "// Lookup\n"
placeholder += "Node(id|title|type) => Node\n"
placeholder += "Nodes(id|title|type) => Node[]\n"
placeholder += "Group(title) => Group\n"
placeholder += "Groups(title) => Group[]\n"
placeholder += "\n"

# ----- Widget values -----
placeholder += "// Widget values\n"
placeholder += "getValues(node) => Record<string, any>\n"
placeholder += "setValues(node, Record<string, any>)\n"
placeholder += "\n"

# ----- Node control -----
placeholder += "// Node control\n"
placeholder += "bypass(...(Node|Group)[])\n"
placeholder += "unbypass(...(Node|Group)[])\n"
placeholder += "pin(...(Node|Group)[])\n"
placeholder += "unpin(...(Node|Group)[])\n"
placeholder += "select(...(Node|Group)[])\n"
placeholder += "remove(...(Node|Group)[])\n"
placeholder += "\n"

# ----- Creation & connection -----
placeholder += "// Creation & connection\n"
placeholder += "create(type, values?, options?) => Node\n"
placeholder += "connect(outputNode, inputNode, outputSlot?, inputSlot?)\n"
placeholder += "\n"

# ----- Queue & generation -----
placeholder += "// Queue & generation\n"
placeholder += "generate() => Promise<void>\n"
placeholder += "cancel() => Promise<void>\n"
placeholder += "getQueue() => Promise<number>\n"
placeholder += "setQueueMode('disabled'|'instant'|'change')\n"
placeholder += "setBatchCount(number)\n"
placeholder += "run(...RunJsNode[])\n"
placeholder += "\n"

# ----- Random helpers -----
placeholder += "// Random helpers\n"
placeholder += "generateSeed() => number\n"
placeholder += "generateFloat(min, max) => number\n"
placeholder += "generateInt(min, max) => number\n"
placeholder += "generatePlots(...any[][]) => any[][]\n"
placeholder += "random(...any[]) => any\n"
placeholder += "\n"

# ----- Notifications -----
placeholder += "// Notifications\n"
placeholder += "showInfo(message, life?)\n"
placeholder += "showSuccess(message, life?)\n"
placeholder += "showWarn(message, life?)\n"
placeholder += "showError(message, life?)\n"
placeholder += "\n"

# ----- Misc -----
placeholder += "// Misc\n"
placeholder += "sleep(ms) => Promise<void>\n"

class RunJS():
  def __init__(self):
    pass

  # @classmethod
  # def IS_CHANGED(self, **kwargs):
  #   return float("NaN")

  @classmethod
  def INPUT_TYPES(cls):
    return {
      "required": {
        "event": ((
          "None",
          "before_queued",
          "after_queued",
          "status",
          "progress",
          "executing",
          "executed",
          "execution_start",
          "execution_success",
          "execution_error",
          "execution_cached",
          "b_preview",
          "comfyui_setup",
          "graph_changed",
          "workflow_changed",
        ),),
        "text": ("STRING", {"default": "", "multiline": True, "placeholder": placeholder}),
      }
    }
  
  CATEGORY = "utils"
  RETURN_TYPES = ()
  RETURN_NAMES = ()
