"""
@author: shinich39
@title: comfyui-run-js
@nickname: comfyui-run-js
@version: 1.0.0
@description: Manipulate workflow via javascript on node.
"""

from .nodes.node import *

NODE_CLASS_MAPPINGS = {
  "RunJS": RunJS,
}

NODE_DISPLAY_NAME_MAPPINGS = {
  "RunJS": "Run JS",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]